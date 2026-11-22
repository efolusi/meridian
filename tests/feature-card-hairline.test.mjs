import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Audit, 1.26.0: amber (light) and band (dark) fills sit near the page colour, so the
// card's edge is the hairline. Every tone keeps it.
const src = readFileSync('components/marketing/FeatureCard.jsx', 'utf8');
const css = src.slice(src.indexOf('const CSS = `') + 13, src.indexOf('`;'));
const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, sel, body]) => ({ sel: sel.trim(), body }));

describe('FeatureCard hairline', () => {
  it('draws a 1px --border-default edge on every card', () => {
    const base = rules.find((r) => r.sel === '.ef-feature-card');
    expect(base.body).toContain('border:1px solid var(--border-default)');
  });

  it('never removes or recolours the edge for a tone, hover or focus', () => {
    for (const tone of ['peach', 'band', 'amber']) {
      expect(css, tone).toContain(`.ef-feature-card[data-tone="${tone}"]`);
    }
    const touching = rules.filter((r) => r.sel.includes('.ef-feature-card') && r.sel !== '.ef-feature-card' && /(^|;)\s*border(-color|-width|-style)?\s*:/.test(r.body));
    expect(touching.map((r) => r.sel)).toEqual([]);
  });

  it('MD56: the dark brand tone is band; cocoa is gone, with no alias', () => {
    expect(src).not.toMatch(/cocoa/);
    expect(src).toMatch(/\['peach', 'band', 'amber'\]\.includes\(tone\)/);
    expect(readFileSync('components/marketing/FeatureCard.d.ts', 'utf8')).toMatch(/tone\?: 'default' \| 'peach' \| 'band' \| 'amber';/);
  });
});
