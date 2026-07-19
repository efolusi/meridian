// Emit a publishable ESM package into dist/.
//
// The CDN bundle attaches everything to one global, which is right for the
// zero-build path and useless to anyone with a bundler: no tree-shaking, no
// per-component imports, no types resolution. This compiles the same sources
// into real ES modules, keeping the directory shape so `@efolusi/meridian/forms/Button`
// works alongside the root barrel.
//
//   node scripts/build_npm.mjs          # write dist/
//   node scripts/build_npm.mjs --check  # verify dist/ matches the sources
//
// react and react-dom stay peer dependencies — the package must never bundle
// its own copy, or a consumer ends up with two Reacts and broken hooks.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const Babel = require('@babel/standalone');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const CHECK = process.argv.includes('--check');

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const version = JSON.parse(fs.readFileSync(path.join(ROOT, '_ds_manifest.json'), 'utf8')).version;

function sources() {
  const out = [];
  for (const group of fs.readdirSync(path.join(ROOT, 'components')).sort()) {
    const dir = path.join(ROOT, 'components', group);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir).sort()) {
      if (f.endsWith('.jsx')) out.push({ group, name: f.replace(/\.jsx$/, '') });
    }
  }
  return out;
}

/** Compile one .jsx to ESM, rewriting relative .jsx imports to .js. */
function compile(rel) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const code = Babel.transform(src, {
    presets: [['react', { runtime: 'classic' }]],
    plugins: [() => ({
      visitor: {
        ImportDeclaration(p) {
          const v = p.node.source.value;
          if (v.startsWith('.') && v.endsWith('.jsx')) p.node.source.value = v.slice(0, -4) + '.js';
        },
        ExportNamedDeclaration(p) {
          const s = p.node.source;
          if (s && s.value.startsWith('.') && s.value.endsWith('.jsx')) s.value = s.value.slice(0, -4) + '.js';
        },
      },
    })],
  }).code;
  return code;
}

const files = new Map(); // dist-relative path -> contents

for (const { group, name } of sources()) {
  files.set(`${group}/${name}.js`, compile(`components/${group}/${name}.jsx`));
  for (const [ext, target] of [['.d.ts', `${group}/${name}.d.ts`]]) {
    const p = path.join(ROOT, 'components', group, name + ext);
    if (fs.existsSync(p)) files.set(target, fs.readFileSync(p, 'utf8'));
  }
}

// Root barrel: every public (capitalised) export, re-exported.
const barrel = [];
const barrelTypes = [];
for (const { group, name } of sources()) {
  const src = fs.readFileSync(path.join(ROOT, 'components', group, `${name}.jsx`), 'utf8');
  const names = [...src.matchAll(/^export (?:function|const) (\w+)/gm)].map(m => m[1])
    .filter(n => n[0] === n[0].toUpperCase());
  if (!names.length) continue;
  barrel.push(`export { ${names.join(', ')} } from './${group}/${name}.js';`);
  if (fs.existsSync(path.join(ROOT, 'components', group, `${name}.d.ts`))) {
    // Point at the implementation path, not the .d.ts — TypeScript resolves the
    // sibling declaration itself, and importing a declaration file directly is
    // an error (TS2846) for anyone consuming the package's types.
    barrelTypes.push(`export * from './${group}/${name}.js';`);
  }
}
files.set('index.js', barrel.join('\n') + '\n');
files.set('index.d.ts', barrelTypes.join('\n') + '\n');

// The token layer. Without it every component renders unstyled.
files.set('styles.css', fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8'));
for (const f of fs.readdirSync(path.join(ROOT, 'tokens')).sort()) {
  if (f.endsWith('.css')) files.set(`tokens/${f}`, fs.readFileSync(path.join(ROOT, 'tokens', f), 'utf8'));
}

files.set('package.json', JSON.stringify({
  name: '@efolusi/meridian',
  version,
  description: 'A general-purpose open-source design system by Efolusi: accessible React components, design tokens, blocks and example apps.',
  license: 'MIT',
  homepage: 'https://meridian.efolusi.com',
  repository: { type: 'git', url: 'git+https://github.com/efolusi/meridian.git' },
  type: 'module',
  sideEffects: ['*.css'],
  main: './index.js',
  types: './index.d.ts',
  exports: {
    '.': { types: './index.d.ts', default: './index.js' },
    './styles.css': './styles.css',
    './tokens/*': './tokens/*',
    './*': { types: './*.d.ts', default: './*.js' },
  },
  peerDependencies: { react: '>=18', 'react-dom': '>=18' },
  keywords: ['design-system', 'react', 'components', 'accessible', 'design-tokens', 'meridian'],
}, null, 2) + '\n');

files.set('README.md',
  `# @efolusi/meridian\n\n` +
  `The npm build of [Meridian](https://meridian.efolusi.com). Import the stylesheet once, then components as you need them.\n\n` +
  '```js\n' +
  `import '@efolusi/meridian/styles.css';\n` +
  `import { Button, FormField, Input } from '@efolusi/meridian';\n` +
  `// or per component, for the smallest graph:\n` +
  `import { Button } from '@efolusi/meridian/forms/Button.js';\n` +
  '```\n\n' +
  `\`react\` and \`react-dom\` are peer dependencies. Full docs, live demos and the zero-build CDN path: https://meridian.efolusi.com\n`);

if (CHECK) {
  let stale = [];
  for (const [rel, content] of files) {
    const p = path.join(DIST, rel);
    if (!fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== content) stale.push(rel);
  }
  if (stale.length) {
    console.error(`dist/ is out of date (${stale.length} file(s)), e.g. ${stale.slice(0, 3).join(', ')}`);
    console.error('run: node scripts/build_npm.mjs');
    process.exit(1);
  }
  console.log(`dist/ matches the sources (${files.size} files)`);
  process.exit(0);
}

fs.rmSync(DIST, { recursive: true, force: true });
for (const [rel, content] of files) {
  const p = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}
console.log(`dist/: ${files.size} files, @efolusi/meridian@${version}`);
