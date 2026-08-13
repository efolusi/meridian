#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const DIST = path.join(ROOT, 'packages', 'guard', 'dist');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'meridian-guard-package-'));

try {
  const entry = await import(pathToFileURL(path.join(DIST, 'src', 'index.mjs')));
  if (typeof entry.guard !== 'function' || typeof entry.scanSource !== 'function') {
    throw new Error('public package does not export guard and scanSource');
  }

  const valid = path.join(temporary, 'Valid.tsx');
  fs.writeFileSync(valid, "import { Icon } from '@efolusi/meridian'; export const Valid = () => <Icon name='check' />;\n");
  const result = await entry.guard([valid]);
  if (result.filesScanned !== 1 || result.diagnostics.length !== 0) {
    throw new Error(`public guard API rejected valid fixture: ${JSON.stringify(result)}`);
  }

  const invalid = path.join(temporary, 'Invalid.jsx');
  fs.writeFileSync(invalid, "import { Icon } from '@efolusi/meridian'; export const Invalid = () => <Icon name='definitely-missing' />;\n");
  const cli = spawnSync(process.execPath, [path.join(DIST, 'bin', 'meridian-guard.js'), invalid, '--format', 'json'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (cli.status !== 1) throw new Error(`invalid fixture returned exit ${cli.status}: ${cli.stderr}`);
  const output = JSON.parse(cli.stdout);
  if (output.diagnostics[0]?.ruleId !== 'MDG002') throw new Error(`unexpected CLI output: ${cli.stdout}`);

  console.log('@efolusi/meridian-guard package imports and CLI contracts pass');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
