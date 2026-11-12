import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    // .mjs tests cover scripts, Guard and MCP; they need no DOM.
    environmentMatchGlobs: [['tests/**/*.test.mjs', 'node']],
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.{jsx,mjs}'],
    // user-event calendar and picker tests take 5-7 s on a loaded runner.
    testTimeout: 30000,
    // Hooks spawn processes (the MCP server's stdio client); a loaded runner needs the same headroom.
    hookTimeout: 30000,
  },
});
