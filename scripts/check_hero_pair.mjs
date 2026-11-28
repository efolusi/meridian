// Real Chromium: a hero pair of buttons that stacks at phone width has ONE width, the wider one (MD147).
// A wrapping flex row gives each stacked button its own width (komando site, 375 px: 164 and 194 px); jsdom has no layout,
// so only a browser can tell. Each case renders a Hero with two pill buttons of different label lengths, English and
// Indonesian, and measures the boxes: at 375 px the pair is stacked and both buttons are as wide as the wider one is at
// rest (measured in the row at 1280 px), light and dark, centred and align="start". The page must not scroll sideways.
// Components come from _ds_bundle.js with React from node_modules, served by a route handler: no server, no network.
// Optional argv[2] is an installed playwright entrypoint; EXECUTABLE_PATH picks the browser.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const { chromium } = await import(process.argv[2] || 'playwright');
const root = new URL('../', import.meta.url).pathname;
const ORIGIN = 'http://meridian.test';

const page0 = (theme) => `<!doctype html><html data-theme="${theme}"><head><meta charset="utf-8">
<link rel="stylesheet" href="/styles.css">
<script src="/node_modules/react/umd/react.development.js"></script>
<script src="/node_modules/react-dom/umd/react-dom.development.js"></script>
<script src="/_ds_bundle.js"></script></head><body style="margin:0;background:var(--surface-page)"><div id="host"></div></body></html>`;

const LANGS = {
  en: { lang: 'en', title: 'Tools that run on your own machine', sub: 'Open source, self-hosted and private by default.', a: 'Install komando', b: 'Read the documentation' },
  id: { lang: 'id', title: 'Alat yang berjalan di mesin Anda sendiri', sub: 'Sumber terbuka, dihosting sendiri, dan privat secara bawaan.', a: 'Pasang komando', b: 'Baca dokumentasi' },
};
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const browser = await chromium.launch(process.env.EXECUTABLE_PATH ? { executablePath: process.env.EXECUTABLE_PATH } : {});
let checked = 0;
try {
  for (const theme of ['light', 'dark']) {
    for (const align of ['center', 'start']) {
      for (const [code, copy] of Object.entries(LANGS)) {
        const where = `${code} ${theme} ${align}`;
        const widths = {};
        for (const width of [1280, 375]) {
          const ctx = await browser.newContext({ viewport: { width, height: 800 } });
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
          assert.deepEqual(await page.evaluate(() => window.EfolusiDesignSystem_4ffc3d.__errors), [], 'the bundle must load clean');
          await page.evaluate(({ copy, align }) => {
            const C = window.EfolusiDesignSystem_4ffc3d, h = React.createElement;
            ReactDOM.flushSync(() => ReactDOM.createRoot(document.getElementById('host')).render(
              h(C.Hero, { lang: copy.lang, align, title: copy.title, sub: copy.sub,
                actions: h(React.Fragment, null,
                  h(C.Button, { shape: 'pill', size: 'xl', iconRight: 'arrow-right' }, copy.a),
                  h(C.Button, { shape: 'pill', size: 'xl', variant: 'secondary' }, copy.b)) })));
          }, { copy, align });
          await page.evaluate(() => document.fonts.ready);
          const m = await page.evaluate(() => {
            const boxes = [...document.querySelectorAll('.ef-hero__actions > *')].map((el) => el.getBoundingClientRect());
            const host = document.querySelector('.ef-hero__inner').getBoundingClientRect();
            return { boxes: boxes.map((r) => ({ left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width })),
              host: { left: host.left, right: host.right }, scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth };
          });
          assert.deepEqual(problems, [], `${where} ${width}: no page error`);
          assert.equal(m.boxes.length, 2, `${where} ${width}: two buttons`);
          assert.ok(m.scrollW <= m.clientW, `${where} ${width}: no sideways scroll (${m.scrollW} > ${m.clientW})`);
          widths[width] = m;
          await ctx.close();
        }
        const rest = widths[1280].boxes, [a, b] = widths[375].boxes;
        assert.ok(Math.abs(rest[0].top - rest[1].top) < 1, `${where}: one row at 1280`);
        const wider = Math.max(rest[0].width, rest[1].width);
        assert.ok(b.top >= a.bottom - 0.5, `${where}: the pair is stacked at 375 (${JSON.stringify(widths[375].boxes)})`);
        assert.ok(Math.abs(a.width - b.width) < 0.5, `${where}: one width at 375, got ${a.width} and ${b.width}`);
        assert.ok(Math.abs(a.width - wider) < 0.5, `${where}: that width is the wider button's (${wider}), got ${a.width}`);
        assert.ok(Math.abs(a.left - b.left) < 0.5, `${where}: the buttons share their start edge`);
        const h = widths[375].host, mid = (h.left + h.right) / 2, col = (a.left + a.right) / 2;
        if (align === 'center') assert.ok(Math.abs(col - mid) < 1, `${where}: the column is centred (${col} vs ${mid})`);
        else assert.ok(Math.abs(a.left - (h.left + 24)) < 1.5, `${where}: the column sits at the start edge (${a.left})`);
        checked += 6;
        console.log(`ok ${where}: 1280 row ${rest.map((r) => r.width.toFixed(0)).join('/')}; 375 stack ${a.width.toFixed(1)}/${b.width.toFixed(1)}`);
      }
    }
  }
} finally { await browser.close(); }
console.log(`check_hero_pair: ${checked} assertions passed`);
