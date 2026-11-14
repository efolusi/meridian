#!/usr/bin/env node
// Fail when a built artifact grows past its recorded budget.
//
// The budget file records sizes; each artifact may exceed its record by
// TOLERANCE_BYTES. An exact ceiling failed every branch on a few hundred bytes
// of ordinary growth and made parallel branches conflict on the budget file.
// Growth past the tolerance still fails until someone runs --update and commits.
//
// Raw bytes only. Gzip size depends on the tool and level, so it is reported for
// context but never gated.
//
//   node scripts/check_size.mjs           # fail on regression past budget
//   node scripts/check_size.mjs --update  # re-record the budget from current
//
// Runs after the npm and CLI build gates, so dist/ and packages/cli/dist/
// exist. The bundle is committed.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUDGET = path.join(ROOT, 'scripts', 'size_budget.json');
export const TOLERANCE_BYTES = 4096;

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
  const cli = path.join(ROOT, 'packages', 'cli', 'dist');
  if (fs.existsSync(cli)) out['packages/cli/dist/ (npm total)'] = dirSize(cli);
  return out;
}

/** Problems with `now` against the recorded `budget`; empty when within budget. */
export function overBudget(now, budget, tolerance = TOLERANCE_BYTES) {
  const over = [];
  for (const [k, actual] of Object.entries(now)) {
    const recorded = budget[k];
    if (recorded == null) { over.push(`${k}: not in the budget (run --update to adopt it)`); continue; }
    if (actual > recorded + tolerance) over.push(`${k}: ${actual} > ${recorded} + ${tolerance} bytes tolerance (+${actual - recorded})`);
  }
  // An artifact that vanishes from the build is a change too, not a pass.
  for (const k of Object.keys(budget)) if (now[k] == null) over.push(`${k}: in the budget but not built`);
  return over;
}

// Only measure when run as a script; tests import overBudget.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

function main() {
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

  const over = overBudget(now, budget);
  if (over.length) {
    console.error('size regression past budget:\n  ' + over.join('\n  '));
    console.error('If intentional: node scripts/check_size.mjs --update, then commit scripts/size_budget.json.');
    process.exit(1);
  }

  const gz = zlib.gzipSync(fs.readFileSync(path.join(ROOT, '_ds_bundle.js'))).length;
  const headroom = Object.entries(now)
    .map(([k, v]) => `${k} ${v}/${budget[k]}+${TOLERANCE_BYTES}`)
    .join(', ');
  console.log(`within size budget (${headroom}; bundle gzip ~${gz})`);
}
