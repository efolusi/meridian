// Text-on-fill pairs that forms components declare themselves, checked in
// both themes. The token gate (scripts/check_contrast.py) covers text on the
// shared surfaces; these fills are component choices it never sees.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrast } from '../scripts/contrast.mjs';

const css = readFileSync(join(process.cwd(), 'tokens/colors.css'), 'utf8');
function block(selector) {
  const start = css.indexOf(`${selector}{`);
  return css.slice(start, css.indexOf('\n}', start));
}
function vars(text) {
  const out = {};
  for (const [, name, value] of text.matchAll(/(--[\w-]+):([^;}]+)/g)) out[name] = value.trim();
  return out;
}
const light = vars(block(':root'));
const dark = { ...light, ...vars(block('[data-theme="dark"]')) };
function toRgb(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
}
function resolve(table, value) {
  let current = value;
  for (let i = 0; i < 10; i += 1) {
    // var(--name) or var(--name,fallback): the fallback applies only while
    // the token is undefined (e.g. before the tokens area defines it).
    const ref = /^var\((--[\w-]+)(?:,(.+))?\)$/.exec(current);
    if (!ref) return toRgb(current);
    current = table[ref[1]] ?? ref[2];
  }
  return current;
}
function rule(file, selector) {
  const source = readFileSync(join(process.cwd(), 'components', file), 'utf8');
  const at = source.indexOf(`${selector}{`);
  expect(at, `${selector} in ${file}`).toBeGreaterThan(-1);
  const body = source.slice(at + selector.length + 1, source.indexOf('}', at));
  return { background: /background:([^;}]+)/.exec(body)[1], color: /(?:^|;)color:([^;}]+)/.exec(body)[1] };
}

const PAIRS = [
  ['forms/Toggle.jsx', '.ef-toggle--on'],
  ['forms/Questionnaire.jsx', '.ef-questionnaire__button[data-primary]'],
  ['dates/Calendar.jsx', '.ef-cal__day[data-range-middle="true"]'],
];

describe('forms text-on-fill contrast', () => {
  for (const [file, selector] of PAIRS) {
    for (const [theme, table] of [['light', light], ['dark', dark]]) {
      it(`${selector} holds 4.5:1 in ${theme}`, () => {
        const { background, color } = rule(file, selector);
        const ratio = contrast(resolve(table, color), resolve(table, background));
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
