// MD87: the starter smoke named an overflow only by getBoundingClientRect().right, so a text overflow (PR 284: a title in a
// 0px grid column, scrollWidth > clientWidth) printed 'no element reaches past the viewport'. The culprit list now also
// names elements whose text is wider than their box: selector and both widths.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { overflowCulprits } from '../scripts/overflow_culprits.mjs';

function el(tagName, { className = '', id = '', right = 0, scrollWidth = 0, clientWidth = 0, overflowX = 'visible' } = {}) {
  return { tagName: tagName.toUpperCase(), className, id, scrollWidth, clientWidth, overflowX, getBoundingClientRect: () => ({ right }) };
}
const page = (nodes, viewport = 375) => ({
  documentElement: { clientWidth: viewport },
  body: { querySelectorAll: () => nodes },
  defaultView: { getComputedStyle: (node) => ({ overflowX: node.overflowX }) },
});

describe('overflowCulprits (MD87)', () => {
  it('names an element past the viewport edge by its right edge, as before', () => {
    const doc = page([el('div', { className: 'card wide', right: 420 }), el('p', { right: 300 })]);
    expect(overflowCulprits(doc)).toEqual(['div.card.wide +45px']);
  });

  it('names a text overflow with its selector and both widths when nothing reaches past the viewport', () => {
    const doc = page([el('h2', { className: 'sc-title', right: 200, scrollWidth: 312, clientWidth: 0 })]);
    expect(overflowCulprits(doc)).toEqual(['h2.sc-title scrollWidth 312 > clientWidth 0']);
  });

  it('puts the id in the selector', () => {
    const doc = page([el('h2', { id: 'plan-title', scrollWidth: 90, clientWidth: 40 })]);
    expect(overflowCulprits(doc)).toEqual(['h2#plan-title scrollWidth 90 > clientWidth 40']);
  });

  it('lists the widest text overflows first and at most three of them', () => {
    const doc = page([1, 2, 3, 4, 5].map((n) => el('span', { className: `s${n}`, scrollWidth: 100 + n * 10, clientWidth: 100 })));
    expect(overflowCulprits(doc)).toEqual([
      'span.s5 scrollWidth 150 > clientWidth 100',
      'span.s4 scrollWidth 140 > clientWidth 100',
      'span.s3 scrollWidth 130 > clientWidth 100',
    ]);
  });

  it('skips a box that scrolls on purpose and a box whose content fits', () => {
    const doc = page([
      el('div', { className: 'scroller', scrollWidth: 900, clientWidth: 300, overflowX: 'auto' }),
      el('div', { className: 'scroller2', scrollWidth: 900, clientWidth: 300, overflowX: 'scroll' }),
      el('p', { scrollWidth: 300, clientWidth: 300 }),
    ]);
    expect(overflowCulprits(doc)).toEqual([]);
  });

  it('tolerates an svg whose className is not a string', () => {
    const svg = el('svg', { scrollWidth: 60, clientWidth: 20 });
    svg.className = { baseVal: 'icon' };
    expect(overflowCulprits(page([svg]))).toEqual(['svg scrollWidth 60 > clientWidth 20']);
  });

  it('lists the viewport-edge culprits before the text ones', () => {
    const doc = page([el('h2', { className: 't', scrollWidth: 312, clientWidth: 0 }), el('div', { className: 'w', right: 400 })]);
    expect(overflowCulprits(doc)).toEqual(['div.w +25px', 'h2.t scrollWidth 312 > clientWidth 0']);
  });
});

describe('the starter smoke prints the text overflow culprits', () => {
  const smoke = readFileSync('scripts/smoke_starters.mjs', 'utf8');
  it('collects the culprits with the shared walk, not a second copy', () => {
    expect(smoke).toMatch(/import \{ overflowCulprits \} from '\.\/overflow_culprits\.mjs'/);
    expect(smoke).toMatch(/culprits: await page\.evaluate\(overflowCulprits\)|page\.evaluate\(overflowCulprits\)/);
  });
  it('says what it checked when no culprit is found', () => {
    expect(smoke).toMatch(/no element reaches past the viewport and no text is wider than its box/);
  });
});
