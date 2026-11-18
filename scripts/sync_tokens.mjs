// Vendor design-tokens' web CSS into tokens/.
//   node scripts/sync_tokens.mjs <tag>   copy the files from that tag, write the lock
//   node scripts/sync_tokens.mjs --check verify tokens/*.css against the lock (no network)
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REPO = 'https://github.com/efolusi/design-tokens';
const FILES = ['colors.css', 'typography.css', 'spacing.css', 'effects.css'];
const LOCK = 'tokens/design-tokens.lock.json';
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

const arg = process.argv[2];
if (!arg) {
  console.error('usage: node scripts/sync_tokens.mjs <tag> | --check');
  process.exit(2);
}

if (arg === '--check') {
  const lock = JSON.parse(fs.readFileSync(LOCK, 'utf8'));
  const bad = FILES.filter((f) => sha256(fs.readFileSync(`tokens/${f}`)) !== lock.files[f]);
  if (bad.length) {
    console.error(`tokens/ differs from design-tokens ${lock.ref}: ${bad.join(', ')}`);
    console.error(`Edit tokens in design-tokens, then: node scripts/sync_tokens.mjs <tag>`);
    process.exit(1);
  }
  console.log(`tokens/ matches design-tokens ${lock.ref}`);
  process.exit(0);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'design-tokens-'));
try {
  execFileSync('git', ['clone', '-q', '--depth', '1', '--branch', arg, REPO, tmp], { stdio: 'inherit' });
  const commit = execFileSync('git', ['-C', tmp, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const files = {};
  for (const f of FILES) {
    const buf = fs.readFileSync(path.join(tmp, 'tokens/web', f));
    fs.writeFileSync(`tokens/${f}`, buf);
    files[f] = sha256(buf);
  }
  fs.writeFileSync(LOCK, JSON.stringify({ repo: REPO, ref: arg, commit, files }, null, 2) + '\n');
  console.log(`synced design-tokens ${arg} (${commit.slice(0, 7)})`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
