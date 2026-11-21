#!/usr/bin/env node
// Build public/, the static assets the Cloudflare Worker serves, from the exact
// files of one commit. Usage: node scripts/build_worker_assets.mjs <40-hex sha>
//
// It is an allowlist, so a new tracked file (a workflow, a test, a package)
// never becomes web-accessible by accident. _headers and _redirects go in too:
// Workers static assets read them from the assets directory.
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const PUBLIC_PATHS = [
  '404.html', 'hello.html', 'index.html',
  '_ds_bundle.js', '_ds_manifest.json', 'styles.css', 'landing.css', 'tailwind.preset.js',
  'tokens.json', 'registry.json', 'llms.txt', 'llms-full.txt',
  'README.md', 'ARCHITECTURE.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'SECURITY.md', 'LICENSE',
  'robots.txt', 'sitemap.xml', '_headers', '_redirects',
  'assets', 'blocks', 'browser', 'compatibility', 'components', 'guidelines', 'showcases', 'site', 'skills', 'starters', 'tokens',
];
export const FORBIDDEN_PATHS = ['.github', '.nvmrc', 'CLAUDE.md', 'package.json', 'package-lock.json', 'scripts', 'tests', 'wrangler.jsonc'];
export const OUT_DIR = 'public';

function fail(message) {
  throw new Error(`[meridian-worker] ${message}`);
}

function hasSymlink(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) return join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = hasSymlink(join(dir, entry.name));
      if (found) return found;
    }
  }
  return null;
}

export function buildWorkerAssets(sha, root = process.cwd()) {
  if (!/^[0-9a-f]{40}$/.test(sha ?? '')) fail('usage: build_worker_assets.mjs <40-character lowercase git sha>');
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  if (git('rev-parse', 'HEAD') !== sha) fail('checkout does not match the requested release');
  const tags = git('tag', '--list', 'v*').split('\n').filter((t) => /^v\d+\.\d+\.\d+$/.test(t));
  if (!tags.length) fail('no v* tags in this checkout; fetch the tags so older browser/<version>/ folders stay published');

  const archive = mkdtempSync(join(tmpdir(), 'meridian-worker-'));
  const out = resolve(root, OUT_DIR);
  try {
    // Exact committed bytes, never the working tree.
    execFileSync('sh', ['-c', `git archive --format=tar "${sha}" | tar -xf - -C "${archive}"`], { cwd: root });
    for (const path of PUBLIC_PATHS) {
      const full = join(archive, path);
      if (!existsSync(full) || lstatSync(full).isSymbolicLink()) fail(`required public path is absent or a symlink: ${path}`);
    }
    rmSync(out, { recursive: true, force: true });
    mkdirSync(out);
    execFileSync('sh', ['-c', `tar -C "${archive}" -cf - ${PUBLIC_PATHS.map((p) => `"${p}"`).join(' ')} | tar -C "${out}" -xf -`]);
  } finally {
    rmSync(archive, { recursive: true, force: true });
  }

  // Other sites pin browser/<version>/ with an immutable cache, so every release
  // that shipped browser files stays published, with the bytes of its tag.
  const browser = join(out, 'browser');
  for (const tag of tags) {
    // Releases before browser/ existed have nothing to keep.
    const tree = execFileSync('git', ['ls-tree', tag, '--', 'browser/'], { cwd: root, encoding: 'utf8' });
    const blobs = tree.split('\n').filter((l) => l.split(/\s/)[1] === 'blob').map((l) => l.split('\t')[1].slice('browser/'.length));
    if (!blobs.length) continue;
    const dir = join(browser, tag.slice(1));
    mkdirSync(dir);
    for (const f of blobs) writeFileSync(join(dir, f), execFileSync('git', ['show', `${tag}:browser/${f}`], { cwd: root }));
  }
  const version = JSON.parse(git('show', `${sha}:package.json`)).version;
  if (!existsSync(join(browser, version))) {
    mkdirSync(join(browser, version));
    for (const entry of readdirSync(browser, { withFileTypes: true })) {
      if (entry.isFile()) copyFileSync(join(browser, entry.name), join(browser, version, entry.name));
    }
  }

  // Other sites pin these files, which never change, and module scripts load cross-origin only
  // with CORS. _headers matches the request path even when Workers answers with the 404 page,
  // so the immutable rule is written per published file, never as a wildcard over versions.
  const versioned = readdirSync(browser, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .flatMap((dir) => readdirSync(join(browser, dir.name)).sort().map((file) => `/browser/${dir.name}/${file}`))
    .sort();
  const rules = versioned.map((path) => `${path}\n  Cache-Control: public, max-age=31536000, immutable\n  Access-Control-Allow-Origin: *\n`);
  const headersFile = join(out, '_headers');
  writeFileSync(headersFile, `${readFileSync(headersFile, 'utf8').replace(/\n*$/, '\n')}\n# Published versioned files (generated by build_worker_assets.mjs).\n${rules.join('\n')}`);

  const link = hasSymlink(out);
  if (link) fail(`public tree must not contain symlinks: ${link}`);
  for (const path of FORBIDDEN_PATHS) {
    if (existsSync(join(out, path))) fail(`non-public repository path reached publication: ${path}`);
  }
  for (const path of ['index.html', '404.html', 'site/DsSite.dc.html', '_ds_bundle.js', '_headers']) {
    if (!statSync(join(out, path)).size) fail(`required file is empty: ${path}`);
  }
  writeFileSync(join(out, 'meridian-release.txt'), `${sha}\n`);
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const out = buildWorkerAssets(process.argv[2]);
    console.log(`[meridian-worker] built ${out} for ${process.argv[2]}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
