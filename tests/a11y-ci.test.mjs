import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync('.github/workflows/checks.yml', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

describe('axe in CI', () => {
  it('runs npm run a11y on the marketing group after the smoke run', () => {
    expect(pkg.scripts.a11y).toBe('node scripts/a11y.mjs');
    const smoke = workflow.indexOf('scripts/smoke_headless.mjs');
    const axe = workflow.indexOf('A11Y_GROUPS=marketing "$RUNNER_TEMP/pw-node" scripts/a11y.mjs');
    expect(axe).toBeGreaterThan(smoke);
    expect(workflow).toContain('-e A11Y_GROUPS');
  });

  it('installs the same exact axe-core as package.json in the smoke job', () => {
    expect(pkg.devDependencies['axe-core']).toMatch(/^\d+\.\d+\.\d+$/);
    expect(workflow).toContain(`axe-core@${pkg.devDependencies['axe-core']}`);
  });
});
