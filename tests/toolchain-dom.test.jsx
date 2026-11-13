import { describe, expect, it } from 'vitest';

describe('test toolchain', () => {
  it('runs .jsx suites in jsdom', () => {
    expect(typeof document).toBe('object');
  });
});
