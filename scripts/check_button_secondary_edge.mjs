// Real Chromium: the secondary Button's edge is 3:1 or more against the surface it sits on, light and dark, and its label
// stays 12:1 (MD151, WCAG 1.4.11). The fill is transparent, so the edge is the only boundary; --border-strong (a divider tone)
// was 1.5:1 in light and 1.63:1 in dark against the page. Measured on the rendered colours: the button's computed border colour
// against the computed background of the surface behind it (page, then card), at rest and with a real mouse over it (the hover
// fill is --surface-sunken), for the plain and the pill xl button (the hero pair). The old --border-strong ratio is printed for the record.
// Components come from _ds_bundle.js with React from node_modules, served by a route handler: no server, no network.
// Optional argv[2] is an installed playwright entrypoint; EXECUTABLE_PATH picks the browser.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const { chromium } = await import(process.argv[2] || 'playwright');
const root = new URL('../', import.meta.url).pathname;
const ORIGIN = 'http://meridian.test';
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const page0 = (theme) => `<!doctype html><html data-theme="${theme}"><head><meta charset="utf-8">
<link rel="stylesheet" href="/styles.css">
<script src="/node_modules/react/umd/react.development.js"></script>
<script src="/node_modules/react-dom/umd/react-dom.development.js"></script>
<script src="/_ds_bundle.js"></script></head><body style="margin:0;padding:24px;background:var(--surface-page);color:var(--text-primary)"><div id="host"></div></body></html>`;

const rgb = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number);
const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [hi, lo] = [lum(rgb(a)), lum(rgb(b))].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

const browser = await chromium.launch(process.env.EXECUTABLE_PATH ? { executablePath: process.env.EXECUTABLE_PATH } : {});
let checked = 0;
try {
  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    const problems = [];
    page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
    await page.route(`${ORIGIN}/**`, async (route) => {
      const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
      if (pathname === '/') return route.fulfill({ status: 200, contentType: 'text/html', body: page0(theme) });
      const file = path.join(root, pathname);
      if (!file.startsWith(root)) return route.fulfill({ status: 403, body: '' });
      try { await route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: await readFile(file) }); }
      catch { await route.fulfill({ status: 404, body: '' }); }
    });
    await page.goto(`${ORIGIN}/`, { waitUntil: 'load' });
    await page.evaluate(() => {
      const C = window.EfolusiDesignSystem_4ffc3d, h = React.createElement;
      const row = (id, surface) => h('div', { id, style: { display: 'flex', gap: '16px', padding: '24px', background: surface, marginBottom: '16px' } },
        h(C.Button, { variant: 'secondary', 'data-case': 'md' }, 'Export'),
        h(C.Button, { variant: 'secondary', shape: 'pill', size: 'xl', 'data-case': 'pill' }, 'Read the docs'));
      ReactDOM.flushSync(() => ReactDOM.createRoot(document.getElementById('host')).render(h(React.Fragment, null,
        row('on-page', 'var(--surface-page)'), row('on-card', 'var(--surface-card)'))));
    });
    await page.evaluate(() => document.fonts.ready);
    const read = (sel) => page.evaluate((s) => {
      const el = document.querySelector(s), cs = getComputedStyle(el);
      const strong = getComputedStyle(document.documentElement).getPropertyValue('--border-strong').trim();
      const probe = document.createElement('i'); probe.style.color = strong; document.body.append(probe);
      const strongRgb = getComputedStyle(probe).color; probe.remove();
      const surface = getComputedStyle(el.parentElement).backgroundColor;
      return { edge: cs.borderTopColor, width: cs.borderTopWidth, fill: cs.backgroundColor, ink: cs.color, surface, strongRgb };
    }, sel);
    for (const where of ['on-page', 'on-card']) {
      for (const kind of ['md', 'pill']) {
        const sel = `#${where} [data-case=${kind}]`;
        const rest = await read(sel);
        const name = `${theme} ${where} ${kind}`;
        assert.equal(rest.width, '1px', `${name}: a 1px edge`);
        assert.equal(rest.fill, 'rgba(0, 0, 0, 0)', `${name}: the fill is transparent`);
        const edge = ratio(rest.edge, rest.surface), label = ratio(rest.ink, rest.surface), old = ratio(rest.strongRgb, rest.surface);
        assert.ok(edge >= 3, `${name}: edge ${edge.toFixed(2)}:1 against ${rest.surface} must be 3:1 or more`);
        assert.ok(label >= 12, `${name}: label ${label.toFixed(2)}:1 must stay 12:1 or more`);
        await page.hover(sel);
        await page.waitForTimeout(250);
        const hover = await read(sel);
        const hoverEdge = ratio(hover.edge, hover.fill.startsWith('rgba(0, 0, 0, 0)') ? hover.surface : hover.fill);
        assert.ok(hoverEdge >= 3, `${name} hover: edge ${hoverEdge.toFixed(2)}:1 against its hover fill ${hover.fill} must be 3:1 or more`);
        checked += 5;
        console.log(`ok ${name}: edge ${edge.toFixed(2)}:1 (was ${old.toFixed(2)}:1 with --border-strong), hover edge ${hoverEdge.toFixed(2)}:1, label ${label.toFixed(2)}:1`);
      }
    }
    assert.deepEqual(problems, [], `${theme}: no page error`);
    await ctx.close();
  }
} finally { await browser.close(); }
console.log(`check_button_secondary_edge: ${checked} assertions passed`);
