import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const major = name => Number(require(`${name}/package.json`).version.split('.')[0]);

describe('test toolchain', () => {
  // vitest <= 4.1.10 and its vite / esbuild / tinypool chain carry advisories (UI server
  // file read, mocker path traversal, tinypool prototype-pollution RCE).
  it('runs on vitest 5 or newer', () => {
    expect(major('vitest')).toBeGreaterThanOrEqual(5);
  });

  it('runs .mjs suites without a DOM', () => {
    expect(typeof document).toBe('undefined');
  });
});
