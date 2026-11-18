// Vendor design-tokens' tokens.json and web CSS into this repo.
//   node scripts/sync_tokens.mjs <tag>   copy the files from that tag, write the lock
//   node scripts/sync_tokens.mjs --check verify the vendored files against the lock (no network)
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REPO = 'https://github.com/efolusi/design-tokens';
// Path in design-tokens -> path here.
const FILES = {
  'tokens.json': 'tokens.json',
  'tokens/web/colors.css': 'tokens/colors.css',
  'tokens/web/typography.css': 'tokens/typography.css',
  'tokens/web/spacing.css': 'tokens/spacing.css',
  'tokens/web/effects.css': 'tokens/effects.css',
};
const LOCK = 'tokens/design-tokens.lock.json';
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

const arg = process.argv[2];
if (!arg) {
  console.error('usage: node scripts/sync_tokens.mjs <tag> | --check');
  process.exit(2);
}

if (arg === '--check') {
  const lock = JSON.parse(fs.readFileSync(LOCK, 'utf8'));
  const bad = Object.values(FILES).filter((f) => sha256(fs.readFileSync(f)) !== lock.files[f]);
  if (bad.length) {
    console.error(`vendored tokens differ from design-tokens ${lock.ref}: ${bad.join(', ')}`);
    console.error(`Edit tokens in design-tokens, then: node scripts/sync_tokens.mjs <tag>`);
    process.exit(1);
  }
  console.log(`vendored tokens match design-tokens ${lock.ref}`);
  process.exit(0);
}

const tags = execFileSync('git', ['ls-remote', '--tags', REPO, `refs/tags/${arg}`], { encoding: 'utf8' });
if (!tags.trim()) {
  console.error(`${arg} is not a tag in ${REPO}; pin a tag, not a branch`);
  process.exit(2);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'design-tokens-'));
try {
  execFileSync('git', ['clone', '-q', '--depth', '1', '--branch', arg, REPO, tmp], { stdio: 'inherit' });
  const commit = execFileSync('git', ['-C', tmp, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const files = {};
  for (const [from, to] of Object.entries(FILES)) {
    const buf = fs.readFileSync(path.join(tmp, from));
    fs.writeFileSync(to, buf);
    files[to] = sha256(buf);
  }
  fs.writeFileSync(LOCK, JSON.stringify({ repo: REPO, ref: arg, commit, files }, null, 2) + '\n');
  console.log(`synced design-tokens ${arg} (${commit.slice(0, 7)})`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
