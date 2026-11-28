// Real Chromium: Button as a link (MD146) is the same button, with link semantics.
// jsdom cannot show any of this: it has no layout, no keyboard activation, no :hover or :focus-visible and no real navigation.
// For each direction and theme this renders pairs of <Button> and <Button href> (and an asChild link) from _ds_bundle.js and checks:
//   1. Parity: the link and the button have the same box, colours, ring, bubble and arrow, at rest, on hover and on keyboard focus.
//      The arrow-up-right bubble turns 45 degrees on both (-45 in right-to-left) and rests under reduced motion.
//   2. Link semantics: Enter on a focused link follows it, Space does not (it scrolls the page); on a button both press it.
//   3. A loading or disabled link is out of the tab order, says aria-disabled, and neither Enter, a click nor a middle click follows it.
//   4. A link marked up by the page and the asChild link of a router are the same element as the href link.
// Components come from _ds_bundle.js with React from node_modules, served by a route handler: no server, no network.
// Optional argv[2] is an installed playwright entrypoint; EXECUTABLE_PATH picks the browser.
// BUTTON_LINK_SHOTS=<dir> writes (local only, not in CI) light and dark pictures of link and button side by side at rest, hover and focus (both forced at once through CDP).
import { readFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const { chromium } = await import(process.argv[2] || 'playwright');
const root = new URL('../', import.meta.url).pathname;
const ORIGIN = 'http://meridian.test';
const shots = process.env.BUTTON_LINK_SHOTS || '';
if (shots) await mkdir(shots, { recursive: true });

const page0 = (theme, dir) => `<!doctype html><html data-theme="${theme}" dir="${dir}"><head><meta charset="utf-8">
<link rel="stylesheet" href="/styles.css">
<script src="/node_modules/react/umd/react.development.js"></script>
<script src="/node_modules/react-dom/umd/react-dom.development.js"></script>
<script src="/_ds_bundle.js"></script></head><body style="margin:0;padding:24px;background:var(--surface-page);min-height:3000px"><div id="host"></div></body></html>`;

// Each pair is a <Button> and a <Button href>, same props and label. `onBand` puts the pair on a brand band.
const PAIRS = [
  { id: 'primary-xl', props: { size: 'xl', shape: 'pill', iconBubble: 'arrow-up-right' }, label: 'Start free' },
  { id: 'primary-lg', props: { size: 'lg', iconBubble: 'arrow-right' }, label: 'Book a call' },
  { id: 'secondary-lg', props: { size: 'lg', variant: 'secondary', iconBubble: 'arrow-up-right' }, label: 'Read the docs' },
  { id: 'secondary-md', props: { variant: 'secondary' }, label: 'Export' },
  { id: 'ghost-sm', props: { variant: 'ghost', size: 'sm', iconLeft: 'download' }, label: 'Download' },
  { id: 'link-md', props: { variant: 'link' }, label: 'Read more' },
  { id: 'danger-md', props: { variant: 'danger', iconRight: 'arrow-right' }, label: 'Delete project' },
  { id: 'band-xl', props: { size: 'xl', variant: 'band', shape: 'pill', iconBubble: 'arrow-up-right' }, label: 'See the plans', onBand: true },
];
const TURN = 'primary-xl'; // the pair whose arrow is arrow-up-right on a primary

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const browser = await chromium.launch(process.env.EXECUTABLE_PATH ? { executablePath: process.env.EXECUTABLE_PATH } : {});
let checked = 0;
const ok = (n = 1) => { checked += n; };

async function open(dir, theme, { reducedMotion = 'no-preference' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 700 }, reducedMotion });
  const page = await ctx.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
  await page.route(`${ORIGIN}/**`, async (route) => {
    const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
    if (pathname === '/') return route.fulfill({ status: 200, contentType: 'text/html', body: page0(theme, dir) });
    const file = path.join(root, pathname);
    if (!file.startsWith(root)) return route.fulfill({ status: 403, body: '' });
    try { await route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: await readFile(file) }); }
    catch { await route.fulfill({ status: 404, body: '' }); }
  });
  await page.goto(`${ORIGIN}/`, { waitUntil: 'load' });
  assert.deepEqual(await page.evaluate(() => window.EfolusiDesignSystem_4ffc3d.__errors), [], 'the bundle must load clean');
  await page.evaluate((pairs) => {
    const C = window.EfolusiDesignSystem_4ffc3d, h = React.createElement;
    // A stand-in for a router link (a Next.js Link with its locale): its own component, its own href.
    const RouterLink = React.forwardRef(function RouterLink({ to, children, ...p }, ref) { return h('a', { ref, href: `#hit-${to}`, 'data-router': '', ...p }, children); });
    const cell = (p, kind) => {
      const id = `${kind}-${p.id}`;
      const common = { ...p.props, id, key: id };
      if (kind === 'b') return h(C.Button, common, p.label);
      if (kind === 'a') return h(C.Button, { ...common, href: `#hit-${p.id}` }, p.label);
      return h(C.Button, { ...p.props, id, key: id, asChild: true }, h(RouterLink, { to: p.id }, p.label));
    };
    const row = (p) => h('div', { key: p.id, style: { display: 'flex', gap: 16, alignItems: 'center', padding: p.onBand ? 16 : 0, background: p.onBand ? 'var(--surface-brand)' : 'none', borderRadius: 12 } },
      cell(p, 'b'), cell(p, 'a'), cell(p, 'c'));
    const state = [
      h(C.Button, { key: 'l-load', id: 'a-loading', href: '#hit-loading', loading: true }, 'Loading link'),
      h(C.Button, { key: 'l-dis', id: 'a-disabled', href: '#hit-disabled', disabled: true }, 'Disabled link'),
      h(C.Button, { key: 'l-bub', id: 'a-loading-bubble', href: '#hit-loading-bubble', size: 'lg', iconBubble: 'arrow-right', loading: true }, 'Loading bubble'),
      h(C.Button, { key: 'b-load', id: 'b-loading', loading: true }, 'Loading button'),
      h(C.Button, { key: 'b-dis', id: 'b-disabled', disabled: true }, 'Disabled button'),
      h('a', { key: 'after', id: 'after', href: '#after' }, 'After'),
    ];
    ReactDOM.flushSync(() => ReactDOM.createRoot(document.getElementById('host')).render(
      h('div', { id: 'grid', style: { display: 'grid', gap: 14, width: 'max-content' } }, ...pairs.map(row), h('div', { key: 'state', style: { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' } }, ...state))));
    window.__clicks = [];
    document.addEventListener('click', (e) => window.__clicks.push({ id: e.target.closest('[id]')?.id, prevented: e.defaultPrevented }));
  }, PAIRS);
  return { ctx, page, problems };
}

const settle = (page) => page.evaluate(async () => {
  getComputedStyle(document.body).color;
  await Promise.race([Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))), new Promise((r) => setTimeout(r, 1500))]);
});

// Everything that makes the link look different from the button, read from the rendered boxes.
const measure = (page, id) => page.evaluate((id) => {
  const el = document.getElementById(id);
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const bubble = el.querySelector('.ef-btn__bubble');
  const icon = bubble && bubble.querySelector('[data-slot="icon"]');
  const br = bubble && bubble.getBoundingClientRect();
  const ics = icon && getComputedStyle(icon);
  const pick = (c, names) => Object.fromEntries(names.map((n) => [n, c[n]]));
  return {
    box: { w: r.width, h: r.height },
    style: pick(cs, ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'borderTopLeftRadius', 'borderTopWidth', 'borderTopColor', 'backgroundColor', 'color', 'boxShadow', 'fontSize', 'fontWeight', 'lineHeight', 'fontFamily', 'textDecorationLine', 'opacity', 'transform', 'cursor', 'display', 'gap']),
    bubble: bubble && { w: br.width, h: br.height, bg: getComputedStyle(bubble).backgroundColor, fg: getComputedStyle(bubble).color, rotate: ics.rotate, translate: ics.translate },
    inner: el.innerHTML,
  };
}, id);

const rects = (page, sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().toJSON(), sel);
const center = async (page, id) => { const r = await rects(page, `#${id}`); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; };

async function reset(page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); location.hash = ''; window.__clicks.length = 0; });
  await page.evaluate(() => { window.__clicks.length = 0; });
}

const forced = (page, ids, pseudo) => page.context().newCDPSession(page).then(async (cdp) => {
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root: doc } = await cdp.send('DOM.getDocument', { depth: 0 });
  for (const id of ids) {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: doc.nodeId, selector: `#${id}` });
    await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: pseudo });
  }
  return cdp;
});

try {
  for (const dir of ['ltr', 'rtl']) {
    for (const theme of ['light', 'dark']) {
      const where = `${dir} ${theme}`;
      const { ctx, page, problems } = await open(dir, theme);

      // 1. Parity, at rest, on hover and on keyboard focus.
      for (const p of PAIRS) {
        const ids = { b: `b-${p.id}`, a: `a-${p.id}`, c: `c-${p.id}` };
        const readState = async (state, id) => {
          await reset(page);
          if (state === 'hover') await page.mouse.move(...Object.values(await center(page, id)));
          if (state === 'focus') { await page.evaluate(() => document.getElementById('grid').scrollIntoView()); await page.focus(`#${id}`); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); }
          await settle(page);
          if (state === 'focus') assert.equal(await page.evaluate(() => document.activeElement.id), id, `${where}: ${id} takes keyboard focus`);
          return measure(page, id);
        };
        for (const state of ['rest', 'hover', 'focus']) {
          const b = await readState(state, ids.b);
          for (const kind of ['a', 'c']) {
            const l = await readState(state, ids[kind]);
            const tag = `${where} ${p.id} ${state} (${kind === 'a' ? 'href' : 'asChild'})`;
            assert.deepEqual(l.box, b.box, `${tag}: the link has the box of the button`);
            assert.deepEqual(l.style, b.style, `${tag}: the link has the computed style of the button`);
            assert.deepEqual(l.bubble, b.bubble, `${tag}: the link has the bubble and the arrow of the button`);
            assert.equal(l.inner, b.inner, `${tag}: the link has the inner markup of the button`);
            ok(4);
          }
          if (state === 'focus') {
            const ring = (await readState('focus', ids.a)).style.boxShadow;
            assert.notEqual(ring, 'none', `${where} ${p.id}: the focus ring shows on the link`);
            ok();
          }
          if (state === 'hover' && p.id === TURN) {
            const l = await readState('hover', ids.a);
            const want = dir === 'rtl' ? '-45deg' : '45deg';
            assert.equal(l.bubble.rotate, want, `${where}: the arrow-up-right turns ${want} on the link on hover`);
            ok();
          }
        }
      }

      // 2. Keyboard semantics: Enter follows a link, Space does not; a button takes both.
      await reset(page);
      await page.evaluate(() => document.getElementById('grid').scrollIntoView());
      await page.focus('#a-primary-xl'); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'a-primary-xl');
      await page.keyboard.press('Space');
      let state = await page.evaluate(() => ({ hash: location.hash, clicks: window.__clicks.length, y: window.scrollY }));
      assert.equal(state.hash, '', `${where}: Space does not follow a link`);
      assert.equal(state.clicks, 0, `${where}: Space does not click a link`);
      await page.keyboard.press('Enter');
      state = await page.evaluate(() => ({ hash: location.hash, clicks: window.__clicks.map((c) => c.id) }));
      assert.equal(state.hash, '#hit-primary-xl', `${where}: Enter follows a link`);
      assert.deepEqual(state.clicks, ['a-primary-xl']);
      ok(4);
      await reset(page);
      await page.focus('#c-primary-xl');
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => location.hash), '#hit-primary-xl', `${where}: Enter follows the router link of asChild`);
      await reset(page);
      await page.focus('#c-primary-xl');
      await page.keyboard.press('Space');
      assert.equal(await page.evaluate(() => location.hash), '', `${where}: Space does not follow the router link of asChild`);
      ok(2);
      await reset(page);
      await page.focus('#b-primary-xl');
      await page.keyboard.press('Space');
      await page.keyboard.press('Enter');
      assert.deepEqual(await page.evaluate(() => window.__clicks.map((c) => c.id)), ['b-primary-xl', 'b-primary-xl'], `${where}: a button takes Space and Enter`);
      ok();

      // 3. Blocked links: out of the tab order, aria-disabled, no Enter, no click, no middle click.
      for (const id of ['a-loading', 'a-disabled', 'a-loading-bubble']) {
        const attrs = await page.evaluate((id) => { const e = document.getElementById(id); return { tag: e.tagName, disabled: e.hasAttribute('disabled'), ariaDisabled: e.getAttribute('aria-disabled'), tabindex: e.getAttribute('tabindex'), busy: e.getAttribute('aria-busy'), href: e.getAttribute('href') }; }, id);
        assert.equal(attrs.tag, 'A'); assert.equal(attrs.disabled, false); assert.equal(attrs.ariaDisabled, 'true'); assert.equal(attrs.tabindex, '-1');
        assert.equal(attrs.busy, id === 'a-disabled' ? null : 'true', `${where}: ${id} aria-busy`);
        assert.ok(attrs.href, `${where}: ${id} keeps its href`);
        ok(6);
      }
      await reset(page);
      await page.focus('#a-primary-xl');
      const order = [];
      for (let i = 0; i < 60; i++) {
        await page.keyboard.press('Tab');
        const id = await page.evaluate(() => document.activeElement.id);
        order.push(id);
        if (id === 'after' || !id) break;
      }
      for (const id of ['a-loading', 'a-disabled', 'a-loading-bubble', 'b-disabled']) assert.ok(!order.includes(id), `${where}: Tab skips ${id} (reached ${order.join(', ')})`);
      assert.ok(order.includes('after'), `${where}: Tab goes on to the next control`);
      ok(5);
      for (const id of ['a-loading', 'a-disabled', 'a-loading-bubble']) {
        await reset(page);
        await page.evaluate((id) => document.getElementById(id).focus(), id); // a script can still focus it; the keys must do nothing
        await page.keyboard.press('Enter');
        await page.evaluate((id) => document.getElementById(id).scrollIntoView(), id);
        await page.mouse.click(...Object.values(await center(page, id)));
        const pagesBefore = ctx.pages().length;
        await page.mouse.click(...Object.values(await center(page, id)), { button: 'middle' });
        await page.waitForTimeout(150);
        const after = await page.evaluate(() => ({ hash: location.hash, clicks: window.__clicks.filter((c) => c.id && c.id.startsWith('a-')) }));
        assert.equal(after.hash, '', `${where}: ${id} is not followed (Enter, click)`);
        assert.ok(after.clicks.every((c) => c.prevented), `${where}: every click on ${id} is prevented (${JSON.stringify(after.clicks)})`);
        assert.equal(ctx.pages().length, pagesBefore, `${where}: a middle click on ${id} opens nothing`);
        ok(3);
      }

      // 4. The loading link keeps its look: the spinner runs and the label does not move.
      const spin = await page.evaluate(() => { const s = document.querySelector('#a-loading .ef-btn__spin'); return s && getComputedStyle(s).animationName; });
      assert.ok(spin && spin !== 'none', `${where}: the spinner of a loading link turns`);
      ok();
      assert.deepEqual(problems, [], `${where}: no page errors`);

      // Pictures: link and button side by side, rest, hover and focus-visible forced on every element at once.
      if (shots) {
        await reset(page);
        const clip = async () => { const r = await rects(page, '#grid'); return { x: Math.max(0, r.x - 16), y: Math.max(0, r.y - 16), width: r.width + 32, height: r.height + 32 }; };
        await page.screenshot({ path: path.join(shots, `${theme}-${dir}-rest.png`), clip: await clip() });
        const ids = [...PAIRS.flatMap((p) => [`b-${p.id}`, `a-${p.id}`, `c-${p.id}`]), 'a-loading', 'a-disabled', 'a-loading-bubble', 'b-loading', 'b-disabled'];
        let cdp = await forced(page, ids, ['hover']);
        await settle(page); await page.screenshot({ path: path.join(shots, `${theme}-${dir}-hover.png`), clip: await clip() });
        await cdp.detach();
        cdp = await forced(page, ids, ['focus', 'focus-visible']);
        await settle(page); await page.screenshot({ path: path.join(shots, `${theme}-${dir}-focus.png`), clip: await clip() });
        await cdp.detach();
      }
      await ctx.close();
    }
  }

  // Reduced motion: the arrow does not turn on hover, on the link as on the button.
  {
    const { ctx, page } = await open('ltr', 'light', { reducedMotion: 'reduce' });
    for (const id of ['a-primary-xl', 'b-primary-xl', 'c-primary-xl']) {
      await reset(page);
      await page.mouse.move(...Object.values(await center(page, id)));
      await settle(page);
      const m = await measure(page, id);
      assert.equal(m.bubble.rotate, 'none', `${id}: the arrow rests under reduced motion (${m.bubble.rotate})`);
      ok();
    }
    await ctx.close();
  }
  console.log(`check_button_link: ${checked} checks passed (ltr and rtl, light and dark)`);
} finally {
  await browser.close();
}
