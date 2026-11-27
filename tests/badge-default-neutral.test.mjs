// MD69: the Badge `default` variant is a quiet neutral badge, not the ember
// fill of the primary button. The `solid` variant keeps the loud look for a
// consumer that wants it. Contrast is measured from the tokens the rules name.
import { readTokenCss } from './helpers/token-css.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrast } from '../scripts/contrast.mjs';

const tokens = readTokenCss('colors.css');
function block(selector) {
  const start = tokens.indexOf(`${selector}{`);
  return tokens.slice(start, tokens.indexOf('\n}', start));
}
function vars(text) {
  const out = {};
  for (const [, name, value] of text.matchAll(/(--[\w-]+):([^;}]+)/g)) out[name] = value.trim();
  return out;
}
const light = vars(block(':root,[data-theme="light"]'));
const dark = { ...light, ...vars(block('[data-theme="dark"]')) };
const THEMES = [['light', light], ['dark', dark]];

function toRgb(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
}
function resolve(table, value) {
  let current = value;
  for (let i = 0; i < 10; i += 1) {
    const ref = /^var\((--[\w-]+)(?:,(.+))?\)$/.exec(current);
    if (!ref) return toRgb(current);
    current = table[ref[1]] ?? ref[2];
  }
  return current;
}

const source = readFileSync(join(process.cwd(), 'components/display/Badge.jsx'), 'utf8');
const css = /const CSS = `([\s\S]*?)`;/.exec(source)[1];
function declarations(selector) {
  const start = css.indexOf(`\n${selector}{`);
  expect(start, `${selector} rule`).toBeGreaterThan(-1);
  const body = css.slice(start + selector.length + 2, css.indexOf('}', start));
  return Object.fromEntries(body.split(';').filter(Boolean).map(d => {
    const at = d.indexOf(':');
    return [d.slice(0, at).trim(), d.slice(at + 1).trim()];
  }));
}
function paint(table, selector) {
  const d = declarations(selector);
  return {
    background: d.background && resolve(table, d.background),
    color: d.color && resolve(table, d.color),
    border: d['border-color'] && resolve(table, d['border-color']),
  };
}

describe('Badge default is neutral (MD69)', () => {
  it('no longer paints the accent fill', () => {
    const d = declarations('.ef-badge--default');
    expect(d.background).not.toMatch(/--accent/);
    expect(d.color).not.toMatch(/--accent/);
    expect(declarations('.ef-badge--default:hover').background ?? '').not.toMatch(/--accent/);
  });

  for (const [theme, table] of THEMES) {
    it(`default is not the primary-button fill in ${theme}`, () => {
      expect(paint(table, '.ef-badge--default').background).not.toBe(resolve(table, 'var(--accent)'));
    });

    it(`default stays distinct from secondary and outline in ${theme}`, () => {
      const d = JSON.stringify(paint(table, '.ef-badge--default'));
      expect(d).not.toBe(JSON.stringify(paint(table, '.ef-badge--secondary')));
      expect(d).not.toBe(JSON.stringify(paint(table, '.ef-badge--outline')));
    });

    it(`default text holds 4.5:1 at rest and on hover in ${theme}`, () => {
      const rest = paint(table, '.ef-badge--default');
      const hover = declarations('.ef-badge--default:hover').background;
      const hoverFill = hover ? resolve(table, hover) : rest.background;
      expect(contrast(rest.color, rest.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(rest.color, hoverFill)).toBeGreaterThanOrEqual(4.5);
    });

    it(`solid keeps the old ember look and holds 4.5:1 at rest and on hover in ${theme}`, () => {
      const rest = paint(table, '.ef-badge--solid');
      expect(rest.background).toBe(resolve(table, 'var(--accent)'));
      expect(rest.color).toBe(resolve(table, 'var(--accent-contrast)'));
      const hover = paint(table, '.ef-badge--solid:hover');
      expect(declarations('.ef-badge--solid:hover')['border-color']).toBe('transparent');
      expect(declarations('.ef-badge--solid')['border-color']).toBe('transparent');
      expect(hover.background).toBe(resolve(table, 'var(--accent-hover)'));
      expect(contrast(rest.color, rest.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(rest.color, hover.background)).toBeGreaterThanOrEqual(4.5);
    });
  }

  it('a colour class on the default badge paints its own fill and no neutral border', () => {
    for (const name of ['accent', 'success', 'warning', 'brand']) {
      for (const [theme, table] of THEMES) {
        const own = paint(table, `.ef-badge--${name}`);
        expect(declarations(`.ef-badge--${name}`)['border-color'], `${name} border (${theme})`).toBe('transparent');
        const hover = declarations(`.ef-badge--default.ef-badge--${name}:hover`);
        expect(resolve(table, hover.background), `${name} hover fill (${theme})`).toBe(own.background);
        expect(hover['border-color'], `${name} hover border (${theme})`).toBe('transparent');
      }
    }
  });

  it('keeps every variant the component had', () => {
    for (const name of ['default', 'secondary', 'outline', 'ghost', 'link', 'accent', 'success', 'warning', 'danger', 'brand', 'solid']) {
      expect(css, `.ef-badge--${name}`).toContain(`\n.ef-badge--${name}{`);
    }
    const types = readFileSync(join(process.cwd(), 'components/display/Badge.d.ts'), 'utf8');
    for (const name of ['default', 'secondary', 'danger', 'outline', 'ghost', 'link', 'solid']) {
      expect(types).toContain(`'${name}'`);
    }
  });
});
