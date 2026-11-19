import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { describe, it, expect } from 'vitest';

// Icon sizes follow the design-tokens icon scale (--icon-xs to --icon-2xl).
// Icon writes its size into the SVG's width attribute, so it takes a number,
// not a CSS variable; this test keeps every literal on the scale instead.
// Sizes above 32px are illustrations and are exempt.
const SCALE = [8, 12, 16, 20, 24, 32];
const tokens = readFileSync('tokens/spacing.css', 'utf8');
const files = execFileSync('git', ['ls-files', 'components/*.jsx', 'components/*.html', 'components/*.prompt.md', 'site/examples/*.jsx', 'showcases/*', 'blocks/*', 'starters/*'], { encoding: 'utf8' })
  .split('\n').filter(Boolean);

describe('icon sizes', () => {
  it('the scale matches the vendored tokens', () => {
    const names = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    names.forEach((name, i) => expect(tokens).toContain(`--icon-${name}: ${SCALE[i]}px;`));
  });

  it('every literal Icon size is on the scale', () => {
    const off = [];
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(/<Icon\b[^<>]*?\bsize=\{([^{}]*)\}/g)) {
        for (const number of match[1].matchAll(/(?<![\w.])\d+(?:\.\d+)?(?![\w.])/g)) {
          const value = Number(number[0]);
          if (value >= 1 && value <= 32 && !SCALE.includes(value)) off.push(`${file}: size ${value}`);
        }
      }
    }
    expect(off).toEqual([]);
  });
});
