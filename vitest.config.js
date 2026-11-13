import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    globals: true,
    setupFiles: ['./tests/setup.js'],
    // user-event calendar and picker tests take 5-7 s on a loaded runner.
    testTimeout: 30000,
    // Hooks spawn processes (the MCP server's stdio client); a loaded runner needs the same headroom.
    hookTimeout: 30000,
    projects: [
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['tests/**/*.test.jsx'],
        },
      },
      // .mjs tests cover scripts, Guard and MCP; they need no DOM.
      { extends: true, test: { name: 'node', environment: 'node', include: ['tests/**/*.test.mjs'] } },
    ],
  },
});
