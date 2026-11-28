// Real Chromium: the menus move focus into themselves, answer the keyboard, and draw their marks clear of the text.
// MD144 (ContextMenu) and MD145 (Menubar) had the two faults MD96 found in DropdownMenu, and jsdom hides both:
//   1. A menu panel is not placed on the commit that opens it (it is visibility:hidden or still at the origin), and a hidden
//      element cannot take focus. jsdom has no layout, so a test there passes while a browser leaves focus on the trigger and
//      ArrowDown, ArrowUp and Escape do nothing.
//   2. A checkbox or radio item draws its mark in the start gutter; with the plain item padding the mark overlapped the text.
// This opens each menu with the keyboard and the pointer, reads document.activeElement, presses the keys, and measures the
// rendered boxes of the mark and the text, and the computed fill of a selected radio and the weight of a checked item.
// Components come from _ds_bundle.js with React from node_modules, served to the page by a route handler: no server, no network.
// Optional argv[2] is an installed playwright entrypoint; EXECUTABLE_PATH picks the browser.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const { chromium } = await import(process.argv[2] || 'playwright');
const root = new URL('../', import.meta.url).pathname;
const ORIGIN = 'http://meridian.test';

const page0 = (theme, dir) => `<!doctype html><html data-theme="${theme}" dir="${dir}"><head><meta charset="utf-8">
<link rel="stylesheet" href="/styles.css">
<script src="/node_modules/react/umd/react.development.js"></script>
<script src="/node_modules/react-dom/umd/react-dom.development.js"></script>
<script src="/_ds_bundle.js"></script></head><body style="margin:0;padding:24px;background:var(--surface-page)"><div id="host"></div></body></html>`;

// Each menu: how to render it with a checkbox item (checked), a radio group (one selected), a plain item and a disabled-free list.
// `open` opens it from the keyboard from the trigger; `pointerOpen` opens it with the pointer.
const MENUS = {
  context: {
    trigger: '#trigger', itemClass: 'ef-context-menu__item', indicator: '.ef-context-menu__indicator', panel: '.ef-context-menu__content',
    render: ({ h, C }) => h(C.ContextMenu, null,
      h(C.ContextMenuTrigger, { asChild: true }, h('button', { id: 'trigger', type: 'button' }, 'Right-click area')),
      h(C.ContextMenuContent, null,
        h(C.ContextMenuItem, null, 'Back'),
        h(C.ContextMenuCheckboxItem, { defaultChecked: true }, 'Show bookmarks'),
        h(C.ContextMenuSeparator),
        h(C.ContextMenuRadioGroup, { defaultValue: 'light' },
          h(C.ContextMenuRadioItem, { value: 'light' }, 'Light'),
          h(C.ContextMenuRadioItem, { value: 'dark' }, 'Dark')),
        h(C.ContextMenuSub, null,
          h(C.ContextMenuSubTrigger, null, 'More'),
          h(C.ContextMenuSubContent, null, h(C.ContextMenuItem, null, 'Save as'))))),
    keyOpen: async (page) => { await page.focus('#trigger'); await page.keyboard.press('ContextMenu'); },
    pointerOpen: async (page) => { await page.click('#trigger', { button: 'right' }); },
  },
};
const only = process.env.MENU;

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const browser = await chromium.launch(process.env.EXECUTABLE_PATH ? { executablePath: process.env.EXECUTABLE_PATH } : {});
let checked = 0;
const ok = (n = 1) => { checked += n; };
try {
  for (const [name, menu] of Object.entries(MENUS)) {
    if (only && only !== name) continue;
    for (const dir of ['ltr', 'rtl']) {
      for (const theme of ['light', 'dark']) {
        const ctx = await browser.newContext({ viewport: { width: 900, height: 600 } });
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
        await page.evaluate((render) => {
          const C = window.EfolusiDesignSystem_4ffc3d, h = React.createElement;
          ReactDOM.flushSync(() => ReactDOM.createRoot(document.getElementById('host')).render(window.eval(`(${render})`)({ h, C })));
        }, menu.render.toString());
        const where = `${name} ${dir} ${theme}`;
        const active = () => page.evaluate(() => { const a = document.activeElement; return a && { role: a.getAttribute('role'), text: (a.textContent || '').trim(), id: a.id }; });

        // 1. Open from the keyboard: focus is on the first item, in a real browser.
        await menu.keyOpen(page);
        await page.waitForSelector(menu.panel, { state: 'visible' });
        await page.waitForFunction(() => document.activeElement && document.activeElement.getAttribute('role') === 'menuitem', null, { timeout: 2000 })
          .catch(() => {});
        let now = await active();
        assert.equal(now?.role, 'menuitem', `${where}: focus must move into the open menu (focus is on ${JSON.stringify(now)})`);
        assert.equal(now.text, 'Back', `${where}: the first item takes focus`);
        ok();

        // 2. ArrowDown and ArrowUp move, Escape closes and gives focus back to the trigger.
        await page.keyboard.press('ArrowDown');
        now = await active();
        assert.equal(now?.text, 'Show bookmarks', `${where}: ArrowDown moves to the next item (${JSON.stringify(now)})`);
        await page.keyboard.press('ArrowUp');
        assert.equal((await active())?.text, 'Back', `${where}: ArrowUp moves back`);
        ok(2);

        // 3. The marks: the gutter keeps the text clear of the mark; a selected radio is filled; a checked item is semibold.
        const geo = await page.evaluate((cls) => {
          const rect = (el) => el.getBoundingClientRect();
          const rtl = document.documentElement.dir === 'rtl';
          const out = {};
          for (const [key, sel] of Object.entries({ checkbox: '[role=menuitemcheckbox]', radio: '[role=menuitemradio][aria-checked=true]', radioOff: '[role=menuitemradio][aria-checked=false]', plain: '[role=menuitem]' })) {
            const item = document.querySelector(`.${cls}${sel}`);
            if (!item) continue;
            const mark = item.querySelector('[class$="__indicator"]');
            const range = document.createRange();
            const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT);
            let text = null;
            for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.textContent.trim() && !n.parentElement.closest('[class$="__indicator"]')) { text = n; break; }
            range.selectNodeContents(text);
            const t = rect(range), r = rect(item), cs = getComputedStyle(item);
            const m = mark && mark.firstElementChild ? rect(mark.firstElementChild) : null;
            // distance from the mark's end edge to the text's start edge, in the reading direction (negative: they overlap)
            const gap = m ? (rtl ? m.left - t.right : t.left - m.right) : null;
            const svg = mark && mark.querySelector('svg');
            out[key] = { gap, weight: cs.fontWeight, fill: svg ? getComputedStyle(svg).fill : null, rowStart: rtl ? r.right - t.right : t.left - r.left };
          }
          return out;
        }, menu.itemClass);
        assert.ok(geo.checkbox.gap >= 4, `${where}: the checkbox mark is ${geo.checkbox.gap}px from the text (needs a gutter, at least 4px)`);
        assert.ok(geo.radio.gap >= 4, `${where}: the radio mark is ${geo.radio.gap}px from the text (needs a gutter, at least 4px)`);
        assert.notEqual(geo.radio.fill, 'none', `${where}: a selected radio is filled (fill ${geo.radio.fill})`);
        assert.ok(Number(geo.checkbox.weight) >= 600 && Number(geo.radio.weight) >= 600, `${where}: a checked item is semibold (${geo.checkbox.weight}, ${geo.radio.weight})`);
        assert.ok(Number(geo.plain.weight) < 600 && Number(geo.radioOff.weight) < 600, `${where}: an unchecked item keeps the normal weight (${geo.plain.weight}, ${geo.radioOff.weight})`);
        ok(5);

        // 3b. A submenu opens from the keyboard with focus on its first item, and its closing key returns focus to its trigger.
        const into = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight', out = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
        await page.keyboard.press('End');
        assert.equal((await active())?.text, 'More', `${where}: End moves to the last item`);
        await page.keyboard.press(into);
        await page.waitForFunction(() => document.activeElement && (document.activeElement.textContent || '').trim() === 'Save as', null, { timeout: 2000 }).catch(() => {});
        assert.equal((await active())?.text, 'Save as', `${where}: ${into} opens the submenu and focus moves into it`);
        await page.keyboard.press(out);
        assert.equal((await active())?.text, 'More', `${where}: ${out} closes the submenu and returns focus to its trigger`);
        ok(3);

        // 4. Escape closes and focus returns to the trigger.
        await page.keyboard.press('Escape');
        await page.waitForSelector(menu.panel, { state: 'detached' });
        assert.equal((await active())?.id, 'trigger', `${where}: Escape closes the menu and returns focus to the trigger`);
        ok();

        // 5. Open with the pointer: focus moves in as well.
        await menu.pointerOpen(page);
        await page.waitForSelector(menu.panel, { state: 'visible' });
        await page.waitForFunction(() => document.activeElement && document.activeElement.getAttribute('role') === 'menuitem', null, { timeout: 2000 }).catch(() => {});
        assert.equal((await active())?.role, 'menuitem', `${where}: focus moves into a menu opened with the pointer`);
        ok();

        assert.deepEqual(problems, [], `${where}: no page errors`);
        await ctx.close();
      }
    }
  }
  console.log(`menu focus: ${checked} checks passed in a real browser (focus enters the menu, arrows and Escape, mark gutter, filled radio, semibold checked item; LTR and RTL, light and dark)`);
} finally {
  await browser.close();
}
