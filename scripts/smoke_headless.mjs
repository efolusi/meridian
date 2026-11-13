#!/usr/bin/env node
// Headless smoke check: loads site/_smoke.html in a real browser, waits for the
// machine-readable signal (html[data-smoke]), and fails if any demo threw.
// Requires a static server on BASE and Playwright's chromium.
//   BASE=http://localhost:8000 node scripts/smoke_headless.mjs
// Set EXECUTABLE_PATH to use an installed Chrome/Chromium binary locally;
// CI omits it and continues to use Playwright's pinned browser.
//
// With SHOTS=<dir> it additionally captures one PNG per example group per theme
// (g-<file>-<light|dark>.png) after the render settles. Those are the inputs to
// scripts/check_visual.mjs. Capture runs with reduced motion and a fixed
// viewport so the pixels are deterministic on a given platform; comparison is
// only meaningful CI-to-CI, where the platform is constant.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE || 'http://localhost:8000';
const SHOTS = process.env.SHOTS || '';
const EXECUTABLE_PATH = process.env.EXECUTABLE_PATH || '';
const DIRECTION = process.env.DIRECTION === 'rtl' ? 'rtl' : 'ltr';
const URL = `${BASE}/site/_smoke.html?dir=${DIRECTION}`;

const browser = await chromium.launch(EXECUTABLE_PATH ? { executablePath: EXECUTABLE_PATH } : {});
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
console.log(`smoke (${result.direction}): ${result.passed}/${result.total} rendered, ${result.failed} failed`);
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

if (SHOTS) {
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  // Icons arrive by fetch after the demos render. On a loaded runner the
  // captures used to beat them, so baselines and comparisons came out with
  // blank icon slots at random. Wait for the requests to settle, then refuse
  // to capture if any slot is still empty.
  const countBlank = () => page.evaluate(() =>
    [...document.querySelectorAll('section[data-group] [data-slot="icon"]')].filter(s => !s.querySelector('svg')).length);
  let idle = await page.waitForLoadState('networkidle', { timeout: 30000 }).then(() => true, () => false);
  let blankIcons = await countBlank();
  if (blankIcons) {
    // One reload: the second pass reads the icons from the HTTP cache.
    console.error(`smoke: ${blankIcons} icon slot(s) empty after load (network idle: ${idle}; ${pending.size} request(s) pending: ${[...pending].slice(0, 10).join(', ')}); reloading once`);
    await page.reload({ waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => document.documentElement.getAttribute('data-smoke') !== null, { timeout: 60000 });
    idle = await page.waitForLoadState('networkidle', { timeout: 30000 }).then(() => true, () => false);
    blankIcons = await countBlank();
  }
  if (blankIcons) {
    console.error(`  network idle: ${idle}; pending: ${pending.size} ${[...pending].slice(0, 20).join(', ')}`);
    console.error(`smoke: ${blankIcons} icon slot(s) still empty; refusing to capture screenshots`);
    const where = await page.evaluate(() => [...document.querySelectorAll('section[data-group] [data-slot="icon"]')]
      .filter(s => !s.querySelector('svg'))
      .map(s => s.closest('.demo')?.querySelector('h4')?.textContent || '?'));
    const counts = where.reduce((m, k) => (m[k] = (m[k] || 0) + 1, m), {});
    console.error('  blank icons by demo: ' + JSON.stringify(counts));
    const probe = await page.evaluate(async () => {
      const slot = [...document.querySelectorAll('section[data-group] [data-slot="icon"]')].find(s => !s.querySelector('svg'));
      const bundles = [...document.scripts].filter(s => (s.src || '').includes('_ds_bundle')).map(s => s.src);
      const r = await fetch((window.__efBase || '') + 'assets/icons/check.svg').then(x => `${x.status} ${x.headers.get('content-type')} ${(x.headers.get('content-length') || '?')}b`, e => String(e));
      return { slot: slot ? slot.outerHTML.slice(0, 300) : null, parent: slot ? slot.parentElement.outerHTML.slice(0, 300) : null, efBase: window.__efBase, bundles, refetch: r, ua: navigator.userAgent };
    });
    console.error('  probe: ' + JSON.stringify(probe));
    if (failedRequests.length) console.error('  failed requests:\n    ' + failedRequests.slice(0, 40).join('\n    '));
    if (consoleErrors.length) console.error('  console:\n    ' + consoleErrors.slice(0, 20).join('\n    '));
    await browser.close();
    process.exit(1);
  }
  // The sticky summary banner paints over whichever section is scrolled under
  // it, so it was getting baked into the captures — carrying the live demo
  // count, which would churn every affected baseline whenever a demo is added.
  await page.addStyleTag({ content: '#summary, h1, [data-live] { display: none !important; }' });
  let count = 0;
  for (const theme of ['light', 'dark']) {
    await page.evaluate(t => {
      if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
    }, theme);
    // One rAF pair lets the var() swap paint before the capture.
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    for (const el of await page.locator('section[data-group]').all()) {
      const group = await el.getAttribute('data-group');
      await el.screenshot({ path: path.join(SHOTS, `g-${group}-${theme}.png`), animations: 'disabled' });
      count++;
    }
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
