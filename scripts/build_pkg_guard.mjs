#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'packages', 'guard');
const OUT = path.join(SOURCE, 'dist');
const CHECK = process.argv.includes('--check');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, '_ds_manifest.json'), 'utf8')).version;
const files = new Map();

for (const rel of [
  'bin/meridian-guard.js',
  'src/cli.mjs',
  'src/index.mjs',
  'src/reporter.mjs',
  'src/rules.mjs',
  'src/scanner.mjs',
  'src/generated/meridian-rules.json',
  'README.md',
]) {
  files.set(rel, fs.readFileSync(path.join(SOURCE, rel), 'utf8'));
}
files.set('LICENSE', fs.readFileSync(path.join(ROOT, 'LICENSE'), 'utf8'));
files.set('package.json', `${JSON.stringify({
  name: '@efolusi/meridian-guard',
  version,
  description: 'Static compliance checks for React applications built with the Meridian design system.',
  license: 'MIT',
  homepage: 'https://meridian.efolusi.com',
  repository: { type: 'git', url: 'git+https://github.com/efolusi/meridian.git', directory: 'packages/guard' },
  type: 'module',
  engines: { node: '>=20.10' },
  bin: { 'meridian-guard': 'bin/meridian-guard.js' },
  main: './src/index.mjs',
  exports: { '.': './src/index.mjs', './package.json': './package.json' },
  files: ['bin', 'src', 'README.md', 'LICENSE'],
  dependencies: { '@babel/parser': '^7.28.0' },
  keywords: ['design-system', 'accessibility', 'lint', 'meridian', 'react'],
}, null, 2)}\n`);

if (CHECK) {
  const stale = [...files].filter(([rel, content]) => {
    const target = path.join(OUT, rel);
    return !fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content;
  }).map(([rel]) => rel);
  if (stale.length) {
    console.error(`packages/guard/dist is out of date (${stale.length} file(s)), e.g. ${stale.slice(0, 3).join(', ')}`);
    console.error('run: node scripts/build_pkg_guard.mjs');
    process.exit(1);
  }
  console.log(`@efolusi/meridian-guard dist matches the sources (${files.size} files)`);
  process.exit(0);
}

fs.rmSync(OUT, { recursive: true, force: true });
for (const [rel, content] of files) {
  const target = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}
fs.chmodSync(path.join(OUT, 'bin', 'meridian-guard.js'), 0o755);
console.log(`@efolusi/meridian-guard@${version}: ${files.size} files -> packages/guard/dist/`);
