// MD74: the link colour is 2.43:1 against the body ink in light and 1.88:1 in dark. Under 3:1 colour alone
// does not mark a link in running text (WCAG 1.4.1), so the underline is the marker. This test measures that
// pair and holds the Link component, the prose-link rule in base.css and the legal text to the underline.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { THEMES, ratio } from './helpers/token-table.mjs';

const rule = (css, selector) => {
  const start = css.indexOf(`${selector}{`);
  expect(start, `${selector} rule`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf('}', start));
};
const linkCss = /const CSS = `([\s\S]*?)`;/.exec(readFileSync('components/display/Link.jsx', 'utf8'))[1];
const baseCss = readFileSync('tokens/base.css', 'utf8');

describe('links in running text are underlined (MD74)', () => {
  it('measures why: the link colour against the body ink is under 3:1 in both themes', () => {
    for (const [name, table] of THEMES) {
      const r = ratio(table, '--text-link', '--text-primary');
      expect(r, `${name} link against body ink`).toBeLessThan(3);
    }
  });

  it('underlines the Link component and keeps the underline on hover', () => {
    expect(rule(linkCss, '.ef-link')).toMatch(/text-decoration:underline/);
    expect(rule(linkCss, '.ef-link:hover')).not.toMatch(/text-decoration:none/);
    expect(rule(linkCss, '.ef-link--standalone')).toMatch(/text-decoration:none/);
  });

  it('keeps the quiet variant plain at rest and underlined on hover and keyboard focus (navigation and footers, never running text)', () => {
    expect(rule(linkCss, '.ef-link--quiet')).toMatch(/text-decoration:none/);
    const hover = linkCss.slice(linkCss.indexOf('.ef-link--quiet:hover'), linkCss.indexOf('}', linkCss.indexOf('.ef-link--quiet:hover')));
    // The hover half sits inside @media (hover:hover) (MD132 sweep); the keyboard focus half is its own rule.
    expect(linkCss).toContain('@media (hover:hover){.ef-link--quiet:hover{');
    expect(rule(linkCss, '.ef-link--quiet:focus-visible')).toMatch(/text-decoration:underline/);
    expect(hover).toMatch(/text-decoration:underline/);
    // The quiet rules come after the base ones so equal specificity resolves to quiet.
    expect(linkCss.indexOf('.ef-link--quiet{')).toBeGreaterThan(linkCss.indexOf('.ef-link:hover{'));
    expect(readFileSync('components/display/Link.prompt.md', 'utf8')).toMatch(/quiet[^.]*navigation[^.]*footer[^.]*never running text/i);
  });

  // The classless-anchor rule in tokens/base.css, and the parents it covers, are held by tests/md92-link-parents.test.mjs.

  it('keeps the legal document links underlined', () => {
    const legal = readFileSync('components/marketing/LegalDocument.jsx', 'utf8');
    expect(legal).toMatch(/\.ef-legal a\{[^}]*text-decoration:underline/);
  });
});
