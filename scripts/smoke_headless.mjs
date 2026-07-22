#!/usr/bin/env node
// Headless smoke check: loads site/_smoke.html in a real browser, waits for the
// machine-readable signal (html[data-smoke]), and fails if any demo threw.
// Requires a static server on BASE and Playwright's chromium.
//   BASE=http://localhost:8000 node scripts/smoke_headless.mjs
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
const URL = `${BASE}/site/_smoke.html`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
});
const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
// Demos compile via in-browser Babel; wait for the smoke signal to settle.
await page.waitForFunction(() => document.documentElement.getAttribute('data-smoke') !== null, { timeout: 60000 });
const result = await page.evaluate(() => window.__SMOKE__);

if (!result) { console.error('smoke: no result signal'); await browser.close(); process.exit(1); }
console.log(`smoke: ${result.passed}/${result.total} rendered, ${result.failed} failed`);
if (!result.ok) {
  console.error('FAILURES:\n  ' + result.fails.join('\n  '));
  await browser.close();
  process.exit(1);
}

if (SHOTS) {
  fs.mkdirSync(SHOTS, { recursive: true });
  await page.evaluate(() => document.fonts.ready);
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
