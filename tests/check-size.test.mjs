import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TOLERANCE_BYTES, overBudget } from '../scripts/check_size.mjs';

const budget = { '_ds_bundle.js': 900000, 'dist/ (npm total)': 1300000 };

describe('size budget', () => {
  it('allows growth up to the fixed tolerance over the recorded size', () => {
    expect(overBudget({ '_ds_bundle.js': 900000 + 100, 'dist/ (npm total)': 1300000 + TOLERANCE_BYTES }, budget)).toEqual([]);
  });

  it('fails 300 bytes over the record', () => {
    const over = overBudget({ '_ds_bundle.js': 900000 + 300, 'dist/ (npm total)': 1300000 }, budget);
    expect(over).toHaveLength(1);
    expect(over[0]).toMatch(/_ds_bundle\.js/);
  });

  it('fails growth past the tolerance', () => {
    const over = overBudget({ '_ds_bundle.js': 900000 + TOLERANCE_BYTES + 1, 'dist/ (npm total)': 1300000 }, budget);
    expect(over).toHaveLength(1);
    expect(over[0]).toMatch(/_ds_bundle\.js/);
  });

  it('keeps the tolerance at build noise: at most 256 bytes', () => {
    expect(TOLERANCE_BYTES).toBeGreaterThan(0);
    expect(TOLERANCE_BYTES).toBeLessThanOrEqual(256);
  });

  it('records in the budget the totals that the bundle-size table shows', () => {
    const recorded = JSON.parse(readFileSync(new URL('../scripts/size_budget.json', import.meta.url), 'utf8'));
    const table = readFileSync(new URL('../guidelines/bundle-size.md', import.meta.url), 'utf8');
    for (const file of ['dist/components.css', '_ds_bundle.js']) {
      const shown = table.match(new RegExp('\\| `' + file.replace('.', '\\.') + '` \\| ([\\d.]+) kB'))?.[1];
      expect(shown, file).toBeDefined();
      expect((recorded[file] / 1024).toFixed(1), `${file}: change size_budget.json and the table together (npm run check:fix)`).toBe(shown);
    }
  });

  it('still fails artifacts missing from the budget or from the build', () => {
    expect(overBudget({ '_ds_bundle.js': 1, 'new.js': 1 }, budget)).toEqual([
      'new.js: not in the budget (run --update to adopt it)',
      'dist/ (npm total): in the budget but not built',
    ]);
  });
});
