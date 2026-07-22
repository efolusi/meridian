#!/usr/bin/env node
// Headless smoke check: loads site/_smoke.html in a real browser, waits for the
// machine-readable signal (html[data-smoke]), and fails if any demo threw.
// Requires a static server on BASE and Playwright's chromium.
//   BASE=http://localhost:8000 node scripts/smoke_headless.mjs
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:8000';
const URL = `${BASE}/site/_smoke.html`;

const browser = await chromium.launch();
const page = await browser.newPage();
const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
// Demos compile via in-browser Babel; wait for the smoke signal to settle.
await page.waitForFunction(() => document.documentElement.getAttribute('data-smoke') !== null, { timeout: 60000 });
const result = await page.evaluate(() => window.__SMOKE__);
await browser.close();

if (!result) { console.error('smoke: no result signal'); process.exit(1); }
console.log(`smoke: ${result.passed}/${result.total} rendered, ${result.failed} failed`);
if (!result.ok) {
  console.error('FAILURES:\n  ' + result.fails.join('\n  '));
  process.exit(1);
}
// A demo can render and still be broken — a failed fetch, a React warning, an
// unhandled rejection all land here and nowhere else. This array was collected
// from day one and then ignored, which is how errors stayed invisible.
if (consoleErrors.length) {
  console.error(`smoke: ${consoleErrors.length} console error(s) during the run:\n  ` + consoleErrors.join('\n  '));
  process.exit(1);
}
console.log('smoke: console clean');
process.exit(0);
