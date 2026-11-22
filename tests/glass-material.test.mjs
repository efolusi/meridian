import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// MD51 (warm glass, design-tokens docs/glass.md): the glass material and the field live in tokens/base.css,
// read only design-tokens' material.* and field.* tokens, and turn solid under every fallback.
const css = readFileSync('tokens/base.css', 'utf8');
const layer = css.slice(css.indexOf('@layer meridian{'), css.lastIndexOf('\n}', css.indexOf('/* Forced colours')) + 2);
const rule = (sel) => {
  const m = css.match(new RegExp(`(?:^|[}\\s])${sel.replace(/[.[\]()-]/g, '\\$&')}\\{([^}]*)\\}`));
  return m ? m[1] : null;
};

describe('glass material', () => {
  it('has one class per thickness, each reading its material token', () => {
    for (const k of ['clear', 'regular', 'chrome', 'thick']) {
      expect(rule(`.ef-glass--${k}`), k).toContain(`--ef-glass-alpha:var(--material-${k})`);
    }
    const base = rule('.ef-glass');
    expect(base).toContain('color-mix(in srgb,var(--material-tint) calc(var(--ef-glass-alpha,var(--material-regular)) * 100%),transparent)');
    expect(base).toContain('var(--material-edge)');
    expect(base).toContain('var(--material-spec)');
  });

  it('blurs only on request, with the thick blur for sheets', () => {
    expect(rule('.ef-glass')).not.toMatch(/backdrop-filter/);
    expect(rule('.ef-glass--blur')).toContain('backdrop-filter:blur(var(--material-blur)) saturate(var(--material-saturate))');
    expect(rule('.ef-glass--blur')).toContain('-webkit-backdrop-filter:blur(var(--material-blur)) saturate(var(--material-saturate))');
    expect(rule('.ef-glass--thick.ef-glass--blur')).toContain('backdrop-filter:blur(var(--material-blur-thick))');
  });

  it('lives in the meridian layer, so product CSS still wins', () => {
    expect(layer).toContain('.ef-glass{');
    expect(layer).toContain('.ef-glass-field{');
  });

  it('draws the field from field tokens at field.strength', () => {
    const field = rule('.ef-glass-field');
    expect(field).toContain('background-color:var(--field-0)');
    for (const n of [1, 2, 3]) expect(css).toContain(`var(--field-${n})`);
    expect(css).toMatch(/\.ef-glass-field::before\{[^}]*opacity:var\(--field-strength\)/);
  });

  it('turns into plain system colours under forced colours', () => {
    const fc = css.slice(css.indexOf('@media (forced-colors:active){:focus-visible'));
    expect(fc).toMatch(/\.ef-glass\{[^}]*background:Canvas[^}]*backdrop-filter:none/);
    expect(fc).toMatch(/\.ef-glass-field::before\{display:none\}/);
  });

  it('does not reuse a class a component owns (.ef-field is the form field)', () => {
    expect(css).not.toMatch(/(^|[}\s,])\.ef-field[{:]/);
  });
});
