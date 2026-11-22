import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

// A version is written vX.Y.Z wherever a release is named: the GitHub release title is the tag alone
// and each changelog heading is `## vX.Y.Z - YYYY-MM-DD`. package.json keeps the bare number.
const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
const publish = fs.readFileSync('.github/workflows/publish.yml', 'utf8');

describe('release naming', () => {
  it('writes every changelog heading as ## vX.Y.Z - date, or Unreleased', () => {
    const bad = changelog.split('\n').filter((l) => l.startsWith('## ') && !/^## (Unreleased|v\d+\.\d+\.\d+ - \d{4}-\d{2}(-\d{2})?( - .+)?)$/.test(l));
    expect(bad).toEqual([]);
  });

  it('titles the GitHub release with the tag alone', () => {
    const titles = [...publish.matchAll(/gh release create [^\n]*--title "([^"]+)"/g)].map((m) => m[1]);
    expect(titles.length).toBeGreaterThan(0);
    expect(titles.every((t) => t === 'v$PKG')).toBe(true);
  });

  it('looks up release notes under the v-prefixed heading', () => {
    expect(publish).toContain("rf'^## v{re.escape(ver)}");
  });
});
