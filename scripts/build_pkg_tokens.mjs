// Build @efolusi/meridian-tokens into packages/tokens/dist/.
//
// The token layer as a standalone package, for Style Dictionary / Figma
// Variables / Tailwind users who want the tokens without the React components.
// It is assembled from the SAME flat sources the umbrella package ships, in the
// SAME layout (tokens/ subdir + assets/fonts/), so styles.css's `@import
// "./tokens/x.css"` and fonts.css's `../assets/fonts/` resolve unchanged and the
// behaviour cannot drift from the umbrella.
//
//   node scripts/build_pkg_tokens.mjs          # write packages/tokens/dist/
//   node scripts/build_pkg_tokens.mjs --check  # verify dist/ matches the sources
//
// Version is read from _ds_manifest.json, the single source the whole repo bumps.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'packages', 'tokens', 'dist');
const CHECK = process.argv.includes('--check');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, '_ds_manifest.json'), 'utf8')).version;

const files = new Map(); // package-relative path -> Buffer|string

// The stylesheet entry and the six token layers, in their existing subdir layout.
files.set('styles.css', fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8'));
for (const f of fs.readdirSync(path.join(ROOT, 'tokens')).sort()) {
  if (f.endsWith('.css')) files.set(`tokens/${f}`, fs.readFileSync(path.join(ROOT, 'tokens', f), 'utf8'));
}
// The fonts fonts.css @font-faces, with their OFL texts (redistribution requires it).
const FONT_DIR = path.join(ROOT, 'assets', 'fonts');
for (const f of fs.readdirSync(FONT_DIR).sort()) {
  if (/\.woff2?$/.test(f)) files.set(`assets/fonts/${f}`, fs.readFileSync(path.join(FONT_DIR, f)));
  else if (f.startsWith('OFL')) files.set(`assets/fonts/${f}`, fs.readFileSync(path.join(FONT_DIR, f), 'utf8'));
}
// The machine-readable deliverables. The Tailwind preset is CommonJS, and a
// consuming tailwind.config.js does require(), so it ships as .cjs.
files.set('tokens.json', fs.readFileSync(path.join(ROOT, 'tokens.json'), 'utf8'));
files.set('tailwind.preset.cjs', fs.readFileSync(path.join(ROOT, 'tailwind.preset.js'), 'utf8'));

// A tiny package.json inside dist so the published tarball is self-describing and
// the version tracks the manifest without a second hand-edited field.
files.set('package.json', JSON.stringify({
  name: '@efolusi/meridian-tokens',
  version,
  description: 'Meridian design tokens: CSS custom properties, DTCG tokens.json, and a Tailwind preset. The token layer of @efolusi/meridian, standalone.',
  license: 'MIT',
  homepage: 'https://meridian.efolusi.com',
  repository: { type: 'git', url: 'git+https://github.com/efolusi/meridian.git', directory: 'packages/tokens' },
  sideEffects: ['**/*.css'],
  exports: {
    './styles.css': './styles.css',
    './tokens.json': './tokens.json',
    './tailwind.preset.cjs': './tailwind.preset.cjs',
    './tokens/*': './tokens/*',
    './assets/*': './assets/*',
    './package.json': './package.json',
  },
  keywords: ['design-tokens', 'dtcg', 'tailwind', 'css-variables', 'meridian'],
}, null, 2) + '\n');

if (CHECK) {
  const stale = [];
  for (const [rel, content] of files) {
    const p = path.join(OUT, rel);
    if (!fs.existsSync(p)) { stale.push(rel); continue; }
    const same = Buffer.isBuffer(content)
      ? fs.readFileSync(p).equals(content)
      : fs.readFileSync(p, 'utf8') === content;
    if (!same) stale.push(rel);
  }
  if (stale.length) {
    console.error(`packages/tokens/dist is out of date (${stale.length} file(s)), e.g. ${stale.slice(0, 3).join(', ')}`);
    console.error('run: node scripts/build_pkg_tokens.mjs');
    process.exit(1);
  }
  console.log(`@efolusi/meridian-tokens dist matches the sources (${files.size} files)`);
  process.exit(0);
}

fs.rmSync(OUT, { recursive: true, force: true });
for (const [rel, content] of files) {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}
console.log(`@efolusi/meridian-tokens@${version}: ${files.size} files -> packages/tokens/dist/`);
