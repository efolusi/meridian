#!/usr/bin/env node
// Browser-contract smoke for every copyable starter page plus the Tools wizard.
// Unlike the component-demo smoke, this catches DC prop coercion, hover-style
// collisions, responsive overflow and composed-layout regressions.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE || 'http://127.0.0.1:8000';
const EXECUTABLE_PATH = process.env.EXECUTABLE_PATH || '';
const ROOT = new URL('..', import.meta.url).pathname;
const widths = [320, 375, 414, 768, 1280];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const starterPages = walk(path.join(ROOT, 'starters'))
  .filter(file => file.endsWith('.dc.html'))
  .map(file => path.relative(ROOT, file).split(path.sep).join('/'))
  .sort();

const browser = await chromium.launch(EXECUTABLE_PATH ? { executablePath: EXECUTABLE_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
let pageErrors = [];
page.on('console', message => {
  const text = message.text();
  // HTTP failures are recorded by the response handler below with their URL;
  // Chromium's duplicate console line omits it and cannot distinguish favicon.
  if (message.type() === 'error' && !text.startsWith('Failed to load resource:')) pageErrors.push(text);
});
page.on('pageerror', error => pageErrors.push(error.message));
page.on('response', response => {
  if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) {
    pageErrors.push(`HTTP ${response.status()} ${response.url()}`);
  }
});

const failures = [];
for (const width of widths) {
  await page.setViewportSize({ width, height: width < 768 ? 900 : 800 });
  for (const rel of starterPages) {
    pageErrors = [];
    await page.goto(`${BASE}/${rel}`, { waitUntil: 'load', timeout: 60000 });
    try {
      await page.waitForSelector('.sc-host', { timeout: 30000 });
      await page.waitForTimeout(120);
    } catch (error) {
      failures.push(`${rel} @ ${width}px: DC host did not mount`);
      continue;
    }
    const state = await page.evaluate(() => ({
      errors: [...document.querySelectorAll('.sc-has-error,.sc-logic-error')]
        .map(node => node.textContent.trim()).filter(Boolean),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    for (const error of [...new Set([...state.errors, ...pageErrors])]) {
      failures.push(`${rel} @ ${width}px: ${error}`);
    }
    if (state.overflow > 1) failures.push(`${rel} @ ${width}px: horizontal overflow +${state.overflow}px`);

    if (width === 1280) {
      for (const anchor of await page.locator('nav a').all()) {
        await anchor.hover();
        const decoration = await anchor.evaluate(node => getComputedStyle(node).textDecorationLine);
        if (decoration.includes('underline')) {
          const label = (await anchor.textContent() || '').trim();
          failures.push(`${rel}: nav link "${label}" underlines on hover`);
        }
      }
    }
  }
}

// The composed Tools screen exposed two visual regressions that a render-only
// smoke could not see: an always-underlined pseudo-link and a 3-step rail that
// ended at two-thirds width.
pageErrors = [];
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(`${BASE}/showcases/tools/index.html`, { waitUntil: 'load', timeout: 60000 });
await page.waitForSelector('.ef-steps--h .ef-steps__marker', { timeout: 30000 });
await page.waitForTimeout(120);
const tools = await page.evaluate(() => {
  const steps = document.querySelector('.ef-steps--h').getBoundingClientRect();
  const markers = [...document.querySelectorAll('.ef-steps--h .ef-steps__marker')].map(node => node.getBoundingClientRect());
  const action = document.querySelector('.ef-filedrop__action');
  return {
    firstGap: markers[0].left - steps.left,
    lastGap: steps.right - markers.at(-1).right,
    actionDecoration: getComputedStyle(action).textDecorationLine,
  };
});
await page.locator('.ef-filedrop').hover();
const hoveredDecoration = await page.locator('.ef-filedrop__action').evaluate(node => getComputedStyle(node).textDecorationLine);
if (Math.abs(tools.firstGap) > 2 || Math.abs(tools.lastGap) > 2) {
  failures.push(`Tools Steps does not span edge-to-edge (start ${tools.firstGap.toFixed(1)}px, end ${tools.lastGap.toFixed(1)}px)`);
}
if (tools.actionDecoration.includes('underline') || hoveredDecoration.includes('underline')) {
  failures.push('Tools FileDrop action is underlined in default or hover state');
}
for (const error of pageErrors) failures.push(`showcases/tools: ${error}`);

await browser.close();
if (failures.length) {
  console.error(`starter smoke: ${failures.length} failure(s):\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
console.log(`starter smoke: ${starterPages.length} pages × ${widths.length} widths, nav hover, and Tools layout passed`);
