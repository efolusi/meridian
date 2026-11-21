// Real Chromium with prefers-reduced-motion: reduce emulated (design-tokens docs/motion.md):
//  - a token transition still runs the documented fade, 120 ms, not near zero;
//  - every looping animation in the component CSS stops (no animation, or a run of one iteration with
//    a near-zero duration, so animationend still fires);
//  - nothing travels: a component transition that moves or resizes (transform, inset, top, left, width,
//    flex-basis, ...) is instant under reduce, so a drawer or an indicator does not slide for 120 ms. A
//    transform that only rotates or scales is on the reviewed list below, with the reason.
// Optional argv[2] is an installed playwright entrypoint; EXECUTABLE_PATH picks the browser. No server or network.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium } = await import(process.argv[2] || 'playwright');
const root = new URL('../', import.meta.url);
const read = (file) => readFile(new URL(file, root), 'utf8');
const css = (await Promise.all(['layers', 'colors', 'typography', 'spacing', 'effects', 'base'].map((n) => read(`tokens/${n}.css`)))).join('\n') + '\n' + (await read('registry/components.css'));

// A page that holds one token transition and one loop, and one element per looping rule in the components.
// Transitions whose `transform` only rotates or scales (or flips), so nothing crosses the page. Every other
// transition on transform, translate, inset, top, left, right, bottom, margin, width, height or flex-basis
// must be instant under reduce. A new such rule fails here until it is fixed or reviewed and listed.
const NON_TRAVEL = new Map([
  ['.ef-agentrun__toggle .ef-agentrun__tchev', 'a chevron rotates'], ['.ef-reasoning__chev', 'a chevron rotates'],
  ['.ef-sandbox__chev', 'a chevron rotates'], ['.ef-todo__chev', 'a chevron rotates'], ['.ef-toolcall__chev', 'a chevron rotates'],
  ['.ef-console__stackchev', 'a chevron rotates'], ['.ef-diff__filechev', 'a chevron rotates'], ['.ef-exception__chev', 'a chevron rotates'],
  ['.ef-acc__chev', 'a chevron rotates'], ['.ef-tree__chev', 'a chevron rotates'], ['.ef-navigation-menu__chevron', 'a chevron rotates'],
  ['.ef-pagination__previous svg,.ef-pagination__next svg', 'the arrow only flips in right-to-left, with no transition between states'],
  ['.ef-composer__send', 'press scales the button'], ['.ef-btn', 'press scales the button'], ['.ef-check__box', 'press scales the box'], ['.ef-iconbtn', 'press scales the button'],
  ['.ef-file-input__button', 'press scales the button'], ['.ef-radio__dot', 'press scales the dot'],
  ['.ef-slider__input::-webkit-slider-thumb', 'press scales the thumb'], ['.ef-carousel__nav', 'the translate only centres the button; nothing moves between states'],
  ['.ef-tile__check', 'a check scales in'], ['.ef-check__box svg', 'a check scales in'], ['.ef-radio__dot::after', 'a dot scales in'],
]);
// Selectors the probe cannot build (a pseudo-class or a sibling combinator) and that carry a positional transition.
// Each needs a reviewed reason; an unlisted one fails below, so a new moving transition cannot hide behind an unbuildable selector.
const UNBUILDABLE = new Map([]);
// The same for entrance animations on a selector the probe cannot build.
const UNBUILDABLE_ENTRANCE = new Map([]);
const POSITIONAL = /^(transform|translate|inset(-[\w-]+)?|top|left|right|bottom|margin(-[\w-]+)?|width|height|flex-basis|max-width|max-height)$/;
// [selector, property list] for every rule with a transition.
function transitionRules(text) {
  const out = [];
  for (const m of text.matchAll(/(?<![\w-])([^{}@;]+)\{([^{}]*)\}/g)) {
    const body = m[2];
    const shorthand = body.match(/(?<![\w-])transition\s*:\s*([^;]*)/)?.[1];
    const property = body.match(/transition-property\s*:\s*([^;]*)/)?.[1];
    const list = shorthand ? shorthand.split(/,(?![^(]*\))/).map((part) => part.trim().split(/\s+/)[0]) : property ? property.split(',').map((x) => x.trim()) : [];
    if (list.some((name) => POSITIONAL.test(name))) out.push([m[1].trim().replace(/\s+/g, ' '), list]);
  }
  return out;
}
const travellers = transitionRules(css.replace(/\/\*[\s\S]*?\*\//g, '')).flatMap(([sel, list]) => sel.split(/,(?![^(]*\))/).map((x) => x.trim()).filter(Boolean).map((x) => ({ selector: x, group: sel, list })));
const travelProbes = travellers.map((t) => ({ ...t, built: build(t.selector) }));
const loops = [...css.matchAll(/(?<![\w-])([^{}@]+)\{([^{}]*\binfinite\b[^{}]*)\}/g)].map((m) => m[1].trim()).filter((s) => !/^(from|to|\d+%)/.test(s));
const selectors = [...new Set(loops.flatMap((s) => s.split(',').map((x) => x.trim())).filter(Boolean))];
// Build the ancestry a selector needs: tags, classes and [attr=value] only. A selector with a pseudo-class is skipped.
function build(selector) {
  const m = selector.match(/^(.*?)(::[\w-]+)?$/);
  // Each element is built alone, so the structural pseudo-classes below hold without more markup.
  const parts = m[1].replace(/:(?:first|last|only)-(?:child|of-type)/g, '').split(/\s*>\s*|\s+/).filter(Boolean);
  if (parts.some((p) => /:/.test(p.replace(/\[[^\]]*\]/g, '')) || /[+~]/.test(p.replace(/\[[^\]]*\]/g, '')))) return null;
  let html = '', closing = '';
  parts.forEach((part, i) => {
    const tag = part.match(/^[a-z][\w-]*/)?.[0] ?? 'div';
    const classes = [...part.matchAll(/\.([\w-]+)/g)].map((c) => c[1]).join(' ');
    const attrs = [...part.matchAll(/\[([\w-]+)(?:=["']?([^\]"']*)["']?)?\]/g)].map((a) => ` ${a[1]}="${a[2] ?? ''}"`).join('');
    html += `<${tag} class="${classes}"${attrs}${i === parts.length - 1 ? ' data-probe' : ''}>`;
    closing = `</${tag}>` + closing;
  });
  return { html: html + closing, pseudo: m[2] ?? null };
}
// Entrance animations (one run, not infinite). Under reduce they must be an opacity-only fade of the 120 ms token, not a snap and not a slide.
const entrances = [...new Set([...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(?<![\w-])([^{}@;]+)\{([^{}]*\banimation:\s*(ef-[\w-]+)(?![^{};]*\binfinite\b)[^{}]*)\}/g)].flatMap((m) => m[1].split(/,(?![^(]*\))/).map((x) => x.trim()).filter(Boolean).map((x) => x + '\u0000' + m[3])))].map((x) => { const [selector, name] = x.split('\u0000'); return { selector, name, built: build(selector) }; });
// Entrances that end on their final state at once, reviewed: the hero stroke draws itself, and reduce shows the finished stroke.
const ENTRANCE_SNAP = new Map([['.ef-hero-accent path', 'the stroke is drawn in full, with no draw-in']]);
const entranceVerifiable = entrances.filter((p) => p.built);
const unbuiltEntrances = entrances.filter((p) => !p.built && !UNBUILDABLE_ENTRANCE.has(p.selector)).map((p) => p.selector);
const probes = selectors.map((s) => ({ selector: s, built: build(s) }));
const verifiable = probes.filter((p) => p.built);
const travelVerifiable = travelProbes.filter((p) => p.built);
const fixture = `<!doctype html><html><head><style>${css}
@keyframes probe-spin{to{transform:rotate(1turn)}}
#fade{opacity:1;transition:opacity var(--dur-base) var(--ease-enter)}#fade.off{opacity:0}
#loop{animation:probe-spin 1s linear infinite}</style></head><body><div id="fade">fade</div><div id="loop">loop</div>
${verifiable.map((p, i) => `<div data-i="${i}">${p.built.html}</div>`).join('\n')}
${entranceVerifiable.map((p, i) => `<div data-e="${i}">${p.built.html}</div>`).join('\n')}
${travelVerifiable.map((p, i) => `<div data-t="${i}">${p.built.html}</div>`).join('\n')}</body></html>`;

const browser = await chromium.launch(process.env.EXECUTABLE_PATH ? { executablePath: process.env.EXECUTABLE_PATH } : {});
try {
  const run = async (reducedMotion) => {
    const page = await browser.newPage({ reducedMotion });
    await page.route('**/*', (route) => route.abort());
    await page.setContent(fixture);
    const result = await page.evaluate(async ([probeList, travelList, entranceList]) => {
      const style = (el, pseudo) => getComputedStyle(el, pseudo);
      const fade = document.getElementById('fade');
      const computed = style(fade).transitionDuration;
      const elapsed = await new Promise((resolve) => {
        const start = performance.now();
        fade.addEventListener('transitionend', () => resolve(performance.now() - start), { once: true });
        fade.classList.add('off');
        setTimeout(() => resolve(-1), 2000);
      });
      const loop = style(document.getElementById('loop'));
      const loopEnded = await new Promise((resolve) => {
        const el = document.getElementById('loop');
        el.addEventListener('animationend', () => resolve(true), { once: true });
        // The first run ended during load, before the listener: restart the animation.
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = '';
        setTimeout(() => resolve(false), 400);
      });
      const components = probeList.map((p, i) => {
        const el = document.querySelector(`[data-i="${i}"] [data-probe]`);
        if (!el) return { selector: p.selector, missing: true };
        const s = style(el, p.pseudo);
        return { selector: p.selector, name: s.animationName, duration: s.animationDuration, count: s.animationIterationCount };
      });
      const travel = travelList.map((p, i) => {
        const el = document.querySelector(`[data-t="${i}"] [data-probe]`);
        if (!el) return { selector: p.selector, missing: true };
        const s = style(el, p.pseudo);
        return { selector: p.selector, properties: s.transitionProperty.split(',').map((x) => x.trim()), durations: s.transitionDuration.split(',').map((x) => Number.parseFloat(x)) };
      });
      // The last @keyframes rule of a name wins; the media query that redefines it applies only when it matches.
      const keyframes = (name) => {
        let found = null;
        const walk = (rules) => { for (const r of rules) { if (r.type === CSSRule.KEYFRAMES_RULE && r.name === name) found = r; else if (r.cssRules && (r.type !== CSSRule.MEDIA_RULE || matchMedia(r.conditionText).matches)) walk(r.cssRules); } };
        for (const sheet of document.styleSheets) walk(sheet.cssRules);
        return found;
      };
      const entrances = entranceList.map((p, i) => {
        const el = document.querySelector(`[data-e="${i}"] [data-probe]`);
        if (!el) return { selector: p.selector, missing: true };
        const s = style(el, p.pseudo);
        const rule = keyframes(s.animationName);
        const props = rule ? [...new Set([...rule.cssRules].flatMap((k) => [...k.style]))] : [];
        return { selector: p.selector, name: s.animationName, duration: Number.parseFloat(s.animationDuration), props };
      });
      // A View Transition: its pseudo-elements do not match `*`, so the guard names them. Groups stop moving; snapshots fade.
      let viewTransition = null;
      if (document.startViewTransition) {
        const transition = document.startViewTransition(() => {});
        await transition.ready.catch(() => {});
        const root = document.documentElement;
        const read = (pseudo) => Number.parseFloat(getComputedStyle(root, pseudo).animationDuration);
        viewTransition = { group: read('::view-transition-group(root)'), old: read('::view-transition-old(root)'), now: read('::view-transition-new(root)') };
        transition.skipTransition();
      }
      return { viewTransition, entrances, travel, computed, elapsed, loop: { name: loop.animationName, duration: loop.animationDuration, count: loop.animationIterationCount, ended: loopEnded }, components };
    }, [verifiable.map((p) => ({ selector: p.selector, pseudo: p.built.pseudo })), travelVerifiable.map((p) => ({ selector: p.selector, pseudo: p.built.pseudo })), entranceVerifiable.map((p) => ({ selector: p.selector, pseudo: p.built.pseudo }))]);
    await page.close();
    return result;
  };

  const calm = await run('reduce');
  // The documented fade: 120 ms, from --dur-fast through the reduced-motion swap of --dur-base.
  assert.equal(calm.computed, '0.12s', `a token transition under reduce computes ${calm.computed}, expected the 120 ms fade`);
  assert.ok(calm.elapsed >= 100 && calm.elapsed < 400, `the fade ran ${Math.round(calm.elapsed)} ms, expected about 120 ms`);
  assert.ok(calm.loop.name === 'none' || (Number.parseFloat(calm.loop.duration) <= 0.001 && calm.loop.count === '1'), `the probe loop is still running: ${JSON.stringify(calm.loop)}`);
  assert.ok(calm.loop.ended, 'animationend still fires for a stopped loop');
  const running = calm.components.filter((c) => !c.missing && c.name !== 'none' && !(Number.parseFloat(c.duration) <= 0.001 && c.count === '1'));
  assert.deepEqual(running, [], `component loops still running under reduce:\n${JSON.stringify(running, null, 2)}`);
  const unmatched = calm.components.filter((c) => c.missing).map((c) => c.selector);
  assert.equal(unmatched.length, 0, `could not build an element for: ${unmatched.join(' | ')}`);

  // Nothing travels: under reduce, every positional property in a transition is instant, except the reviewed rotations and scales.
  const travelling = [];
  const isPositional = (name) => POSITIONAL.test(name);
  for (const t of calm.travel) {
    if (t.missing) continue;
    t.properties.forEach((name, i) => {
      const duration = t.durations[i % t.durations.length];
      if (!isPositional(name) || !(duration > 0.001)) return;
      if (name === 'transform' && NON_TRAVEL.has(travelVerifiable.find((p) => p.selector === t.selector)?.group)) return;
      travelling.push(`${t.selector}: ${name} ${duration}s`);
    });
  }
  assert.deepEqual(travelling, [], `these transitions still move or resize for a moment under reduce (make them instant, or fade opacity only):\n  ${travelling.join('\n  ')}`);
  assert.deepEqual(unbuiltEntrances, [], `entrance animations the probe cannot build (simplify the selector, or list them in UNBUILDABLE_ENTRANCE with a reason):\n  ${unbuiltEntrances.join('\n  ')}`);
  assert.ok(calm.viewTransition, 'View Transitions are not available in the check browser, so the reduced-motion rule for them is not proven');
  {
    const { group, old, now } = calm.viewTransition;
    assert.ok(group <= 0.001, `a View Transition group still moves under reduce (${group}s)`);
    assert.ok(old > 0.1 && old < 0.2 && now > 0.1 && now < 0.2, `View Transition snapshots should fade over 120 ms under reduce (old ${old}s, new ${now}s)`);
  }
  // Entrances: a 120 ms fade of opacity only. A snap (no duration) or a slide (any other property) fails.
  const entranceFaults = calm.entrances.filter((e) => !e.missing && !ENTRANCE_SNAP.has(e.selector)).flatMap((e) => [
    ...(e.name === 'none' || !(e.duration > 0.1 && e.duration < 0.2) ? [`${e.selector}: runs ${e.duration}s (${e.name}), expected the 120 ms fade`] : []),
    ...(e.props.some((x) => x !== 'opacity') ? [`${e.selector}: ${e.name} still sets ${e.props.filter((x) => x !== 'opacity').join(', ')}`] : []),
  ]);
  assert.deepEqual(entranceFaults, [], `these entrances still snap or move under reduce (an opacity-only keyframe at --dur-fast):\n  ${entranceFaults.join('\n  ')}`);
  const unbuilt = travelProbes.filter((p) => !p.built).map((p) => p.selector);
  const unreviewed = unbuilt.filter((s) => !UNBUILDABLE.has(s));
  assert.deepEqual(unreviewed, [], `positional transitions the probe cannot build (make them instant, simplify the selector, or list them in UNBUILDABLE with a reason):\n  ${unreviewed.join('\n  ')}`);
  const staleUnbuildable = [...UNBUILDABLE.keys()].filter((s) => !unbuilt.includes(s));
  assert.deepEqual(staleUnbuildable, [], `UNBUILDABLE selectors that are now built or gone: ${staleUnbuildable.join(' | ')}`);
  const staleReview = [...NON_TRAVEL.keys()].filter((sel) => !travellers.some((t) => t.group === sel));
  assert.deepEqual(staleReview, [], `reviewed non-travel selectors that no longer have a transition: ${staleReview.join(' | ')}`);

  // The control: without the preference the same page uses the full tokens and the loop runs.
  const full = await run('no-preference');
  assert.equal(full.computed, '0.2s', `no preference: --dur-base computes ${full.computed}, expected 200 ms`);
  assert.equal(full.loop.count, 'infinite', 'no preference: the loop runs');

  const skipped = probes.filter((p) => !p.built).map((p) => p.selector);
  console.log(`Reduced motion: the token fade runs ${Math.round(calm.elapsed)} ms (0.12s); ${verifiable.length} component loop selector(s) stop${skipped.length ? `; ${skipped.length} with a pseudo-class not exercised: ${skipped.join(' | ')}` : ''}; ${travelVerifiable.length} positional transition selector(s) are instant or reviewed; ${entranceVerifiable.length} entrance animation(s) are a 120 ms opacity fade${unbuilt.length ? `, ${unbuilt.length} not exercised (${unbuilt.join(' | ')})` : ''}.`);
} finally {
  await browser.close();
}
