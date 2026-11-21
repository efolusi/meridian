#!/usr/bin/env node
// Motion comes from the tokens. Fails on a literal duration (ms or s), a literal cubic-bezier or a named
// easing (ease, ease-in, ease-out, ease-in-out, linear) in transition, animation and their duration and
// timing-function longhands, in the files Meridian ships. The tokens are --dur-fast, --dur-base,
// --dur-slow, --dur-progress (with linear), --dur-long (web marketing only) and the --ease-* curves
// (design-tokens docs/motion.md). The model is Glamor's scripts/check-motion.sh.
//
// A value that has no token goes in scripts/motion_allowlist.json as { "<file>": { count, reason } }.
// The list only shrinks: a file above its count fails, and so does a count above what is found.
//
//   node scripts/check_motion.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('..', import.meta.url).pathname;
export const ALLOWLIST_FILE = 'scripts/motion_allowlist.json';

// What is scanned. The vendored token files (tokens/effects.css and its neighbours) define the tokens, so
// they hold the literals; generated files (the bundle, the registry) follow their sources.
export const SCAN = /^(?:components\/.+\.jsx|site\/(?!registry\/).+\.(?:css|html|jsx|js)|blocks\/.+\.html|starters\/.+\.(?:html|css|js|jsx)|styles\.css|landing\.css|tokens\/(?:base|layers)\.css)$/;

const PROPERTY = /(?<![\w-])(transition|animation)(-duration|-timing-function)?\s*:\s*([^;}\n]*)/g;
const DURATION = /(?<![\w.#-])(\d*\.?\d+)(ms|s)(?![\w-])/g;
const EASING = /(?<![\w-])(?:cubic-bezier\(|steps\(|ease-in-out|ease-in|ease-out|ease|linear|step-start|step-end)(?![\w-])/g;

// Comments hold examples of what not to write; blank them, keeping the line count.
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

export function findLiterals(text) {
  const found = [];
  const clean = stripComments(text);
  for (const m of clean.matchAll(PROPERTY)) {
    const value = m[3].trim().replace(/['"`,]+$/, '').trim();
    const literals = [];
    for (const d of value.matchAll(DURATION)) if (Number(d[1]) !== 0) literals.push(d[0]);
    for (const e of value.matchAll(EASING)) {
      // linear is the progress bar's curve: it has no numbers to share, and goes with --dur-progress.
      if (e[0] === 'linear' && value.includes('--dur-progress')) continue;
      literals.push(e[0].replace(/\($/, '(…)'));
    }
    if (literals.length) found.push({ line: clean.slice(0, m.index).split('\n').length, property: m[1] + (m[2] ?? ''), value, literals });
  }
  return found;
}

export function allowlist() {
  return JSON.parse(readFileSync(new URL(`../${ALLOWLIST_FILE}`, import.meta.url), 'utf8'));
}

/** { file: [findings] } for every scanned file that has any. */
export function scanRepo() {
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).split('\0').filter((f) => f && SCAN.test(f));
  const out = {};
  for (const file of files) {
    const found = findLiterals(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));
    if (found.length) out[file] = found;
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const counts = scanRepo();
  const listed = allowlist();
  const problems = [];
  for (const [file, found] of Object.entries(counts)) {
    const allowed = listed[file]?.count ?? 0;
    if (found.length > allowed) {
      problems.push(`${file}: ${found.length} literal(s), ${allowed} allowed\n${found.map((f) => `  ${f.line}: ${f.property}: ${f.value}   [${f.literals.join(', ')}]`).join('\n')}`);
    }
  }
  for (const [file, entry] of Object.entries(listed)) {
    const actual = counts[file]?.length ?? 0;
    if (actual < entry.count) problems.push(`${file}: allowlist says ${entry.count}, found ${actual}; lower the count or remove the entry (the list only shrinks)`);
  }
  if (problems.length) {
    console.error(problems.join('\n'));
    console.error('\nMotion outside the tokens: use --dur-fast, --dur-base, --dur-slow, --dur-progress (with linear) or --dur-long (web marketing only), and the --ease-* curves. A value with no token goes in scripts/motion_allowlist.json with its reason.');
    process.exit(1);
  }
  const total = Object.values(counts).reduce((n, f) => n + f.length, 0);
  console.log(`Motion: every transition and animation uses the motion tokens (${total} allowlisted literal(s) in ${Object.keys(counts).length} file(s)).`);
}
