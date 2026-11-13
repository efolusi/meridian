import { describe, expect, it } from 'vitest';
import { TOLERANCE_BYTES, overBudget } from '../scripts/check_size.mjs';

const budget = { '_ds_bundle.js': 900000, 'dist/ (npm total)': 1300000 };

describe('size budget', () => {
  it('allows growth up to the fixed tolerance over the recorded size', () => {
    expect(overBudget({ '_ds_bundle.js': 900000 + 300, 'dist/ (npm total)': 1300000 + TOLERANCE_BYTES }, budget)).toEqual([]);
  });

  it('fails growth past the tolerance', () => {
    const over = overBudget({ '_ds_bundle.js': 900000 + TOLERANCE_BYTES + 1, 'dist/ (npm total)': 1300000 }, budget);
    expect(over).toHaveLength(1);
    expect(over[0]).toMatch(/_ds_bundle\.js/);
  });

  it('keeps the tolerance small: a few KiB, not a percentage', () => {
    expect(TOLERANCE_BYTES).toBeGreaterThanOrEqual(1024);
    expect(TOLERANCE_BYTES).toBeLessThanOrEqual(8192);
  });

  it('still fails artifacts missing from the budget or from the build', () => {
    expect(overBudget({ '_ds_bundle.js': 1, 'new.js': 1 }, budget)).toEqual([
      'new.js: not in the budget (run --update to adopt it)',
      'dist/ (npm total): in the budget but not built',
    ]);
  });
});
