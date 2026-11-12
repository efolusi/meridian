import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.{jsx,mjs}'],
    // user-event calendar and picker tests take 5-7 s on a loaded runner.
    testTimeout: 30000,
  },
});
