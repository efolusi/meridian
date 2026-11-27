// MD74: the copper Button has no disabled state in the tokens. It used to fall under the shared
// `opacity:.45` of .ef-btn, which leaves the ink label and the copper fill about 1.9:1 apart in light
// (2.3:1 in dark). A disabled primary is now a flat neutral: --surface-track fill, --text-muted label.
// WCAG 1.4.3 exempts a disabled control; the label stays legible anyway, and the pair is gated.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrast } from '../scripts/contrast.mjs';
import { THEMES, ratio, resolve } from './helpers/token-table.mjs';

const css = (file) => /const CSS = `([\s\S]*?)`;/.exec(readFileSync(file, 'utf8'))[1];
const button = css('components/forms/Button.jsx');
const iconButton = css('components/forms/IconButton.jsx');
const DISABLED = '.ef-btn--primary:is(:disabled,[aria-disabled="true"],[data-disabled]):not([data-loading])';

describe('disabled primary Button (MD74)', () => {
  it('is flat neutral from tokens, not faded copper', () => {
    const rule = button.slice(button.indexOf(`${DISABLED}{`), button.indexOf('}', button.indexOf(`${DISABLED}{`)));
    expect(rule).toContain('opacity:1');
    expect(rule).toContain('background:var(--surface-track)');
    expect(rule).toContain('color:var(--text-muted)');
    expect(rule).toContain('border-color:transparent');
  });

  it('keeps the busy look while loading: a loading button is disabled too, and stays copper', () => {
    expect(DISABLED).toContain(':not([data-loading])');
    expect(button).toMatch(/\.ef-btn:is\(:disabled[^)]*\)\{opacity:\.45/);
  });

  it('gives the solid IconButton the same disabled look', () => {
    expect(iconButton).toMatch(/\.ef-iconbtn--solid:disabled\{opacity:1;background:var\(--surface-track\);border-color:transparent;color:var\(--text-muted\)\}/);
  });

  it('holds the label at 4.5:1 on its fill in light and dark', () => {
    for (const [name, table] of THEMES) {
      expect(ratio(table, '--text-muted', '--surface-track'), name).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('records why: the old faded copper label sat under 3:1 on its fill', () => {
    // group opacity .45 over the page: label and fill both blend with the ground
    const mix = (rgb, ground) => rgb.map((c, i) => 0.45 * c + 0.55 * ground[i]);
    const parse = (s) => s.match(/\d+/g).map(Number);
    for (const [name, table] of THEMES) {
      const ground = parse(resolve(table, '--surface-page'));
      const fill = mix(parse(resolve(table, '--accent')), ground);
      const label = mix(parse(resolve(table, '--accent-contrast')), ground);
      const rgb = (c) => `rgb(${c.map(Math.round).join(', ')})`;
      expect(contrast(rgb(label), rgb(fill)), `${name} faded copper label`).toBeLessThan(3);
    }
  });
});
