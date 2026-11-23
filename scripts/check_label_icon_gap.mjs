// Real Chromium: the gap between a label and its icon, measured from the rendered boxes.
// MD59 moved eight label-and-icon pairs onto --gap-label-icon (8px) and --gap-label-icon-sm (4px). The visual
// baselines could not see it: no demo renders Button xs with an icon, and the navigation and agent-run shifts
// stay under check_visual's pixel budget. This reads the distance in px between the label's box and the icon's
// box, so a 1px change fails and no baseline is involved.
// Components come from _ds_bundle.js with React from node_modules, served to the page by a route handler: no
// server, no network. Optional argv[2] is an installed playwright entrypoint; EXECUTABLE_PATH picks the browser.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const { chromium } = await import(process.argv[2] || 'playwright');
const root = new URL('../', import.meta.url).pathname;
const ORIGIN = 'http://meridian.test';

const page0 = `<!doctype html><html data-theme="light"><head><meta charset="utf-8">
<link rel="stylesheet" href="/styles.css">
<script src="/node_modules/react/umd/react.development.js"></script>
<script src="/node_modules/react-dom/umd/react-dom.development.js"></script>
<script src="/_ds_bundle.js"></script></head><body style="margin:0;padding:24px"><div id="host"></div></body></html>`;

// Every case: how to render the control, the gap in px that the design says is between them.
// Size scale from Button: xs is the small control (4px), every other size is the inline pair (8px).
const cases = [
  ...['xs', 'sm', 'md', 'lg', 'xl'].flatMap((size) => ['iconLeft', 'iconRight'].map((side) => ({
    name: `Button ${size} ${side}`, expected: size === 'xs' ? 4 : 8, control: '.ef-btn', params: { size, side },
    render: ({ h, C }, p) => h(C.Button, { size: p.size, variant: 'secondary', [p.side]: 'chevron-down' }, 'Label'),
  }))),
  {
    name: 'Select trigger', expected: 8, control: '.ef-select-trigger',
    // width: max-content keeps justify-content: space-between from adding free space to the gap
    render: ({ h, C }) => h(C.Select, { defaultValue: 'a' }, h(C.SelectTrigger, { 'aria-label': 'Pick', style: { width: 'max-content' } }, h(C.SelectValue)),
      h(C.SelectContent, null, h(C.SelectItem, { value: 'a' }, 'Label'))),
  },
  {
    name: 'Dropdown menu trigger', expected: 8, control: '[data-slot="dropdown-menu-trigger"]',
    render: ({ h, C }) => h(C.DropdownMenu, null, h(C.DropdownMenuTrigger, { asChild: true }, h(C.Button, { variant: 'secondary', iconRight: 'chevron-down' }, 'Label')),
      h(C.DropdownMenuContent, null, h(C.DropdownMenuItem, null, 'Item'))),
  },
  {
    name: 'Dropdown menu item', expected: 8, control: '.ef-dropdown-menu__item',
    render: ({ h, C }) => h(C.DropdownMenu, { defaultOpen: true, modal: false }, h(C.DropdownMenuTrigger, null, 'Open'),
      h(C.DropdownMenuContent, null, h(C.DropdownMenuItem, null, h(C.Icon, { name: 'user', size: 16 }), 'Label'))),
  },
  {
    name: 'Navigation menu trigger', expected: 8, control: '.ef-navigation-menu__trigger',
    render: ({ h, C }) => h(C.NavigationMenu, null, h(C.NavigationMenuList, null, h(C.NavigationMenuItem, { value: 'a' },
      h(C.NavigationMenuTrigger, null, 'Label'), h(C.NavigationMenuContent, null, h(C.NavigationMenuLink, { href: '#a' }, 'Link'))))),
  },
  {
    name: 'Input group button', expected: 8, control: '.ef-input-group__button',
    render: ({ h, C }) => h(C.InputGroup, null, h(C.InputGroupInput, { 'aria-label': 'Url' }),
      h(C.InputGroupAddon, { align: 'inline-end' }, h(C.InputGroupButton, null, h(C.Icon, { name: 'copy', size: 12 }), 'Label'))),
  },
  {
    name: 'Agent run toggle', expected: 8, control: '.ef-agentrun__toggle',
    render: ({ h, C }) => h(C.AgentRun, { steps: [{ id: 's', title: 'Step', status: 'done', children: 'Detail' }] }),
  },
];

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const browser = await chromium.launch(process.env.EXECUTABLE_PATH ? { executablePath: process.env.EXECUTABLE_PATH } : {});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const problems = [];
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
  await page.route(`${ORIGIN}/**`, async (route) => {
    const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
    if (pathname === '/') return route.fulfill({ status: 200, contentType: 'text/html', body: page0 });
    const file = path.join(root, pathname);
    if (!file.startsWith(root)) return route.fulfill({ status: 403, body: '' });
    try { await route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: await readFile(file) }); }
    catch { await route.fulfill({ status: 404, body: '' }); }
  });
  await page.goto(`${ORIGIN}/`, { waitUntil: 'load' });
  assert.equal(await page.evaluate(() => document.compatMode), 'CSS1Compat', 'measure in standards mode');
  assert.deepEqual(await page.evaluate(() => window.EfolusiDesignSystem_4ffc3d.__errors), [], 'the bundle must load clean');

  let checked = 0;
  for (const spec of cases) {
    const measured = await page.evaluate(async ({ render, control, params }) => {
      const C = window.EfolusiDesignSystem_4ffc3d, h = React.createElement;
      const el = document.createElement('div');
      document.getElementById('host').append(el);
      const rootNode = ReactDOM.createRoot(el);
      ReactDOM.flushSync(() => rootNode.render(window.eval(`(${render})`)({ h, C }, params)));
      for (let i = 0; i < 60 && !document.querySelector(control); i++) await new Promise((r) => setTimeout(r, 25));
      await document.fonts.ready;
      const box = document.querySelector(control);
      if (!box) return { error: `no element matches ${control}` };
      const icons = [...box.querySelectorAll('[data-slot="icon"]')];
      // The label box is the union of the control's own text nodes, outside every icon.
      const range = document.createRange();
      const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
      const texts = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.textContent.trim() && !n.parentElement.closest('[data-slot="icon"]')) texts.push(n);
      if (!texts.length || !icons.length) return { error: `${texts.length} label text(s), ${icons.length} icon(s)` };
      range.setStartBefore(texts[0]); range.setEndAfter(texts[texts.length - 1]);
      const label = range.getBoundingClientRect();
      const gaps = icons.map((icon) => {
        const r = icon.getBoundingClientRect();
        return { side: r.left >= label.right - 0.01 ? 'after' : 'before', px: r.left >= label.right - 0.01 ? r.left - label.right : label.left - r.right, iconWidth: r.width };
      });
      rootNode.unmount(); el.remove();
      return { gaps };
    }, { render: spec.render.toString(), control: spec.control, params: spec.params || {} });
    if (measured.error) { problems.push(`${spec.name}: ${measured.error}`); continue; }
    for (const g of measured.gaps) {
      checked++;
      if (g.iconWidth < 1) problems.push(`${spec.name}: the icon box is ${g.iconWidth}px wide, so its gap is not measured`);
      else if (Math.abs(g.px - spec.expected) > 0.05) problems.push(`${spec.name}: the ${g.side === 'after' ? 'right' : 'left'} icon sits ${g.px.toFixed(2)}px from its label, expected ${spec.expected}px`);
    }
  }
  assert.deepEqual(problems, [], `label and icon gaps:\n  ${problems.join('\n  ')}`);
  console.log(`label icon gap: ${checked} label-to-icon distances across ${cases.length} controls measured at the expected 8px (4px for Button xs)`);
} finally { await browser.close(); }
