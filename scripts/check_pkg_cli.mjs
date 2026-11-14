#!/usr/bin/env node
// Runs the built @efolusi/meridian-cli package the way npm would install it:
// imports its entry, then drives bin/meridian.js against site/registry as a
// local registry into a temporary directory. No network.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const DIST = path.join(ROOT, 'packages', 'cli', 'dist');
const BIN = path.join(DIST, 'bin', 'meridian.js');
const REGISTRY = path.join(ROOT, 'site', 'registry');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, '_ds_manifest.json'), 'utf8')).version;
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'meridian-cli-package-'));

const run = (...args) => spawnSync(process.execPath, [BIN, ...args], { cwd: temporary, encoding: 'utf8' });
const expectExit = (result, code, what) => {
  if (result.status !== code) throw new Error(`${what}: expected exit ${code}, got ${result.status}\n${result.stdout}${result.stderr}`);
};

try {
  const entry = await import(pathToFileURL(path.join(DIST, 'src', 'index.mjs')));
  for (const name of ['main', 'checkTarget', 'resolveItems', 'openRegistry', 'planWrites']) {
    if (typeof entry[name] !== 'function') throw new Error(`public package does not export ${name}`);
  }

  const shown = run('--version');
  expectExit(shown, 0, '--version');
  if (shown.stdout.trim() !== version) throw new Error(`--version printed ${shown.stdout.trim()}, manifest says ${version}`);

  const added = run('add', 'button', '--registry', REGISTRY, '--dir', 'app');
  expectExit(added, 0, 'add button');
  for (const file of ['components/forms/Button.jsx', 'components/forms/Button.d.ts', 'components/forms/Button.prompt.md', 'components/icons/Icon.jsx', 'styles.css']) {
    if (!fs.existsSync(path.join(temporary, 'app', file))) throw new Error(`add button did not write ${file}`);
  }
  if (!added.stdout.includes('npm install react')) throw new Error(`add button did not print the npm packages:\n${added.stdout}`);

  fs.appendFileSync(path.join(temporary, 'app', 'components', 'forms', 'Button.jsx'), '// local edit\n');
  expectExit(run('add', 'button', '--registry', REGISTRY, '--dir', 'app'), 1, 'add over a local edit');
  expectExit(run('add', 'button', '--registry', 'file:///etc'), 2, 'file: registry');
  expectExit(run('add', 'no-such-item', '--registry', REGISTRY), 3, 'missing item');

  console.log('@efolusi/meridian-cli package imports and CLI contracts pass');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
