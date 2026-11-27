#!/usr/bin/env node
// Accessibility check: loads site/_smoke.html in a real browser, runs axe-core
// (WCAG 2.0, 2.1 and 2.2, levels A and AA) over the chosen demo groups in the
// light and dark themes at a 1280px desktop width and again at a 390px phone
// width (target-size and reflow), and exits 1 on any serious or critical
// violation. At 390px it also fails when the page scrolls sideways, except
// inside a region that scrolls on purpose: no sideways scroll at 390px is a
// proxy for WCAG 1.4.10 Reflow, which asks for 320px; this is not a 1.4.10 check.
// A group with no elements on the page fails: axe passes an empty section.
// Moderate and minor findings never fail the run: each is printed as `warn`
// and the closing line counts them, so a rising count shows in the CI log.
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
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'phone', width: 390, height: 844 },
];

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

// An empty section has nothing for axe to flag, so it would pass; count what is there.
const counts = await page.evaluate((list) => list.map((s) => [s, document.querySelectorAll(`${s} *`).length]), selectors);
let blocking = 0;
for (const [sel, n] of counts) {
  console.log(`${n ? 'ok  ' : 'FAIL'} ${sel}: ${n} element(s) to check`);
  if (!n) blocking += 1;
}
let warnings = 0;
const warnRules = new Set();
for (const viewport of VIEWPORTS) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  for (const theme of ['light', 'dark']) {
    const label = `${theme} ${viewport.width}px`;
    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
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
      else {
        warnings += v.nodes.length;
        warnRules.add(v.id);
      }
      console.log(`${block ? 'FAIL' : 'warn'} [${label}] ${v.impact} ${v.id}: ${v.help} (${v.nodes.length})`);
      for (const n of v.nodes.slice(0, 8)) console.log(`       ${n.target}`);
    }
    if (!result.length) console.log(`ok   [${label}] no violations`);
    if (viewport.width <= 400) {
      const wide = await page.evaluate(({ include }) => {
        const root = document.scrollingElement;
        if (root.scrollWidth <= window.innerWidth) return [];
        const path = (el) => {
          const parts = [];
          for (let n = el; n && n !== document.body && parts.length < 4; n = n.parentElement) {
            parts.unshift(n.tagName.toLowerCase() + (n.id ? `#${n.id}` : '') + (typeof n.className === 'string' && n.className.trim() ? `.${n.className.trim().split(/\s+/)[0]}` : ''));
          }
          return parts.join(' > ');
        };
        // An element is a culprit when it sticks out past the right edge and no
        // ancestor clips it or scrolls it on purpose.
        const clipped = (el) => {
          for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
            const o = getComputedStyle(n).overflowX;
            if (o !== 'visible') return true;
          }
          return false;
        };
        const out = [];
        for (const section of document.querySelectorAll(include.join(','))) {
          for (const el of section.querySelectorAll('*')) {
            const r = el.getBoundingClientRect();
            if (r.width && r.right > window.innerWidth + 1 && !clipped(el)) out.push(path(el));
          }
        }
        return out.length ? out : ['(page wider than the viewport, no single element found)'];
      }, { include: selectors });
      if (wide.length) {
        blocking += wide.length;
        console.log(`FAIL [${label}] reflow: page scrolls sideways (${wide.length})`);
        for (const w of wide.slice(0, 8)) console.log(`       ${w}`);
      } else console.log(`ok   [${label}] no sideways scroll`);
    }
  }
}

await browser.close();
const secs = ((Date.now() - started) / 1000).toFixed(1);
console.log(`a11y: ${GROUPS.join(', ')} in light and dark at ${VIEWPORTS.map((v) => v.width + 'px').join(' and ')}, ${blocking} serious or critical node(s), ${warnings} moderate or minor warning node(s) in ${warnRules.size} rule(s) (not blocking), ${secs}s`);
process.exit(blocking ? 1 : 0);
