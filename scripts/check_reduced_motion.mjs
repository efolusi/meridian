// Real Chromium with prefers-reduced-motion: reduce emulated (design-tokens docs/motion.md):
//  - a token transition still runs the documented fade, 120 ms, not near zero;
//  - every looping animation in the component CSS stops (no animation, or a run of one iteration with
//    a near-zero duration, so animationend still fires).
// Optional argv[2] is an installed playwright entrypoint; EXECUTABLE_PATH picks the browser. No server or network.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium } = await import(process.argv[2] || 'playwright');
const root = new URL('../', import.meta.url);
const read = (file) => readFile(new URL(file, root), 'utf8');
const css = (await Promise.all(['layers', 'colors', 'typography', 'spacing', 'effects', 'base'].map((n) => read(`tokens/${n}.css`)))).join('\n') + '\n' + (await read('registry/components.css'));

// A page that holds one token transition and one loop, and one element per looping rule in the components.
const loops = [...css.matchAll(/(?<![\w-])([^{}@]+)\{([^{}]*\binfinite\b[^{}]*)\}/g)].map((m) => m[1].trim()).filter((s) => !/^(from|to|\d+%)/.test(s));
const selectors = [...new Set(loops.flatMap((s) => s.split(',').map((x) => x.trim())).filter(Boolean))];
// Build the ancestry a selector needs: tags, classes and [attr=value] only. A selector with a pseudo-class is skipped.
function build(selector) {
  const m = selector.match(/^(.*?)(::[\w-]+)?$/);
  // Each element is built alone, so the structural pseudo-classes below hold without more markup.
  const parts = m[1].replace(/:(?:first|last|only)-(?:child|of-type)/g, '').split(/\s*>\s*|\s+/).filter(Boolean);
  if (parts.some((p) => /:/.test(p.replace(/\[[^\]]*\]/g, '')))) return null;
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
const probes = selectors.map((s) => ({ selector: s, built: build(s) }));
const verifiable = probes.filter((p) => p.built);
const fixture = `<!doctype html><html><head><style>${css}
@keyframes probe-spin{to{transform:rotate(1turn)}}
#fade{opacity:1;transition:opacity var(--dur-base) var(--ease-enter)}#fade.off{opacity:0}
#loop{animation:probe-spin 1s linear infinite}</style></head><body><div id="fade">fade</div><div id="loop">loop</div>
${verifiable.map((p, i) => `<div data-i="${i}">${p.built.html}</div>`).join('\n')}</body></html>`;

const browser = await chromium.launch(process.env.EXECUTABLE_PATH ? { executablePath: process.env.EXECUTABLE_PATH } : {});
try {
  const run = async (reducedMotion) => {
    const page = await browser.newPage({ reducedMotion });
    await page.route('**/*', (route) => route.abort());
    await page.setContent(fixture);
    const result = await page.evaluate(async (probeList) => {
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
      return { computed, elapsed, loop: { name: loop.animationName, duration: loop.animationDuration, count: loop.animationIterationCount, ended: loopEnded }, components };
    }, verifiable.map((p) => ({ selector: p.selector, pseudo: p.built.pseudo })));
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

  // The control: without the preference the same page uses the full tokens and the loop runs.
  const full = await run('no-preference');
  assert.equal(full.computed, '0.2s', `no preference: --dur-base computes ${full.computed}, expected 200 ms`);
  assert.equal(full.loop.count, 'infinite', 'no preference: the loop runs');

  const skipped = probes.filter((p) => !p.built).map((p) => p.selector);
  console.log(`Reduced motion: the token fade runs ${Math.round(calm.elapsed)} ms (0.12s); ${verifiable.length} component loop selector(s) stop${skipped.length ? `; ${skipped.length} with a pseudo-class not exercised: ${skipped.join(' | ')}` : ''}.`);
} finally {
  await browser.close();
}
