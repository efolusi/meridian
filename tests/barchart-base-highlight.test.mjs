// MD74 review: the highlighted BarChart bars paint --accent-edge (bronze), and the base bars were --text-muted,
// 1.32:1 from the bronze in light and 1.03:1 from the copper in dark, so the highlight did not read. The base
// bars are now --border-control: the form-control edge, which the gate already holds at 3:1 on every surface,
// so a base bar holds 3:1 against the page and the card (WCAG 1.4.11) and sits quieter than the highlight.
// 3:1 between the highlight and the base is out of reach with any single sand step: the page needs a base
// at 3:1 or more from it, the highlight is itself 4.43:1 (light) and 6.49:1 (dark) from the page, and the only
// colours 3:1 from both are near-black in light and none in dark. So tone does not carry the highlight (WCAG 1.4.1):
// the highlighted bars are copper with a 1px --accent-edge outline and the base bars have none. The outline against the
// base is a labelled mark in scripts/check_contrast.py, measured and printed.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { THEMES, ratio } from './helpers/token-table.mjs';

const css = /const CSS = `([\s\S]*?)`;/.exec(readFileSync('components/data/BarChart.jsx', 'utf8'))[1];

describe('BarChart base bars are quieter than the highlight (MD74 review)', () => {
  it('paints the base with --border-control and no outline, the highlight copper with a 1px --accent-edge outline', () => {
    const base = css.slice(css.indexOf('.ef-bars__bar{'), css.indexOf('}', css.indexOf('.ef-bars__bar{')));
    expect(base).toContain('background:var(--border-control)');
    expect(base).not.toMatch(/box-shadow|outline|border:/);
    expect(css).toContain('.ef-bars__bar--hi{background:var(--accent);box-shadow:inset 0 0 0 1px var(--accent-edge)}');
  });

  it('keeps the outline in forced-colors mode, where the shadow is dropped', () => {
    expect(css).toContain('@media (forced-colors:active){.ef-bars__bar--hi{outline:1px solid Highlight}}');
  });

  it('holds the base bars at 3:1 against the page and the card in both themes', () => {
    for (const [name, table] of THEMES) {
      expect(ratio(table, '--border-control', '--surface-page'), `${name} page`).toBeGreaterThanOrEqual(3);
      expect(ratio(table, '--border-control', '--surface-card'), `${name} card`).toBeGreaterThanOrEqual(3);
    }
  });

  it('separates the highlight from the base more than the old text-muted base did, or as much', () => {
    for (const [name, table] of THEMES) {
      expect(ratio(table, '--accent-edge', '--border-control'), name).toBeGreaterThanOrEqual(ratio(table, '--accent-edge', '--text-muted'));
    }
  });

  it('prints the highlight against the base as a labelled mark in the contrast gate, light and dark', () => {
    const run = spawnSync('python3', ['scripts/check_contrast.py'], { encoding: 'utf8' });
    expect(run.status, run.stdout + run.stderr).toBe(0);
    expect(run.stdout).toMatch(/LABEL\s+light\s+--accent-edge\s+on --border-control\s+1\.34:1/);
    expect(run.stdout).toMatch(/LABEL\s+dark\s+--accent-edge\s+on --border-control\s+1\.75:1/);
    expect(run.stdout).toMatch(/ok\s+increased\s+--accent-edge\s+on --border-control/);
    expect(run.stdout).toMatch(/ok\s+light\s+--border-control\s+on --surface-card/);
  });
});
