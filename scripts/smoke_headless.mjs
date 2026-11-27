#!/usr/bin/env node
// Headless smoke check: loads site/_smoke.html in a real browser, waits for the
// machine-readable signal (html[data-smoke]), and fails if any demo threw.
// Requires a static server on BASE and a Playwright browser.
//   BASE=http://localhost:8000 node scripts/smoke_headless.mjs
// SMOKE_BROWSER picks the engine: chromium (default, what CI runs), firefox or
// webkit (Safari's engine). Edge is Chromium, so chromium covers it.
//   BASE=http://localhost:8000 SMOKE_BROWSER=webkit DIRECTION=rtl node scripts/smoke_headless.mjs
// Set EXECUTABLE_PATH to use an installed Chrome/Chromium binary locally;
// CI omits it and continues to use Playwright's pinned browser.
//
// With SHOTS=<dir> it additionally captures one PNG per example group per theme
// (g-<file>-<light|dark>.png) after the render settles, plus the forms group in
// compact density and, on Chromium, on a coarse pointer (g-<forms|marketing>-<compact|coarse>-light.png). Those are the inputs to
// scripts/check_visual.mjs. Capture runs with reduced motion and a fixed
// viewport so the pixels are deterministic on a given platform; comparison is
// only meaningful CI-to-CI, where the platform is constant.
import * as playwright from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { CAPTURE_CSS, settleForCapture } from './capture_settle.mjs';

const BASE = process.env.BASE || 'http://localhost:8000';
const SHOTS = process.env.SHOTS || '';
const EXECUTABLE_PATH = process.env.EXECUTABLE_PATH || '';
const DIRECTION = process.env.DIRECTION === 'rtl' ? 'rtl' : 'ltr';
const ENGINE = process.env.SMOKE_BROWSER || 'chromium';
if (!['chromium', 'firefox', 'webkit'].includes(ENGINE)) {
  console.error(`smoke: SMOKE_BROWSER must be chromium, firefox or webkit, not "${ENGINE}"`);
  process.exit(1);
}
const URL = `${BASE}/site/_smoke.html?dir=${DIRECTION}`;

// Text line heights leave a group a fraction of a pixel tall (charts: 1811.27px), so
// the captured box rounded to 1811 or 1812 between runs. Pin every group to a whole
// pixel first, which also puts every group's top on a whole pixel.
async function pinGroupHeights(p) {
  await p.evaluate(() => {
    const groups = [...document.querySelectorAll('section[data-group]')];
    for (const g of groups) g.style.height = '';
    for (const g of groups) g.style.height = `${Math.ceil(g.getBoundingClientRect().height)}px`;
  });
}

async function shootGroup(p, group, file) {
  await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const el = p.locator(`section[data-group="${group}"]`);
  await settleForCapture(p);
  await pinGroupHeights(p);
  // A tall element screenshot re-lays out the page for capture, which drops the
  // touch emulation and leaves the box measured with it: the shot then shows the
  // next group. Grow the viewport to the group instead and clip to its box.
  const size = p.viewportSize();
  await p.setViewportSize({ width: size.width, height: Math.ceil((await el.boundingBox()).height) });
  await el.evaluate(n => n.scrollIntoView({ block: 'start' }));
  await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  await p.screenshot({ path: path.join(SHOTS, file), clip: await el.boundingBox(), animations: 'disabled' });
  await p.setViewportSize(size);
}

const browser = await playwright[ENGINE].launch(EXECUTABLE_PATH ? { executablePath: EXECUTABLE_PATH } : {});
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
});
const consoleErrors = [];
page.on('console', m => {
  if (m.type() === 'error') {
    const location = m.location().url ? ` (${m.location().url}:${m.location().lineNumber + 1})` : '';
    consoleErrors.push(m.text() + location);
  }
});
page.on('response', response => {
  if (response.status() >= 400) consoleErrors.push(`HTTP ${response.status()} ${response.url()}`);
});
// Network failures that never produce a response (refused, aborted, blocked).
const failedRequests = [];
const pending = new Set();
page.on('request', request => pending.add(request.url()));
page.on('requestfinished', request => pending.delete(request.url()));
page.on('requestfailed', request => { pending.delete(request.url()); failedRequests.push(`${request.failure()?.errorText || 'failed'} ${request.url()}`); });

await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
// Demos compile via in-browser Babel; wait for the smoke signal to settle.
await page.waitForFunction(() => document.documentElement.getAttribute('data-smoke') !== null, { timeout: 60000 });
const result = await page.evaluate(() => window.__SMOKE__);

if (!result) { console.error('smoke: no result signal'); await browser.close(); process.exit(1); }
console.log(`smoke (${ENGINE} ${browser.version()}, ${result.direction}): ${result.passed}/${result.total} rendered, ${result.failed} failed`);
if (result.direction !== DIRECTION) {
  console.error(`smoke: requested ${DIRECTION} but document rendered ${result.direction}`);
  await browser.close();
  process.exit(1);
}
if (!result.ok) {
  console.error('FAILURES:\n  ' + result.fails.join('\n  '));
  await browser.close();
  process.exit(1);
}

// MD74: a Table that scrolls sideways fades its end edge while content is hidden there (scroll-driven animation on a
// mask). The fade must lift while any keyboard focus is inside the wrapper, so a focused row or a control in the last
// column is never under it. The fixture is 375px wide with nine columns and a button in the last one; it is removed
// again before any screenshot is taken.
if (await page.evaluate(() => CSS.supports('animation-timeline', 'scroll(self inline)'))) {
  await page.evaluate(() => {
    const DS = window.EfolusiDesignSystem_4ffc3d, R = window.React;
    const host = document.createElement('div');
    host.id = 'table-fade-fixture';
    host.style.cssText = 'position:fixed;inset-block-start:0;inset-inline-start:0;width:375px;background:var(--surface-page);z-index:99999';
    document.body.appendChild(host);
    const columns = Array.from({ length: 8 }, (_, i) => ({ key: `c${i}`, label: `Column ${i}` }));
    columns.push({ key: 'act', label: 'Action', render: (_v, row) => R.createElement('button', { type: 'button', className: 'table-fade-last' }, `Open ${row.id}`) });
    const rows = Array.from({ length: 3 }, (_, r) => Object.fromEntries([['id', `r${r}`], ['act', ''], ...columns.slice(0, 8).map(c => [c.key, `${c.label} of row ${r} has a long value`])]));
    window.__tableFadeRoot = window.ReactDOM.createRoot(host);
    window.__tableFadeRoot.render(R.createElement(R.Fragment, null,
      R.createElement('button', { type: 'button', id: 'table-fade-before' }, 'Before'),
      R.createElement(DS.Table, { columns, rows, rowKey: 'id', onRowClick: () => {}, label: 'Fade fixture' })));
  });
  await page.waitForSelector('#table-fade-fixture .ef-table-wrap[tabindex="0"]', { timeout: 10000 });
  const settle = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const read = () => page.evaluate(() => {
    const wrap = document.querySelector('#table-fade-fixture .ef-table-wrap');
    const cs = getComputedStyle(wrap);
    return { mask: cs.maskImage, size: cs.maskSize, active: document.activeElement.tagName + (document.activeElement.className ? '.' + String(document.activeElement.className).split(' ')[0] : '') };
  });
  const fadeWidth = (size) => Number.parseFloat((size.split(/,(?![^(]*\))/)[1] || '').trim());
  await settle();
  const rest = await read();
  if (!(fadeWidth(rest.size) > 0)) {
    console.error(`smoke: Table fade case: the end edge is not faded while columns are hidden (mask-size ${rest.size})`);
    await browser.close();
    process.exit(1);
  }
  await page.locator('#table-fade-before').focus();
  const focusOrder = [];
  // Tab to the wrapper, a row (tabIndex 0 with onRowClick) and a control in the last column: no fade under any of them.
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Tab');
    await settle();
    const now = await read();
    focusOrder.push(now.active);
    if (now.mask !== 'none') {
      console.error(`smoke: Table fade case: the fade stays on while ${now.active} has keyboard focus (mask-image ${now.mask})`);
      await browser.close();
      process.exit(1);
    }
  }
  if (!focusOrder.some(a => a.startsWith('TR')) || !focusOrder.some(a => a.startsWith('BUTTON.table-fade-last'))) {
    console.error(`smoke: Table fade case: Tab did not reach a row and a last-column control (${focusOrder.join(', ')})`);
    await browser.close();
    process.exit(1);
  }
  await page.locator('#table-fade-before').focus();
  await page.evaluate(() => document.activeElement.blur());
  await settle();
  // Focus left the table, so the mask is back. Tabbing to the last-column button scrolled the wrapper to its far end, where
  // nothing is hidden and the fade is 0 by design, so scroll back to the start before asking for the 28px fade.
  const after = await read();
  if (after.mask === 'none') {
    console.error(`smoke: Table fade case: the mask did not come back after focus left the table (${after.mask})`);
    await browser.close();
    process.exit(1);
  }
  // scrollLeft is 0 at the inline START in both directions and runs to +max in LTR but to -max in RTL (the inline END is the
  // left edge there), so a large positive value clamps to the start in RTL. Say whether the scroll really reached the target.
  const scrollTo = (end) => page.evaluate((toEnd) => {
    const wrap = document.querySelector('#table-fade-fixture .ef-table-wrap');
    const max = wrap.scrollWidth - wrap.clientWidth;
    wrap.scrollLeft = toEnd ? (getComputedStyle(wrap).direction === 'rtl' ? -max : max) : 0;
    return toEnd ? Math.abs(wrap.scrollLeft) >= max - 1 && max > 0 : wrap.scrollLeft === 0;
  }, end);
  const fadeIs = (want) => page.waitForFunction((w) => {
    const wrap = document.querySelector('#table-fade-fixture .ef-table-wrap');
    const second = (getComputedStyle(wrap).maskSize.split(/,(?![^(]*\))/)[1] || '').trim();
    return w === 'shown' ? Number.parseFloat(second) > 0 : Number.parseFloat(second) === 0;
  }, want, { timeout: 3000 }).then(() => true, () => false);
  if (!(await scrollTo(false))) {
    console.error(`smoke: Table fade case: could not scroll the wrapper to the inline start (${JSON.stringify(await read())})`);
    await browser.close();
    process.exit(1);
  }
  if (!(await fadeIs('shown'))) {
    console.error(`smoke: Table fade case: no fade at the start of the scroll after focus left the table (${JSON.stringify(await read())})`);
    await browser.close();
    process.exit(1);
  }
  if (!(await scrollTo(true))) {
    console.error(`smoke: Table fade case: could not scroll the wrapper to the inline end (${JSON.stringify(await read())})`);
    await browser.close();
    process.exit(1);
  }
  if (!(await fadeIs('gone'))) {
    console.error(`smoke: Table fade case: the fade stays at the end of the scroll, where nothing is hidden (${JSON.stringify(await read())})`);
    await browser.close();
    process.exit(1);
  }
  await page.evaluate(() => { window.__tableFadeRoot.unmount(); document.getElementById('table-fade-fixture').remove(); });
  console.log('smoke: Table end-edge fade lifts for the wrapper, a row and a last-column control');
} else {
  console.log(`smoke: Table fade case skipped (${ENGINE} has no scroll-driven animations)`);
}

if (SHOTS) {
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  // Icons arrive by fetch after the demos render. Wait until every icon slot holds
  // its SVG, so the captures show the glyphs; a slot that stays empty fails the run
  // instead of producing a baseline without icons.
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  const emptyIcons = () => page.evaluate(() =>
    [...document.querySelectorAll('section[data-group] [data-slot="icon"]')].filter(s => !s.querySelector('svg')).length);
  await page.waitForFunction(() =>
    [...document.querySelectorAll('section[data-group] [data-slot="icon"]')].every(s => s.querySelector('svg')),
  null, { timeout: 30000 }).catch(() => {});
  const blankIcons = await emptyIcons();
  if (blankIcons) {
    console.error(`smoke: ${blankIcons} icon slot(s) still empty (${pending.size} request(s) pending${failedRequests.length ? `, ${failedRequests.length} failed` : ''}); not capturing baselines without icons`);
    await browser.close();
    process.exit(1);
  }
  await page.addStyleTag({ content: CAPTURE_CSS });
  let count = 0;
  for (const theme of ['light', 'dark']) {
    await page.evaluate(t => {
      if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.setAttribute('data-theme', 'light');
    }, theme);
    // One rAF pair lets the var() swap paint before the capture.
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    for (const el of await page.locator('section[data-group]').all()) {
      const group = await el.getAttribute('data-group');
      await settleForCapture(page);
      await pinGroupHeights(page);
      await el.screenshot({ path: path.join(SHOTS, `g-${group}-${theme}.png`), animations: 'disabled' });
      count++;
    }
  }
  // Density and pointer change control sizes through tokens: guard the forms group
  // in compact density and on a coarse pointer (light theme only).
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.evaluate(() => document.documentElement.setAttribute('data-density', 'compact'));
  await shootGroup(page, 'forms', 'g-forms-compact-light.png');
  await shootGroup(page, 'marketing', 'g-marketing-compact-light.png');
  await page.evaluate(() => document.documentElement.removeAttribute('data-density'));
  count += 2;
  if (ENGINE === 'chromium') {
    // hasTouch makes Chromium report (pointer: coarse); it needs its own context.
    const touch = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce', hasTouch: true });
    const coarse = await touch.newPage();
    await coarse.goto(URL, { waitUntil: 'load', timeout: 60000 });
    await coarse.waitForFunction(() => document.documentElement.getAttribute('data-smoke') !== null, { timeout: 60000 });
    if (!(await coarse.evaluate(() => matchMedia('(pointer: coarse)').matches))) {
      console.error('smoke: the touch context does not report (pointer: coarse)');
      await browser.close();
      process.exit(1);
    }
    await coarse.evaluate(() => document.fonts.ready);
    await coarse.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await coarse.waitForFunction(() =>
      [...document.querySelectorAll('section[data-group] [data-slot="icon"]')].every(s => s.querySelector('svg')),
    null, { timeout: 30000 });
    await coarse.addStyleTag({ content: CAPTURE_CSS });
    await coarse.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await shootGroup(coarse, 'forms', 'g-forms-coarse-light.png');
    await shootGroup(coarse, 'marketing', 'g-marketing-coarse-light.png');
    await touch.close();
    count += 2;
  }
  console.log(`smoke: ${count} group screenshots -> ${SHOTS}`);
}

await browser.close();

// A demo can render and still be broken — a failed fetch, a React warning, an
// unhandled rejection all land here and nowhere else. This array was collected
// from day one and then ignored, which is how errors stayed invisible.
if (consoleErrors.length) {
  console.error(`smoke: ${consoleErrors.length} console error(s) during the run:\n  ` + consoleErrors.join('\n  '));
  process.exit(1);
}
console.log('smoke: console clean');
process.exit(0);
