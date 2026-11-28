// Real Chromium: LanguageSwitch size md renders 36px at a fine pointer, 30px in compact density and 44px at a coarse pointer;
// size sm renders 28px, 24px and 44px (MD150). The d.ts, the prompt and the docs say exactly this; tests/md150-*.test.mjs reads
// their words, this reads the render, so the two cannot drift apart. The ThemeToggle is measured beside it: same size as md.
// Components come from _ds_bundle.js with React from node_modules, served by a route handler: no server, no network.
// Optional argv[2] is an installed playwright entrypoint; EXECUTABLE_PATH picks the browser.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const { chromium } = await import(process.argv[2] || 'playwright');
const root = new URL('../', import.meta.url).pathname;
const ORIGIN = 'http://meridian.test';
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const page0 = (theme, density) => `<!doctype html><html data-theme="${theme}"${density ? ` data-density="${density}"` : ''}><head><meta charset="utf-8">
<link rel="stylesheet" href="/styles.css">
<script src="/node_modules/react/umd/react.development.js"></script>
<script src="/node_modules/react-dom/umd/react-dom.development.js"></script>
<script src="/_ds_bundle.js"></script></head><body style="margin:0;padding:24px;background:var(--surface-page)"><div id="host"></div></body></html>`;

// Pointer, density, the size md and sm must render (width = height of the item, ThemeToggle for md).
const CASES = [
  { name: 'fine pointer', context: { viewport: { width: 1280, height: 800 } }, density: null, md: 36, sm: 28 },
  { name: 'fine pointer, compact density', context: { viewport: { width: 1280, height: 800 } }, density: 'compact', md: 30, sm: 24 },
  { name: 'coarse pointer', context: { viewport: { width: 375, height: 800 }, hasTouch: true, isMobile: true }, density: null, md: 44, sm: 44 },
];
const browser = await chromium.launch(process.env.EXECUTABLE_PATH ? { executablePath: process.env.EXECUTABLE_PATH } : {});
let checked = 0;
try {
  for (const theme of ['light', 'dark']) {
    for (const c of CASES) {
      const ctx = await browser.newContext(c.context);
      const page = await ctx.newPage();
      const problems = [];
      page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
      await page.route(`${ORIGIN}/**`, async (route) => {
        const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
        if (pathname === '/') return route.fulfill({ status: 200, contentType: 'text/html', body: page0(theme, c.density) });
        const file = path.join(root, pathname);
        if (!file.startsWith(root)) return route.fulfill({ status: 403, body: '' });
        try { await route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: await readFile(file) }); }
        catch { await route.fulfill({ status: 404, body: '' }); }
      });
      await page.goto(`${ORIGIN}/`, { waitUntil: 'load' });
      await page.evaluate(() => {
        const C = window.EfolusiDesignSystem_4ffc3d, h = React.createElement;
        const languages = [{ code: 'id', label: 'ID', href: '#id', name: 'Bahasa Indonesia' }, { code: 'en', label: 'EN', href: '#en', name: 'English' }];
        ReactDOM.flushSync(() => ReactDOM.createRoot(document.getElementById('host')).render(h('div', { style: { display: 'flex', gap: '24px', alignItems: 'center' } },
          h('div', { id: 'md' }, h(C.LanguageSwitch, { languages, current: 'en' })),
          h('div', { id: 'sm' }, h(C.LanguageSwitch, { languages, current: 'en', size: 'sm' })),
          h('div', { id: 'toggle' }, h(C.ThemeToggle)))));
      });
      const m = await page.evaluate(() => {
        const box = (sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100 }; };
        return { md: box('#md a'), mdCurrent: box('#md [aria-current]'), sm: box('#sm a'), toggle: box('#toggle button') };
      });
      const where = `${c.name}, ${theme}`;
      assert.deepEqual(problems, [], `${where}: no page error`);
      assert.equal(m.md.h, c.md, `${where}: md is ${c.md}px high (got ${m.md.h})`);
      assert.ok(m.md.w >= c.md, `${where}: md is ${c.md}px wide at least (got ${m.md.w})`);
      assert.equal(m.mdCurrent.h, c.md, `${where}: the current language is as high as a link`);
      assert.equal(m.toggle.h, c.md, `${where}: the ThemeToggle is the same size as md (got ${m.toggle.h})`);
      assert.equal(m.sm.h, c.sm, `${where}: sm is ${c.sm}px high (got ${m.sm.h})`);
      checked += 6;
      console.log(`ok ${where}: md ${m.md.w} x ${m.md.h}, sm ${m.sm.w} x ${m.sm.h}, toggle ${m.toggle.w} x ${m.toggle.h}`);
      await ctx.close();
    }
  }
} finally { await browser.close(); }
console.log(`check_language_switch_size: ${checked} assertions passed`);
