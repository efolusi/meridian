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

// The 2px focus outline is not restated here. Switch, Toolbar and Player set `outline:none` on :focus-visible and draw
// the focus ring as a box-shadow, which forced colours drop; the one rule in tokens/base.css (MD78) draws a 2px Highlight
// outline on every :focus-visible, !important, unlayered, so it beats those and the 1px edge outlines above. The
// copies MD74 round 2 added to the three components were redundant and are gone (tests/md78-forced-colors-focus.test.mjs
// fails on any component that restates it).
describe('the focus outline comes from the base rule only (MD78, replaces MD74 round 2)', () => {
  for (const file of ['components/forms/Switch.jsx', 'components/display/Toolbar.jsx', 'components/ai/Player.jsx']) {
    it(`${file} keeps its 1px edge outline in forced colours and no focus outline`, () => {
      const block = forced(file);
      expect(block).toMatch(/outline:1px solid (Highlight|ButtonText)/);
      expect(block).not.toContain(':focus-visible');
      expect(block).not.toContain('outline-offset');
    });
  }

  it('leaves the file-input button alone: it is aria-hidden, the input inside it takes the focus', () => {
    expect(readFileSync('components/forms/Input.jsx', 'utf8')).toMatch(/className="ef-file-input__button" aria-hidden="true"/);
  });
});
