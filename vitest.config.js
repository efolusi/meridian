import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.{jsx,mjs}'],
    // user-event drives the calendar and picker suites one keystroke at a time.
    // On a loaded machine (the shared self-hosted runner, or several local
    // worktrees testing at once) single tests take 5-7 s, so vitest's 5 s
    // default fails them at random. A hang still fails, just later.
    testTimeout: 30000,
  },
});
