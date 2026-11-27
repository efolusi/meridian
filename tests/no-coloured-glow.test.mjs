import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Owner, 2026-11-22: the shadow under the orange buttons looked too big. Rule: a filled control has a
// contact shadow only (offset at most 3px, blur at most 8px, coloured part at most .16 alpha), no glow,
// and in dark no coloured shadow at all. Glass bars and sheets carry no coloured glow either.
const FILES = ['tokens/base.css', 'components/forms/Button.jsx', 'components/forms/Switch.jsx', 'components/navigation/SegmentedControl.jsx', 'components/navigation/TabBar.jsx', 'components/display/Badge.jsx', 'components/marketing/ThemeToggle.jsx'];
const COLOUR = /var\(--(accent|brand|danger|success|warning|info|status)[\w-]*\)/;

describe('no coloured glow on filled controls or glass', () => {
  for (const file of FILES) {
    it(file, () => {
      const src = readFileSync(file, 'utf8');
      const shadows = [...src.matchAll(/box-shadow:([^;}]*)/g)].map((m) => m[1]);
      for (const value of shadows) {
        for (const layer of value.split(/,(?![^(]*\))/)) {
          if (!COLOUR.test(layer) || /^\s*(inset\s+)?0 0 0 /.test(layer)) continue; // solid rings are not glows
          const [, x = '0', y = '0', blur = '0'] = layer.trim().replace(/^inset\s+/, '').match(/^(-?[\d.]+)px?\s+(-?[\d.]+)px?\s+([\d.]+)px?/) ?? [];
          expect(Math.abs(Number(y)) <= 3 && Math.abs(Number(x)) <= 3 && Number(blur) <= 8, `${file}: coloured shadow layer "${layer.trim()}"`).toBe(true);
        }
      }
      expect(src, `${file} reads --material-glow`).not.toMatch(/--material-glow/);
    });
  }
});
