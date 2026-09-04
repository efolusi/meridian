import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readRepoFile(relativePath) {
  return fs.readFile(path.join(repoRoot, relativePath), 'utf8');
}

describe('Meridian integration and release isolation', () => {
  it('validates dev changes while keeping publication main-only', async () => {
    const checks = await readRepoFile('.github/workflows/checks.yml');
    const publish = await readRepoFile('.github/workflows/publish.yml');

    expect(checks).toMatch(/push:\n\s+branches: \[main, dev\]/);
    expect(checks).toMatch(/pull_request:/);
    expect(checks).toMatch(/permissions:\n\s+contents: read/);

    expect(publish).toMatch(/push:\n\s+branches: \[main\]/);
    expect(publish).not.toMatch(/push:\n\s+branches: \[[^\]]*dev/);
  });
});
