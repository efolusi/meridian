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
// A request that never gets a response (reset connection, aborted fetch) is
// not a 4xx and was invisible. Icon.jsx caches such a failure as an empty glyph.
page.on('requestfailed', request => {
  consoleErrors.push(`request failed ${request.url()} (${request.failure()?.errorText || 'unknown'})`);
});
// Icons arrive by fetch() after their demo has rendered, one request per name,
// so the smoke signal can fire while some are still in flight. Track them so
// captures wait for every glyph instead of racing the static server.
const iconRequests = new Set();
const isIcon = request => request.url().includes('/assets/icons/');
page.on('request', request => { if (isIcon(request)) iconRequests.add(request); });
page.on('requestfinished', request => iconRequests.delete(request));
page.on('requestfailed', request => iconRequests.delete(request));

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
  // The sticky summary banner paints over whichever section is scrolled under
  // it, so it was getting baked into the captures — carrying the live demo
  // count, which would churn every affected baseline whenever a demo is added.
  //
  // content-visibility:auto (MessageScroller items) skips painting whatever the
  // browser judges off-screen, and that judgement updates asynchronously as the
  // element screenshots scroll the page. The same commit then captured the
  // anchored transcript with or without its last two bubbles (and with or
  // without the jump button, which follows the placeholder heights). Paint
  // everything so a capture depends on the code, not on scroll timing.
  await page.addStyleTag({ content: '#summary, h1, [data-live] { display: none !important; } * { content-visibility: visible !important; }' });
  // Let layout observers (MessageScroller measures its items) settle on the real sizes.
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  // Everything a capture depends on, re-checked before every group shot: no icon
  // request in flight, every icon span holding a painted <svg>, fonts loaded,
  // and two frames for the paint. An icon that never fills fails the run rather
  // than being baked into a baseline as a blank.
  async function settle() {
    const deadline = Date.now() + 30000;
    while (iconRequests.size && Date.now() < deadline) await new Promise(r => setTimeout(r, 50));
    if (iconRequests.size) throw new Error(`smoke: ${iconRequests.size} icon request(s) still pending after 30s`);
    try {
      await page.waitForFunction(() => [...document.querySelectorAll('[data-slot="icon"]')].every(span => {
        const svg = span.querySelector('svg');
        if (!svg) return false;
        const box = svg.getBoundingClientRect();
        // A hidden icon (display:none ancestor) has no box and nothing to paint.
        return (box.width > 0 && box.height > 0) || span.getClientRects().length === 0;
      }), null, { timeout: 30000, polling: 50 });
    } catch {
      const blanks = await page.evaluate(() => [...document.querySelectorAll('[data-slot="icon"]')]
        .filter(span => !span.querySelector('svg'))
        .map(span => span.closest('section[data-group]')?.getAttribute('data-group') || '?'));
      throw new Error(`smoke: ${blanks.length} icon(s) never rendered an <svg> (groups: ${[...new Set(blanks)].join(', ')})`);
    }
    await page.evaluate(() => document.fonts.ready);
    // Avatar photos and other <img>: decoded before paint, so a slow decode is not captured half-drawn.
    await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))));
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  }

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
      await settle();
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
