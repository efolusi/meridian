import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { resolvesByName } from '../scripts/resolve_specifier.mjs';

const dirs = [];
afterEach(() => { for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true }); });

function sandbox(exportsMap, files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'meridian-resolve-'));
  dirs.push(dir);
  const pkg = path.join(dir, 'node_modules', 'pkg');
  fs.mkdirSync(path.join(pkg, 'forms'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}\n');
  fs.writeFileSync(path.join(pkg, 'package.json'), JSON.stringify({ name: 'pkg', type: 'module', exports: exportsMap }));
  for (const f of files) fs.writeFileSync(path.join(pkg, f), 'export const x = 1;\n');
  return dir;
}

describe('package specifier resolution used by check_npm_package', () => {
  it('accepts a specifier the exports map routes to a real file', async () => {
    const dir = sandbox({ '.': './index.js', './*': './*.js' }, ['index.js', 'forms/Button.js']);
    expect(await resolvesByName(dir, 'pkg')).toBe(true);
    expect(await resolvesByName(dir, 'pkg/forms/Button')).toBe(true);
  });

  it('rejects a subpath the exports map does not export', async () => {
    // Node throws ERR_PACKAGE_PATH_NOT_EXPORTED here; the gate used to count
    // every error other than ERR_MODULE_NOT_FOUND as "resolves".
    const dir = sandbox({ '.': './index.js' }, ['index.js', 'forms/Button.js']);
    expect(await resolvesByName(dir, 'pkg/forms/Button.js')).toBe(false);
  });

  it('rejects a mapped subpath whose target file is missing', async () => {
    const dir = sandbox({ '.': './index.js', './*': './*.js' }, ['index.js']);
    expect(await resolvesByName(dir, 'pkg/forms/Missing')).toBe(false);
  });
});
