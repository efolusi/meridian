#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const extensions = new Set(['.css', '.html', '.jsx']);
const files = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(file => extensions.has(extname(file)) && file !== '_ds_bundle.js' && !file.startsWith('site/registry/'));

const failures = [];
const hoverRule = /([^{}]*:hover[^{}]*)\{([^{}]*)\}/g;
for (const file of files) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  for (const match of source.matchAll(hoverRule)) {
    if (/text-decoration(?:-line)?\s*:\s*underline\b/.test(match[2])) {
      const line = source.slice(0, match.index).split('\n').length;
      failures.push(`${file}:${line}: ${match[1].trim()} adds an underline on hover`);
    }
  }
}

if (failures.length) {
  console.error(`Hover decoration check failed:\n${failures.map(item => `  ${item}`).join('\n')}`);
  process.exit(1);
}

console.log(`${files.length} authored style-bearing files keep hover decoration stable`);
