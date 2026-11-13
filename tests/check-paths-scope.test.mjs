import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('check_paths.py scope', () => {
  // In the main checkout .claude/worktrees/ holds other worktrees' copies of the site.
  it('ignores pages under .claude/ and dist/', () => {
    const probes = ['.claude/worktrees/__check_paths_probe__', 'dist/__check_paths_probe__']
      .map(rel => path.join(ROOT, rel));
    try {
      for (const dir of probes) {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'page.html'), '<a href="./does-not-exist.html">x</a>\n');
      }
      const run = spawnSync('python3', ['scripts/check_paths.py'], { cwd: ROOT, encoding: 'utf8' });
      expect(run.stdout + run.stderr).not.toContain('__check_paths_probe__');
      expect(run.status).toBe(0);
    } finally {
      for (const dir of probes) fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
