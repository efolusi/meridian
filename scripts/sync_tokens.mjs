// Vendor design-tokens' tokens.json and web CSS into this repo.
//   node scripts/sync_tokens.mjs <tag>   copy the files from that tag, write the lock
//   node scripts/sync_tokens.mjs --check verify the vendored files against the lock (no network)
//   node scripts/sync_tokens.mjs --check-remote  also verify the lock against the pinned tag upstream
// In CI (CI=true) --check also runs the upstream check.
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

// Shallow-clones a tag and returns its commit and the files' contents.
function fetchTag(tag) {
  const tags = execFileSync('git', ['ls-remote', '--tags', REPO, `refs/tags/${tag}`], { encoding: 'utf8' });
  if (!tags.trim()) {
    console.error(`${tag} is not a tag in ${REPO}; pin a tag, not a branch`);
    process.exit(2);
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'design-tokens-'));
  try {
    execFileSync('git', ['-c', 'advice.detachedHead=false', 'clone', '-q', '--depth', '1', '--branch', tag, REPO, tmp], { stdio: 'inherit' });
    const commit = execFileSync('git', ['-C', tmp, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const bufs = {};
    for (const [from, to] of Object.entries(FILES)) bufs[to] = fs.readFileSync(path.join(tmp, from));
    return { commit, bufs };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

const arg = process.argv[2];
if (!arg) {
  console.error('usage: node scripts/sync_tokens.mjs <tag> | --check | --check-remote');
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
  if (process.env.CI !== 'true') process.exit(0);
}

if (arg === '--check-remote' || arg === '--check') {
  const lock = JSON.parse(fs.readFileSync(LOCK, 'utf8'));
  const { commit, bufs } = fetchTag(lock.ref);
  const bad = Object.keys(bufs).filter((f) => sha256(bufs[f]) !== sha256(fs.readFileSync(f)));
  if (commit !== lock.commit) bad.unshift(`lock commit ${lock.commit.slice(0, 7)} is not ${lock.ref} (${commit.slice(0, 7)})`);
  if (bad.length) {
    console.error(`vendored tokens differ from design-tokens ${lock.ref} upstream: ${bad.join(', ')}`);
    console.error(`Run: node scripts/sync_tokens.mjs ${lock.ref}`);
    process.exit(1);
  }
  console.log(`vendored tokens match design-tokens ${lock.ref} upstream (${commit.slice(0, 7)})`);
  process.exit(0);
}

const { commit, bufs } = fetchTag(arg);
const files = {};
for (const [to, buf] of Object.entries(bufs)) {
  fs.writeFileSync(to, buf);
  files[to] = sha256(buf);
}
fs.writeFileSync(LOCK, JSON.stringify({ repo: REPO, ref: arg, commit, files }, null, 2) + '\n');
console.log(`synced design-tokens ${arg} (${commit.slice(0, 7)})`);
