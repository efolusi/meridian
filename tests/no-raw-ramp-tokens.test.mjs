import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Components read semantic tokens (docs: guidelines/theming.md). A ramp stop such as --brand-400 never
// remaps in dark and is skipped by a rebrand that sets only the accent group.
// scripts/ramp_allowlist.json records the existing uses per file; a count may only fall.
const TOKENS = fs.readFileSync('tokens/colors.css', 'utf8');
const rootBlock = TOKENS.match(/:root(?:,\s*\[data-theme="light"\])?\s*\{([\s\S]*?)\n\}/)[1];
const ramps = new Set([...rootBlock.matchAll(/(--[a-z]+)-\d{2,3}\s*:/g)].map((m) => m[1]));
const RAMP_USE = new RegExp(`var\\((?:${[...ramps].join('|')})-\\d{2,3}\\)`, 'g');
const allowlist = JSON.parse(fs.readFileSync('scripts/ramp_allowlist.json', 'utf8'));

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const counts = Object.fromEntries(
  walk('components').filter((f) => f.endsWith('.jsx'))
    .map((f) => [f, (fs.readFileSync(f, 'utf8').match(RAMP_USE) ?? []).length])
    .filter(([, n]) => n > 0),
);

describe('component CSS reads no raw ramp token', () => {
  it('finds the ramps it guards', () => {
    expect([...ramps]).toEqual(expect.arrayContaining(['--brand', '--sand']));
  });

  it('has no file above its allowlisted count (a new file has none)', () => {
    const over = Object.entries(counts).filter(([f, n]) => n > (allowlist[f]?.count ?? 0)).map(([f, n]) => `${f}: ${n} > ${allowlist[f]?.count ?? 0}`);
    expect(over, 'use a semantic token (--accent, --surface-*, --text-*, --border-*) instead of a ramp stop').toEqual([]);
  });

  it('keeps no allowlist entry that is stale or too high', () => {
    const stale = Object.entries(allowlist).filter(([f, v]) => (counts[f] ?? 0) !== v.count).map(([f, v]) => `${f}: allowlist ${v.count}, now ${counts[f] ?? 0}`);
    expect(stale, 'lower or remove the entry in scripts/ramp_allowlist.json').toEqual([]);
  });

  it('gives every allowlist entry a reason', () => {
    expect(Object.entries(allowlist).filter(([, v]) => !v.reason?.trim()).map(([f]) => f)).toEqual([]);
  });
});
