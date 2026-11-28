// Real Chromium: the shared 404 page (404.html) follows the stored theme, and its languages sit centred (MD148, MD149).
// MD148: the page loads browser/theme-init.js, so a saved `efolusi-theme` choice wins over the device: a saved dark choice on a
//   light device shows dark, a saved light choice on a dark device shows light, and with nothing saved the page follows the
//   device. The page is served under a strict CSP (default-src 'self'), as a static host would, and nothing may be blocked.
// MD149: with one language kept (the other <section> deleted) the single section sits in the middle of the page from 880px,
//   not in the left half of a two-column grid; with both kept the two sit side by side, one each side of the middle.
// The page is served from the repo by a route handler on a path that does not exist (/missing/page), as a host serves a 404:
// no server, no network. Optional argv[2] is an installed playwright entrypoint; EXECUTABLE_PATH picks the browser.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const { chromium } = await import(process.argv[2] || 'playwright');
const root = new URL('../', import.meta.url).pathname;
const ORIGIN = 'http://meridian.test';
const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; base-uri 'none'; form-action 'none'";
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

const full = await readFile(path.join(root, '404.html'), 'utf8');
// One language kept: the Indonesian section deleted, as the guide says.
const english = full.replace(/\s*<section class="ef-notfound__lang" lang="id"[\s\S]*?<\/section>/, '');
assert.notEqual(english, full, 'the Indonesian section is found and removed');
assert.equal(english.match(/<section\b/g).length, 1, 'one section is left');

const luminance = (rgb) => {
  const [r, g, b] = rgb.match(/[\d.]+/g).slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

const browser = await chromium.launch(process.env.EXECUTABLE_PATH ? { executablePath: process.env.EXECUTABLE_PATH } : {});
let checked = 0;
const ok = (n = 1) => { checked += n; };

async function open({ html, width, device, stored }) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, colorScheme: device });
  if (stored) await ctx.addInitScript((v) => { try { localStorage.setItem('efolusi-theme', v); } catch {} }, stored);
  const page = await ctx.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`request failed: ${r.url()}`));
  await page.route(`${ORIGIN}/**`, async (route) => {
    const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
    const headers = { 'content-security-policy': CSP };
    if (pathname === '/missing/page') return route.fulfill({ status: 404, contentType: 'text/html', headers, body: html });
    const file = path.join(root, pathname);
    if (!file.startsWith(root)) return route.fulfill({ status: 403, body: '' });
    try { await route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', headers, body: await readFile(file) }); }
    catch { problems.push(`missing file: ${pathname}`); await route.fulfill({ status: 404, body: '' }); }
  });
  await page.addInitScript(() => {
    window.__violations = [];
    document.addEventListener('securitypolicyviolation', (e) => window.__violations.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
  await page.goto(`${ORIGIN}/missing/page`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  return { ctx, page, problems };
}

try {
  // MD148: the stored choice wins, at phone and desktop width.
  const cases = [
    { device: 'light', stored: null, expect: 'light' },
    { device: 'light', stored: 'dark', expect: 'dark' },
    { device: 'dark', stored: null, expect: 'dark' },
    { device: 'dark', stored: 'light', expect: 'light' },
  ];
  for (const width of [375, 1280]) {
    for (const c of cases) {
      const where = `${width}px, ${c.device} device, stored ${c.stored ?? 'nothing'}`;
      const { ctx, page, problems } = await open({ html: full, width, device: c.device, stored: c.stored });
      const m = await page.evaluate(() => {
        const title = document.querySelector('h1');
        return {
          theme: document.documentElement.getAttribute('data-theme'),
          bg: getComputedStyle(document.body).backgroundColor,
          ink: getComputedStyle(title).color,
          violations: window.__violations,
          scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
          styled: getComputedStyle(document.querySelector('.ef-notfound__home')).minHeight,
        };
      });
      assert.deepEqual(problems, [], `${where}: no failed request, no page error`);
      assert.deepEqual(m.violations, [], `${where}: nothing blocked by the CSP`);
      assert.equal(m.theme, c.expect, `${where}: data-theme`);
      const dark = luminance(m.bg) < 0.1, light = luminance(m.bg) > 0.7;
      assert.ok(c.expect === 'dark' ? dark : light, `${where}: the page ground is ${c.expect} (${m.bg})`);
      assert.ok(contrast(m.ink, m.bg) >= 7, `${where}: title contrast ${contrast(m.ink, m.bg).toFixed(2)} on ${m.bg}`);
      assert.notEqual(m.styled, '0px', `${where}: the stylesheet applied`);
      assert.ok(m.scrollW <= m.clientW, `${where}: no sideways scroll`);
      await ctx.close();
      ok(7);
      console.log(`ok ${where}: data-theme ${m.theme}, ground ${m.bg}`);
    }
  }

  // MD149: where the sections sit. Centre of each section's text block against the middle of the page.
  const place = async (html, width) => {
    const { ctx, page, problems } = await open({ html, width, device: 'light', stored: null });
    const m = await page.evaluate(() => ({
      mid: document.documentElement.clientWidth / 2,
      sections: [...document.querySelectorAll('.ef-notfound__lang')].map((el) => { const r = el.getBoundingClientRect(); const h = el.querySelector('h1,h2').getBoundingClientRect(); return { centre: (r.left + r.right) / 2, headCentre: (h.left + h.right) / 2, width: r.width }; }),
      scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
    }));
    assert.deepEqual(problems, [], `${width}px: no failed request, no page error`);
    assert.ok(m.scrollW <= m.clientW, `${width}px: no sideways scroll`);
    await ctx.close();
    return m;
  };
  for (const width of [375, 879, 880, 1024, 1280, 1920]) {
    const one = await place(english, width);
    assert.equal(one.sections.length, 1, `${width}px one language: one section`);
    assert.ok(Math.abs(one.sections[0].centre - one.mid) < 1, `${width}px one language: the section is centred (${one.sections[0].centre} vs ${one.mid})`);
    assert.ok(Math.abs(one.sections[0].headCentre - one.mid) < 1, `${width}px one language: its title is centred`);
    const two = await place(full, width);
    assert.equal(two.sections.length, 2, `${width}px two languages: two sections`);
    const [a, b] = two.sections;
    if (width >= 880) {
      assert.ok(a.centre < two.mid && b.centre > two.mid, `${width}px two languages: side by side, one each side of the middle`);
      assert.ok(Math.abs((two.mid - a.centre) - (b.centre - two.mid)) < 1, `${width}px two languages: mirrored about the middle`);
      assert.ok(Math.abs(a.width - b.width) < 1, `${width}px two languages: equal columns`);
    } else {
      assert.ok(Math.abs(a.centre - two.mid) < 1 && Math.abs(b.centre - two.mid) < 1, `${width}px two languages: stacked, both centred`);
    }
    ok(6);
    console.log(`ok ${width}px: one language centre ${one.sections[0].centre.toFixed(1)} of ${one.mid}; two ${a.centre.toFixed(1)} and ${b.centre.toFixed(1)}`);
  }
} finally { await browser.close(); }
console.log(`check_not_found: ${checked} assertions passed`);
