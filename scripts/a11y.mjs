#!/usr/bin/env node
// Accessibility check: loads site/_smoke.html in a real browser, runs axe-core
// (WCAG 2.0, 2.1 and 2.2, levels A and AA) over the chosen demo groups in the
// light and dark themes, and exits 1 on any serious or critical violation.
// Requires a static server on BASE and a Playwright browser, like
// scripts/smoke_headless.mjs.
//   BASE=http://localhost:8000 npm run a11y
//   A11Y_GROUPS=marketing,forms   only these groups (default: marketing)
//   A11Y_GROUPS=all               every group on the smoke page
// Set EXECUTABLE_PATH to use an installed Chrome/Chromium binary locally.
import * as playwright from 'playwright';
import { createRequire } from 'node:module';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = process.env.BASE || 'http://localhost:8000';
const EXECUTABLE_PATH = process.env.EXECUTABLE_PATH || '';
const GROUPS = (process.env.A11Y_GROUPS || 'marketing').split(',').map((g) => g.trim()).filter(Boolean);
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const BLOCKING = new Set(['serious', 'critical']);

const started = Date.now();
const browser = await playwright.chromium.launch(EXECUTABLE_PATH ? { executablePath: EXECUTABLE_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
await page.goto(`${BASE}/site/_smoke.html`, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => document.documentElement.getAttribute('data-smoke') !== null, { timeout: 60000 });
// Measure the settled page: web fonts and late icons change text metrics and fills.
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
await page.addScriptTag({ content: AXE });
// The theme switch below animates colours; measure the settled colours, not a frame
// in between (a mid-transition dark run reported 92 false contrast failures).
await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });

const selectors = GROUPS.includes('all') ? ['section[data-group]'] : GROUPS.map((g) => `section[data-group="${g}"]`);
const missing = await page.evaluate((list) => list.filter((s) => !document.querySelector(s)), selectors);
if (missing.length) {
  console.error(`a11y: no such group on the smoke page: ${missing.join(', ')}`);
  await browser.close();
  process.exit(1);
}

let blocking = 0;
for (const theme of ['light', 'dark']) {
  await page.evaluate((t) => {
    if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }, theme);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const result = await page.evaluate(async ({ include, tags }) => {
    const r = await window.axe.run({ include: include.map((s) => [s]) }, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] });
    return r.violations.map((v) => ({
      id: v.id, impact: v.impact, help: v.help,
      nodes: v.nodes.map((n) => ({ target: n.target.join(' ') })),
    }));
  }, { include: selectors, tags: TAGS });
  for (const v of result) {
    const block = BLOCKING.has(v.impact);
    if (block) blocking += v.nodes.length;
    console.log(`${block ? 'FAIL' : 'warn'} [${theme}] ${v.impact} ${v.id}: ${v.help} (${v.nodes.length})`);
    for (const n of v.nodes.slice(0, 8)) console.log(`       ${n.target}`);
  }
  if (!result.length) console.log(`ok   [${theme}] no violations`);
}

await browser.close();
const secs = ((Date.now() - started) / 1000).toFixed(1);
console.log(`a11y: ${GROUPS.join(', ')} in light and dark, ${blocking} serious or critical node(s), ${secs}s`);
process.exit(blocking ? 1 : 0);
