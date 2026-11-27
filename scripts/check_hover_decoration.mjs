#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const extensions = new Set(['.css', '.html', '.jsx']);
const files = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(file => extensions.has(extname(file)) && file !== '_ds_bundle.js' && !file.startsWith('site/registry/') && existsSync(new URL(`../${file}`, import.meta.url)));

// Reviewed exceptions, file -> selector. Hover does not add an underline, so a link keeps one identity across pointer,
// keyboard and touch. The one exception (MD74 review, design coordinator decision): the quiet Link is plain at rest, which
// is safe only for navigation and footers, and shows its underline on hover and keyboard focus so it still reads as a link.
const QUIET_LINK = new Set(['.ef-link--quiet:hover,.ef-link--quiet:focus-visible']);
const REVIEWED = new Map([
  ['components/display/Link.jsx', QUIET_LINK],
  ['registry/components.css', QUIET_LINK], // generated from Link.jsx by the build
]);
const failures = [];
const hoverRule = /([^{}]*:hover[^{}]*)\{([^{}]*)\}/g;
for (const file of files) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  for (const match of source.matchAll(hoverRule)) {
    if (REVIEWED.get(file)?.has(match[1].trim())) continue;
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
