// MD73: at 375px a table with many columns scrolls sideways and nothing says more columns exist. The scroll
// wrapper fades its inline-end edge while content is hidden there. CSS only: a scroll-driven animation
// resizes the two layers of a mask (a solid one and a 28px fade at the end edge), so nothing listens to scroll
// or measures layout in JS. A table that fits has an inactive timeline, and the base mask is a solid layer
// with a 0-wide fade: fully opaque. Playwright (CI) looks at the pixels.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('components/data/Table.jsx', 'utf8');
const css = /const CSS = `([\s\S]*?)`;/.exec(source)[1];
const block = (open) => {
  const start = css.indexOf(open);
  expect(start, open).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    if (css[i] === '}' && (depth -= 1) === 0) return css.slice(start, i + 1);
  }
  throw new Error(`${open} is not closed`);
};

describe('Table scroll wrapper fades its end edge while content is hidden (MD73)', () => {
  const SUPPORTS = '@supports (animation-timeline:scroll(self inline)){';

  it('shrinks the fade from 28px to 0 over the last 40px of the scroll, so the end is not faded', () => {
    const frames = block('@keyframes ef-table-fade');
    expect(frames).toMatch(/from\{mask-size:calc\(100% - 28px\) 100%,28px 100%\}/);
    expect(frames).toMatch(/to\{mask-size:100% 100%,0 100%\}/);
    const wrap = block(SUPPORTS);
    expect(wrap).toContain('animation-name:ef-table-fade');
    expect(wrap).toContain('animation-timeline:scroll(self inline)');
    expect(wrap).toContain('animation-range:calc(100% - 40px) 100%');
    expect(wrap).toContain('animation-fill-mode:both');
  });

  it('starts opaque: a solid layer at full size plus a fade layer 0 wide (currentcolor: a mask reads alpha only, a literal black would be a raw colour), so a table that fits is not masked', () => {
    const wrap = block(SUPPORTS);
    expect(wrap).toMatch(/\.ef-table-wrap\{[^}]*mask-image:linear-gradient\(currentcolor,currentcolor\),linear-gradient\(to right,currentcolor,transparent\)/);
    expect(wrap).toMatch(/\.ef-table-wrap\{[^}]*mask-size:100% 100%,0 100%/);
    expect(wrap).toMatch(/\.ef-table-wrap\{[^}]*mask-position:left,right/);
    expect(wrap).toMatch(/\.ef-table-wrap\{[^}]*mask-repeat:no-repeat/);
  });

  it('mirrors in right-to-left, and drops the mask while the wrap has the focus ring', () => {
    const wrap = block(SUPPORTS);
    expect(wrap).toMatch(/\.ef-table-wrap:dir\(rtl\)\{mask-image:linear-gradient\(currentcolor,currentcolor\),linear-gradient\(to left,currentcolor,transparent\);mask-position:right,left\}/);
    expect(wrap).toMatch(/\.ef-table-wrap:focus-visible\{mask-image:none;animation-name:none\}/);
  });

  it('adds no scroll listener and no layout read to do it', () => {
    expect(source).not.toMatch(/addEventListener\(\s*['"]scroll['"]/);
    expect(source).not.toMatch(/onScroll/);
  });

  it('keeps the region role, tab stop and label of the scroll wrapper', () => {
    expect(source).toMatch(/tabIndex: 0, role: callerName \? 'region' : 'group'/);
  });
});
