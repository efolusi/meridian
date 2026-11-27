import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync('.github/workflows/checks.yml', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

describe('axe in CI', () => {
  it('runs npm run a11y on every group after the smoke run', () => {
    expect(pkg.scripts.a11y).toBe('node scripts/a11y.mjs');
    const smoke = workflow.indexOf('scripts/smoke_headless.mjs');
    const axe = workflow.indexOf('A11Y_GROUPS=all "$RUNNER_TEMP/pw-node" scripts/a11y.mjs');
    expect(axe).toBeGreaterThan(smoke);
    expect(workflow).toContain('-e A11Y_GROUPS');
  });

  it('installs axe-core from the lockfile with npm ci, not by version on the command line', () => {
    const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
    expect(pkg.devDependencies['axe-core']).toMatch(/^\d+\.\d+\.\d+$/);
    expect(lock.packages['node_modules/axe-core'].version).toBe(pkg.devDependencies['axe-core']);
    expect(lock.packages['node_modules/axe-core'].integrity).toMatch(/^sha512-/);
    const smoke = workflow.slice(workflow.indexOf('  smoke:'));
    expect(smoke.indexOf('npm ci --no-audit --no-fund')).toBeGreaterThan(-1);
    expect(smoke.indexOf('npm ci --no-audit --no-fund')).toBeLessThan(smoke.indexOf('npm install --no-save'));
    expect(workflow).not.toMatch(/npm install[^\n]*axe-core/);
  });

  it('runs the second pass at 390px and counts moderate and minor warnings', () => {
    const script = readFileSync('scripts/a11y.mjs', 'utf8');
    expect(script).toContain('width: 390');
    expect(script).toContain('moderate or minor warning node(s)');
    expect(script).toContain('element(s) to check');
  });
});
