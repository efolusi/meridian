#!/usr/bin/env node
// Fail when a built artifact grows past its recorded budget.
//
// The committed bundle and the npm dist/ are both byte-reproducible (there are
// gates asserting exactly that), so their sizes are deterministic: an exact
// ceiling is stable across machines, not flaky. A real size regression then
// fails the build until someone runs --update and commits the new budget, which
// turns every growth into a reviewed act instead of a silent drift.
//
// Raw bytes only. Gzip size depends on the tool and level, so it is reported for
// context but never gated.
//
//   node scripts/check_size.mjs           # fail on regression past budget
//   node scripts/check_size.mjs --update  # re-record the budget from current
//
// Runs after the npm build gate, so dist/ exists. The bundle is committed.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUDGET = path.join(ROOT, 'scripts', 'size_budget.json');

function dirSize(dir) {
  let total = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    total += e.isDirectory() ? dirSize(p) : fs.statSync(p).size;
  }
  return total;
}

/** The artifacts the gate tracks, raw bytes. */
function measure() {
  const out = {};
  out['_ds_bundle.js'] = fs.statSync(path.join(ROOT, '_ds_bundle.js')).size;
  const css = path.join(ROOT, 'dist', 'components.css');
  if (fs.existsSync(css)) out['dist/components.css'] = fs.statSync(css).size;
  const dist = path.join(ROOT, 'dist');
  if (fs.existsSync(dist)) out['dist/ (npm total)'] = dirSize(dist);
  return out;
}

const now = measure();

if (process.argv.includes('--update')) {
  fs.writeFileSync(BUDGET, JSON.stringify(now, null, 2) + '\n');
  console.log('size budget recorded:');
  for (const [k, v] of Object.entries(now)) console.log(`  ${k}: ${v} bytes`);
  process.exit(0);
}

if (!fs.existsSync(BUDGET)) {
  console.error('no size budget; run: node scripts/check_size.mjs --update');
  process.exit(1);
}
const budget = JSON.parse(fs.readFileSync(BUDGET, 'utf8'));

const over = [];
for (const [k, actual] of Object.entries(now)) {
  const ceil = budget[k];
  if (ceil == null) { over.push(`${k}: not in the budget (run --update to adopt it)`); continue; }
  if (actual > ceil) over.push(`${k}: ${actual} > ${ceil} bytes (+${actual - ceil})`);
}
// An artifact that vanishes from the build is a change too, not a pass.
for (const k of Object.keys(budget)) if (now[k] == null) over.push(`${k}: in the budget but not built`);

if (over.length) {
  console.error('size regression past budget:\n  ' + over.join('\n  '));
  console.error('If intentional: node scripts/check_size.mjs --update, then commit scripts/size_budget.json.');
  process.exit(1);
}

const gz = zlib.gzipSync(fs.readFileSync(path.join(ROOT, '_ds_bundle.js'))).length;
const headroom = Object.entries(now)
  .map(([k, v]) => `${k} ${v}/${budget[k]}`)
  .join(', ');
console.log(`within size budget (${headroom}; bundle gzip ~${gz})`);
