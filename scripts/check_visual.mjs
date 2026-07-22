#!/usr/bin/env node
// Visual regression gate: compare freshly captured group screenshots against
// the committed baselines in tests/__shots__/.
//
//   SHOTS=<dir> node scripts/check_visual.mjs
//
// Baselines are captured BY CI (the update-visual-baselines workflow opens a PR
// with them), never locally: font rasterisation differs across platforms, so a
// macOS-made baseline would permanently disagree with the ubuntu runner. For the
// same reason this gate skips — loudly — when no baselines exist yet, instead of
// failing every fork on day one.
//
// A real style change fails here by design; refresh the baselines via the
// update-visual-baselines workflow and review the PR's images — that review IS
// the approval step.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_DIR = path.join(ROOT, 'tests', '__shots__');
const SHOTS = process.env.SHOTS || '';
// Anti-aliasing wobble is excluded by pixelmatch itself; this is the share of
// genuinely different pixels a group may carry before it fails.
const MAX_DIFF_RATIO = 0.0005;

if (!SHOTS || !fs.existsSync(SHOTS)) {
  console.error('SHOTS dir missing — run smoke_headless.mjs with SHOTS=<dir> first');
  process.exit(1);
}
const baselines = fs.existsSync(BASE_DIR) ? fs.readdirSync(BASE_DIR).filter(f => f.endsWith('.png')) : [];
if (!baselines.length) {
  console.log('visual: no baselines in tests/__shots__ yet — skipping (run the update-visual-baselines workflow to create them)');
  process.exit(0);
}

const shots = fs.readdirSync(SHOTS).filter(f => f.endsWith('.png') && !f.endsWith('.diff.png'));
const failures = [];
const missing = baselines.filter(f => !shots.includes(f));
const unexpected = shots.filter(f => !baselines.includes(f));

for (const f of baselines) {
  if (!shots.includes(f)) continue;
  const a = PNG.sync.read(fs.readFileSync(path.join(BASE_DIR, f)));
  const b = PNG.sync.read(fs.readFileSync(path.join(SHOTS, f)));
  if (a.width !== b.width || a.height !== b.height) {
    failures.push(`${f}: size ${a.width}x${a.height} -> ${b.width}x${b.height}`);
    continue;
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  const ratio = n / (a.width * a.height);
  if (ratio > MAX_DIFF_RATIO) {
    const out = path.join(SHOTS, f.replace(/\.png$/, '.diff.png'));
    fs.writeFileSync(out, PNG.sync.write(diff));
    failures.push(`${f}: ${(ratio * 100).toFixed(3)}% pixels differ (${n}) — diff at ${out}`);
  }
}

// A group that appears or disappears is a change too — surface it, don't guess.
for (const f of missing) failures.push(`${f}: baseline exists but no fresh shot was captured`);
for (const f of unexpected) failures.push(`${f}: new group with no baseline — refresh baselines to adopt it`);

if (failures.length) {
  console.error(`visual: ${failures.length} regression(s):\n  ` + failures.join('\n  '));
  console.error('If intentional: run the update-visual-baselines workflow and review its PR.');
  process.exit(1);
}
console.log(`visual: ${baselines.length} group shots match the baselines`);
