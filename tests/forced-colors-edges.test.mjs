// MD74 review: the edge of an accent fill is an inset box-shadow in Switch, Toolbar, Player and the file-input
// button, and forced-colors mode drops box-shadow, so a checked Switch had no fill and no edge. Each gets an
// outline in a system colour there: Highlight for a selected state, ButtonText for the edge of a button.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = (file) => /const CSS = `([\s\S]*?)`;/.exec(readFileSync(file, 'utf8'))[1];
const forced = (file) => {
  const text = css(file);
  const start = text.indexOf('@media (forced-colors:active){');
  expect(start, `${file} has a forced-colors block`).toBeGreaterThan(-1);
  return text.slice(start, text.indexOf('}}', start) + 2);
};

describe('accent edges survive forced-colors mode (MD74 review)', () => {
  const CASES = [
    ['components/forms/Switch.jsx', '.ef-switch[data-state="checked"]{outline:1px solid Highlight}'],
    ['components/display/Toolbar.jsx', '.ef-toolbar__btn--active{outline:1px solid Highlight}'],
    ['components/ai/Player.jsx', '.ef-player__play{outline:1px solid ButtonText}'],
    ['components/forms/Input.jsx', '.ef-file-input__button{outline:1px solid ButtonText}'],
  ];
  for (const [file, rule] of CASES) {
    it(`${file} outlines its edge in a system colour`, () => {
      expect(forced(file)).toContain(rule);
    });
  }

  it('leaves no inset accent-edge ring in the four files without a forced-colors outline', () => {
    for (const [file] of CASES) {
      const text = css(file);
      expect(/inset 0 0 0 1px var\(--accent-edge\)/.test(text), file).toBe(true);
      expect(text, file).toMatch(/@media \(forced-colors:active\)\{[^}]*outline:1px solid (Highlight|ButtonText)/);
    }
  });
});

// A forced-colors outline only shows if it wins the cascade. Switch, Toolbar and Player set `outline:none` on
// :focus-visible and draw the focus ring as a box-shadow, which forced colours drop, so a focused checked Switch,
// active Toolbar button or Player button had no focus indicator at all. The forced block restates the 2px focus
// outline for the same selector, later in the sheet, so it wins on specificity and on order, and it beats the 1px edge
// outline above it (lower specificity or earlier).
const specificity = (selector) => [
  (selector.match(/#[\w-]+/g) || []).length,
  (selector.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) || []).length,
  (selector.match(/(^|[\s>+~])[a-z][\w-]*/gi) || []).length,
];
const beats = (a, b) => {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return null; // equal: order decides
};

describe('the forced-colors focus outline wins the cascade (MD74 round 2)', () => {
  const FOCUS = [
    ['components/forms/Switch.jsx', '.ef-switch:focus-visible', '.ef-switch[data-state="checked"]'],
    ['components/display/Toolbar.jsx', '.ef-toolbar__btn:focus-visible', '.ef-toolbar__btn--active'],
    ['components/ai/Player.jsx', '.ef-player__btn:focus-visible', '.ef-player__play'],
  ];
  for (const [file, selector, edge] of FOCUS) {
    it(`${file}: ${selector} gets a 2px Highlight outline after the base rule, at least as specific as it`, () => {
      const text = css(file);
      const block = forced(file);
      expect(block).toContain(`${selector}{outline:2px solid Highlight;outline-offset:2px}`);
      const baseStart = text.indexOf(`${selector}{outline:none`);
      expect(baseStart, 'the base focus rule still sets outline:none').toBeGreaterThan(-1);
      const forcedStart = text.indexOf(`${selector}{outline:2px solid Highlight`);
      expect(forcedStart, 'later in the sheet than the base rule').toBeGreaterThan(baseStart);
      // Same selector: equal specificity, so the later rule (the forced one) wins.
      expect(beats(specificity(selector), specificity(selector))).toBe(null);
    });

    it(`${file}: the focus outline beats the 1px edge outline (${edge}) on a focused control`, () => {
      const verdict = beats(specificity(selector), specificity(edge));
      const text = css(file);
      if (verdict === null) expect(text.indexOf(`${selector}{outline:2px solid Highlight`)).toBeGreaterThan(text.indexOf(`${edge}{outline:1px solid`));
      else expect(verdict).toBe(true);
    });
  }

  it('measures the specificity helper on a known pair', () => {
    expect(specificity('.ef-switch:focus-visible')).toEqual([0, 2, 0]);
    expect(specificity('.ef-switch[data-state="checked"]')).toEqual([0, 2, 0]);
    expect(specificity('.ef-toolbar__btn--active')).toEqual([0, 1, 0]);
  });

  it('leaves the file-input button alone: it is aria-hidden, the input inside it takes the focus', () => {
    expect(readFileSync('components/forms/Input.jsx', 'utf8')).toMatch(/className="ef-file-input__button" aria-hidden="true"/);
  });
});
