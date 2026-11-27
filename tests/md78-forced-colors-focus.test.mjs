// MD78: forced-colors mode drops box-shadow, and 69 component files draw their focus ring as a box-shadow after
// `outline:none`, so a focused control could show no ring at all (WCAG 2.4.7). MD74 fixed Switch, Toolbar and Player
// one by one. The systemic fix is one rule in tokens/base.css: a 2px Highlight outline on every :focus-visible, with
// !important so it also beats a product's own `outline:none`. It is unlayered, and an important declaration in an
// unlayered rule loses to an important one in a layer, so no component may carry an `!important` outline: a test
// scans all of them. A component forced-colors block must not set a focus outline that differs from the base rule.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (file) => readFileSync(file, 'utf8');
const components = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.jsx')) components.push(path);
  }
};
walk('components');
const css = (file) => /const CSS = `([\s\S]*?)`;/.exec(read(file))?.[1] ?? '';
// The text inside each `@media (forced-colors:active){ ... }`, braces balanced.
const forcedBlocks = (text) => {
  const blocks = [];
  let from = 0;
  for (;;) {
    const start = text.indexOf('@media (forced-colors:active){', from);
    if (start === -1) return blocks;
    let depth = 0;
    let end = start + '@media (forced-colors:active)'.length;
    for (; end < text.length; end += 1) {
      if (text[end] === '{') depth += 1;
      if (text[end] === '}') { depth -= 1; if (depth === 0) break; }
    }
    blocks.push(text.slice(start + '@media (forced-colors:active){'.length, end));
    from = end;
  }
};
// [selector, body] pairs of the flat rules in a block.
const rules = (block) => [...block.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [m[1].trim(), m[2]]);

describe('the one forced-colors focus rule (tokens/base.css)', () => {
  const base = read('tokens/base.css');
  const [block] = forcedBlocks(base);

  it('draws a 2px Highlight outline, offset 2px, on every :focus-visible, with !important', () => {
    expect(block).toContain(':focus-visible{outline:2px solid Highlight!important;outline-offset:2px}');
  });

  it('is unlayered: every brace before it is closed, so it is outside @layer meridian', () => {
    const before = base.slice(0, base.indexOf('@media (forced-colors:active)')).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(before).toContain('@layer meridian{');
    const depth = [...before].reduce((n, c) => n + (c === '{') - (c === '}'), 0);
    expect(depth).toBe(0);
  });

  it('is the only !important outline in the stylesheet', () => {
    expect(base.replace(/\/\*[\s\S]*?\*\//g, '').match(/outline[^;}]*!important/g)).toHaveLength(1);
  });
});

describe('no component fights the base focus rule', () => {
  it('scans every component file (guards the scan itself)', () => {
    expect(components.length).toBeGreaterThan(100);
    expect(components.filter((file) => forcedBlocks(css(file)).length > 0).length).toBeGreaterThanOrEqual(6);
  });

  it('no component sets an !important outline: a layered important beats the unlayered one', () => {
    for (const file of components) expect(css(file), file).not.toMatch(/outline[^;}]*!important/);
  });

  it('no forced-colors block removes or restyles a focus outline other than the base rule\'s', () => {
    for (const file of components) {
      for (const block of forcedBlocks(css(file))) {
        for (const [selector, body] of rules(block)) {
          const outline = /(?:^|;)outline:([^;]*)/.exec(body)?.[1];
          const offset = /(?:^|;)outline-offset:([^;]*)/.exec(body)?.[1];
          if (/:focus(-visible|-within)?\b/.test(selector)) {
            expect(outline, `${file} ${selector}`).toBe('2px solid Highlight');
            expect(offset, `${file} ${selector}`).toBe('2px');
          }
          // An edge outline on a selected or default state is fine; none may switch the outline off.
          if (outline !== undefined) expect(outline, `${file} ${selector}`).not.toMatch(/^(none|0|transparent)\b/);
          expect(body, `${file} ${selector}`).not.toMatch(/outline-(style|width):\s*(none|0)/);
        }
      }
    }
  });

  it('catches a component that would fight it (the scan itself, on a bad rule)', () => {
    const bad = forcedBlocks('x @media (forced-colors:active){.a:focus-visible{outline:none}.b{outline:1px solid Highlight}} y');
    expect(rules(bad[0])).toEqual([['.a:focus-visible', 'outline:none'], ['.b', 'outline:1px solid Highlight']]);
  });
});

describe('the restated Switch, Toolbar and Player focus rules (MD74 round 2)', () => {
  // The base rule now covers them (same value, !important, unlayered), so they are redundant. They stay in this change:
  // tests/forced-colors-edges.test.mjs pins them, and removing a pinned rule is its own decision. Until then they must
  // agree with the base rule exactly, so the two can never disagree.
  for (const file of ['components/forms/Switch.jsx', 'components/display/Toolbar.jsx', 'components/ai/Player.jsx']) {
    it(`${file} restates exactly the base outline`, () => {
      const focus = forcedBlocks(css(file)).flatMap(rules).filter(([selector]) => selector.includes(':focus-visible'));
      expect(focus).toHaveLength(1);
      expect(focus[0][1]).toBe('outline:2px solid Highlight;outline-offset:2px');
    });
  }
});
