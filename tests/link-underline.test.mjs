// MD74: the link colour is 2.43:1 against the body ink in light and 1.88:1 in dark. Under 3:1 colour alone
// does not mark a link in running text (WCAG 1.4.1), so the underline is the marker. This test measures that
// pair and holds the Link component, the prose-link rule in base.css and the legal text to the underline.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrast } from '../scripts/contrast.mjs';
import { readTokenCss } from './helpers/token-css.mjs';

const tokens = readTokenCss('colors.css');
const vars = (text) => Object.fromEntries([...text.matchAll(/(--[\w-]+):([^;}]+)/g)].map(([, n, v]) => [n, v.trim()]));
const block = (selector) => {
  const start = tokens.indexOf(`${selector}{`);
  return tokens.slice(start, tokens.indexOf('\n}', start));
};
const light = vars(block(':root,[data-theme="light"]'));
const dark = { ...light, ...vars(block('[data-theme="dark"]')) };
const toRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};
const resolve = (table, name) => {
  let v = table[name];
  for (let i = 0; i < 10 && /^var\(/.test(v); i += 1) v = table[/var\((--[\w-]+)\)/.exec(v)[1]];
  return toRgb(v);
};

const rule = (css, selector) => {
  const start = css.indexOf(`${selector}{`);
  expect(start, `${selector} rule`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf('}', start));
};
const linkCss = /const CSS = `([\s\S]*?)`;/.exec(readFileSync('components/display/Link.jsx', 'utf8'))[1];
const baseCss = readFileSync('tokens/base.css', 'utf8');

describe('links in running text are underlined (MD74)', () => {
  it('measures why: the link colour against the body ink is under 3:1 in both themes', () => {
    for (const [name, table] of [['light', light], ['dark', dark]]) {
      const r = contrast(resolve(table, '--text-link'), resolve(table, '--text-primary'));
      expect(r, `${name} link against body ink`).toBeLessThan(3);
    }
  });

  it('underlines the Link component and keeps the underline on hover', () => {
    expect(rule(linkCss, '.ef-link')).toMatch(/text-decoration:underline/);
    expect(rule(linkCss, '.ef-link:hover')).not.toMatch(/text-decoration:none/);
    expect(rule(linkCss, '.ef-link--standalone')).toMatch(/text-decoration:none/);
  });

  it('underlines a classless anchor inside a paragraph, definition, quote or caption, hover included', () => {
    const selector = ':where(p, dd, blockquote, figcaption) a:where(:not([class]))';
    expect(rule(baseCss, selector)).toMatch(/text-decoration:underline/);
    expect(rule(baseCss, `${selector}:hover`)).not.toMatch(/text-decoration:none/);
  });

  it('keeps the legal document links underlined', () => {
    const legal = readFileSync('components/marketing/LegalDocument.jsx', 'utf8');
    expect(legal).toMatch(/\.ef-legal a\{[^}]*text-decoration:underline/);
  });
});
