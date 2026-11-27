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

  it('mirrors in right-to-left, and drops the mask while the wrap or anything inside it has the focus ring', () => {
    const wrap = block(SUPPORTS);
    expect(wrap).toMatch(/\.ef-table-wrap:dir\(rtl\)\{mask-image:linear-gradient\(currentcolor,currentcolor\),linear-gradient\(to left,currentcolor,transparent\);mask-position:right,left\}/);
    // Any keyboard focus inside lifts it: the wrapper itself, a focused row (tabIndex 0 with onRowClick) or a control in the last column.
    expect(wrap).toContain('.ef-table-wrap:focus-visible,.ef-table-wrap:has(:focus-visible){mask-image:none}');
    // Only the mask lifts: toggling animation-name would restart the scroll-driven animation when focus leaves.
    expect(wrap).not.toMatch(/:has\(:focus-visible\)\{[^}]*animation-name/);
  });

  it('says in a comment why prefers-reduced-motion leaves the fade alone: a scroll timeline ignores animation-duration, and it is not motion', () => {
    expect(css).toMatch(/\/\*[^*]*prefers-reduced-motion[^*]*scroll timeline[^*]*not motion[^*]*\*\//);
  });

  it('adds no scroll listener and no layout read to do it', () => {
    expect(source).not.toMatch(/addEventListener\(\s*['"]scroll['"]/);
    expect(source).not.toMatch(/onScroll/);
  });

  it('keeps the region role, tab stop and label of the scroll wrapper', () => {
    expect(source).toMatch(/tabIndex: 0, role: callerName \? 'region' : 'group'/);
  });
});

// MD74 round 3: the RTL smoke pass failed with the fade still 28px "at the end of the scroll". In right-to-left scrollLeft
// runs from 0 (the inline START, the right edge) down to -(scrollWidth - clientWidth) (the inline END), so assigning a large
// positive scrollLeft clamps to 0, the start, and the fade is rightly still shown. The CSS was right and the case was wrong.
describe('the fade sits at the inline end in both directions, and the smoke case scrolls to it in both (MD74 round 3)', () => {
  const SUPPORTS = '@supports (animation-timeline:scroll(self inline)){';
  const wrap = block(SUPPORTS);
  const layers = (text) => text.split(/,(?![^(]*\))/).map((x) => x.trim());

  it('LTR: solid layer left, 28px fade layer right, gradient to the right', () => {
    const rule = /\.ef-table-wrap\{[^}]*\}/.exec(wrap)[0];
    expect(layers(/mask-position:([^;}]*)/.exec(rule)[1])).toEqual(['left', 'right']);
    expect(rule).toContain('linear-gradient(to right,currentcolor,transparent)');
  });

  it('RTL: solid layer right, fade layer left, gradient to the left: the fade layer is at the end in both', () => {
    const rule = /\.ef-table-wrap:dir\(rtl\)\{[^}]*\}/.exec(wrap)[0];
    expect(layers(/mask-position:([^;}]*)/.exec(rule)[1])).toEqual(['right', 'left']);
    expect(rule).toContain('linear-gradient(to left,currentcolor,transparent)');
  });

  it('measures progress along the inline axis, which follows the writing direction (start to end in RTL too)', () => {
    expect(wrap).toContain('animation-timeline:scroll(self inline)');
    // The keyframes name sizes only, no physical side, so they do not assume left-to-right.
    expect(block('@keyframes ef-table-fade')).not.toMatch(/left|right|translate|position/);
  });

  it('has the smoke case scroll to the inline END by direction: negative scrollLeft in RTL, positive in LTR', () => {
    const smoke = readFileSync('scripts/smoke_headless.mjs', 'utf8');
    expect(smoke).toMatch(/getComputedStyle\(wrap\)\.direction === 'rtl' \? -max : max/);
    expect(smoke).toMatch(/const max = wrap\.scrollWidth - wrap\.clientWidth/);
    // It also checks that the scroll really reached the end, so a wrong scroll is reported as such and not as a CSS bug.
    expect(smoke).toMatch(/Math\.abs\(wrap\.scrollLeft\) >= max - 1/);
    expect(smoke).not.toMatch(/wrap\.scrollLeft = toEnd \? wrap\.scrollWidth : 0/);
  });
});

// MD74 round 4: the RTL pass ended with the fade layer 0.0095px wide ('calc(100% - 0.00947806px) 100%, 0.00947806px 100%'): the
// scroll reached the inline end, but in RTL the maximum scroll is fractional and progress is 99.97%, so a sub-pixel remainder is left.
// That is not a visible fade, and the case asked for exactly 0. The case reads the fade layer's width in px, from any of the
// forms the computed size takes, calls it GONE under 0.5px and SHOWN over 27px (28px nominal), in both directions, and the poll
// needs two readings one animation frame apart to agree, so a transient value cannot pass.
describe('the smoke case reads the fade width with a tolerance (MD74 round 4)', () => {
  const smoke = readFileSync('scripts/smoke_headless.mjs', 'utf8');
  const source = /\/\/ fadePx:start\n([\s\S]*?)\/\/ fadePx:end/.exec(smoke);
  const fadePx = source ? new Function(`${source[1]}; return fadePx;`)() : null;
  const GONE = 0.5;
  const SHOWN = 27;

  it('exposes the parser between markers so it can be tested', () => {
    expect(source).not.toBeNull();
    expect(typeof fadePx).toBe('function');
  });

  it('takes the fade layer width in px from every form the computed size has', () => {
    expect(fadePx('calc(100% - 28px) 100%, 28px 100%')).toBe(28);
    expect(fadePx('100% 100%, 0px 100%')).toBe(0);
    expect(fadePx('calc(100% - 0.00947806px) 100%, 0.00947806px 100%')).toBeCloseTo(0.00947806, 8);
    expect(fadePx('347px 100%, 28px 100%')).toBe(28);
    expect(fadePx('100% 100%, 0 100%')).toBe(0);
    // Only the solid layer is readable: the fade is what the calc takes off it.
    expect(fadePx('calc(100% - 12.5px) 100%')).toBe(12.5);
    expect(Number.isNaN(fadePx('100% 100%'))).toBe(true);
  });

  it('calls the sub-pixel remainder GONE, 28px SHOWN, and a half-way fade neither', () => {
    const gone = (w) => w < GONE;
    const shown = (w) => w > SHOWN;
    expect(gone(fadePx('calc(100% - 0.00947806px) 100%, 0.00947806px 100%'))).toBe(true);
    expect(gone(fadePx('100% 100%, 0px 100%'))).toBe(true);
    expect(shown(fadePx('calc(100% - 28px) 100%, 28px 100%'))).toBe(true);
    expect(gone(fadePx('calc(100% - 14px) 100%, 14px 100%')) || shown(fadePx('calc(100% - 14px) 100%, 14px 100%'))).toBe(false);
  });

  it('uses those thresholds in the poll, reads twice one animation frame apart, and no longer compares to exactly 0', () => {
    expect(smoke).toMatch(/const GONE_PX = 0\.5, SHOWN_PX = 27/);
    expect(smoke).toMatch(/requestAnimationFrame\(r\)\)[^;]*;\s*const second = /);
    expect(smoke).toMatch(/first < goneAt && second < goneAt|both\(first, second\)/);
    expect(smoke).not.toMatch(/Number\.parseFloat\(second\) === 0/);
    expect(smoke).not.toMatch(/Number\.parseFloat\(second\) > 0/);
  });
});

