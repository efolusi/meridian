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

/**
 * Compile one .jsx to ESM: rewrite relative .jsx imports to .js, and strip the
 * runtime CSS layer. The npm package ships all component CSS statically in
 * components.css (imported by styles.css), so the injected copies would be the
 * same 124 kB of rules a second time — as uncacheable JS strings that also run
 * injection work on every component's first render. The CDN bundle keeps
 * injection; only this build strips it.
 */
function compile(rel) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const code = Babel.transform(src, {
    presets: [['react', { runtime: 'classic' }]],
    plugins: [() => ({
      visitor: {
        ImportDeclaration(p) {
          // drop the injectEfCss specifier; the call sites are gone too
          p.node.specifiers = p.node.specifiers.filter(
            s => !(s.imported && s.imported.name === 'injectEfCss'));
          if (!p.node.specifiers.length) { p.remove(); return; }
          const v = p.node.source.value;
          if (v.startsWith('.') && v.endsWith('.jsx')) p.node.source.value = v.slice(0, -4) + '.js';
        },
        ExportNamedDeclaration(p) {
          const s = p.node.source;
          if (s && s.value.startsWith('.') && s.value.endsWith('.jsx')) s.value = s.value.slice(0, -4) + '.js';
        },
        VariableDeclaration(p) {
          // the `const CSS = \`...\`` literal, now redundant with components.css
          if (p.parent.type !== 'Program') return;
          if (p.node.declarations.length === 1 && p.node.declarations[0].id.name === 'CSS') p.remove();
        },
        ExpressionStatement(p) {
          const e = p.node.expression;
          if (e.type === 'CallExpression' && e.callee.type === 'Identifier' && e.callee.name === 'injectEfCss') p.remove();
        },
      },
    })],
  }).code;
  // Every component calls hooks, so under the Next.js App Router these are
  // client components. Without the directive, importing the package from a
  // Server Component is a build error. It is inert everywhere else.
  return `'use client';\n${code}`;
}

const files = new Map(); // dist-relative path -> contents

for (const { group, name } of sources()) {
  files.set(`${group}/${name}.js`, compile(`components/${group}/${name}.jsx`));
  for (const [ext, target] of [['.d.ts', `${group}/${name}.d.ts`]]) {
    const p = path.join(ROOT, 'components', group, name + ext);
    if (fs.existsSync(p)) files.set(target, fs.readFileSync(p, 'utf8'));
  }
}

// --- icons -----------------------------------------------------------------
// The CDN build fetches each SVG at runtime, deriving a base URL from the
// <script src=".._ds_bundle.js"> tag on the page. That tag only exists on the
// zero-build site: in an npm consumer the lookup returns '', the request goes
// out page-relative, and it 404s — assuming the file were even in the tarball,
// which it was not. 68 of the 106 components render an Icon, so this was every
// icon in the package silently blank.
//
// Copying the SVGs in and keeping the fetch would not fix it: the URL still
// depends on the app's deployment base path. Inline them instead. Resolution
// disappears, icons render in SSR output instead of one effect late, and there
// is no request per icon per route. All 109 files are ~38 kB raw, ~5 kB gzipped,
// and none of it is tree-shakeable either way since `name` is a runtime string.
const ICON_DIR = path.join(ROOT, 'assets', 'icons');
const iconFiles = fs.readdirSync(ICON_DIR).filter(f => f.endsWith('.svg')).sort();
const iconMap = iconFiles
  .map(f => `  ${JSON.stringify(f.replace(/\.svg$/, ''))}: ${JSON.stringify(fs.readFileSync(path.join(ICON_DIR, f), 'utf8').trim())},`)
  .join('\n');
files.set('icons/_svg.js', `// Generated by scripts/build_npm.mjs from assets/icons/. Do not edit.\nexport const SVGS = {\n${iconMap}\n};\n`);

// Replaces the compiled components/icons/Icon.jsx for the npm build only. Same
// props, same output markup; the fetch, the cache and the base() lookup are gone
// because the source is already in the module graph.
files.set('icons/Icon.js', `'use client';
import React from 'react';
import { SVGS } from './_svg.js';

export function Icon({ name, size = 16, strokeWidth = 1.5, title, className, style, ...rest }) {
  const svg = SVGS[name] || '';
  const html = svg
    ? svg.replace('width="24"', 'width="' + size + '"').replace('height="24"', 'height="' + size + '"').replace('stroke-width="2"', 'stroke-width="' + strokeWidth + '"')
    : '';
  return React.createElement('span', {
    ...rest,
    'aria-hidden': title ? undefined : true,
    'aria-label': title,
    role: title ? 'img' : undefined,
    className,
    style: { display: 'inline-flex', flex: 'none', width: size, height: size, color: 'inherit', ...style },
    dangerouslySetInnerHTML: { __html: html },
  });
}
`);
// The icons are Lucide-derived, so their licence has to travel with them.
files.set('assets/icons/LICENSE-Lucide.txt', fs.readFileSync(path.join(ICON_DIR, 'LICENSE-Lucide.txt'), 'utf8'));

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

// --- static component CSS ---------------------------------------------------
// On the CDN path each component injects its CSS at runtime. In the npm build
// the same rules ship as one static, cacheable stylesheet: server-rendered HTML
// is styled before hydration, and the JS modules stop carrying 124 kB of CSS
// strings. Extraction is only sound while every literal is static — a `${}`
// would make the static file diverge from what injection produces, so that is
// a hard build failure, not a skip.
const cssBlocks = [];
for (const { group, name } of sources()) {
  const src = fs.readFileSync(path.join(ROOT, 'components', group, `${name}.jsx`), 'utf8');
  const m = src.match(/const CSS = `([\s\S]*?)`;/);
  if (!m) continue;
  if (m[1].includes('${')) {
    console.error(`components/${group}/${name}.jsx: CSS literal contains \${} — cannot be extracted statically.`);
    process.exit(1);
  }
  cssBlocks.push(`/* components/${group}/${name}.jsx */${m[1].replace(/\s+$/, '')}\n`);
}
files.set('components.css', cssBlocks.join(''));

// The token layer. Without it every component renders unstyled. The npm
// styles.css additionally pulls in the static component CSS, so the documented
// single import keeps working now that the modules no longer inject.
files.set('styles.css',
  fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8') +
  '@import "./components.css";\n');
for (const f of fs.readdirSync(path.join(ROOT, 'tokens')).sort()) {
  if (f.endsWith('.css')) files.set(`tokens/${f}`, fs.readFileSync(path.join(ROOT, 'tokens', f), 'utf8'));
}

// The fonts the token layer actually @font-faces. Without them tokens/fonts.css
// points at ../assets/fonts/*.woff2 and nothing resolves — and an unresolvable
// url() in CSS is a hard build error in Vite and webpack, not a missing glyph.
// So the package must carry them or it breaks every bundler consumer. All three
// families are OFL, which permits redistribution provided the licence travels
// with them, so the OFL texts ship too.
const FONT_DIR = path.join(ROOT, 'assets', 'fonts');
for (const f of fs.readdirSync(FONT_DIR).sort()) {
  if (/\.(ttf|woff2?)$/.test(f)) files.set(`assets/fonts/${f}`, fs.readFileSync(path.join(FONT_DIR, f)));
  else if (f.startsWith('OFL')) files.set(`assets/fonts/${f}`, fs.readFileSync(path.join(FONT_DIR, f), 'utf8'));
}

// MIT requires the licence text to travel with the code; a package.json field
// saying "MIT" is metadata, not the grant. THIRD_PARTY_NOTICES covers the fonts
// this package redistributes.
for (const f of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) {
  files.set(f, fs.readFileSync(path.join(ROOT, f), 'utf8'));
}

files.set('package.json', JSON.stringify({
  name: '@efolusi/meridian',
  version,
  description: 'A general-purpose open-source design system by Efolusi: accessible React components, design tokens, blocks and example apps.',
  license: 'MIT',
  homepage: 'https://meridian.efolusi.com',
  repository: { type: 'git', url: 'git+https://github.com/efolusi/meridian.git' },
  type: 'module',
  // '*.css' does not cross a directory boundary in webpack's matcher, so it
  // missed tokens/*.css entirely.
  sideEffects: ['**/*.css'],
  main: './index.js',
  types: './index.d.ts',
  exports: {
    '.': { types: './index.d.ts', default: './index.js' },
    './styles.css': './styles.css',
    // Explicit, because the './*' pattern would rewrite it to components.css.js.
    './components.css': './components.css',
    './tokens/*': './tokens/*',
    // Tools read this directly; without an entry the './*' pattern rewrites it
    // to package.json.js and the read fails.
    './package.json': './package.json',
    // Without this the './*' pattern rewrites asset subpaths to a '.js' that
    // does not exist, so an explicit font or licence import fails.
    './assets/*': './assets/*',
    // Both spellings of a deep import must work. './*' alone appends the
    // extension, so 'forms/Button.js' resolved to forms/Button.js.js — which is
    // exactly the form the README documents. Node prefers the more specific
    // pattern, so these two coexist.
    './*.js': { types: './*.d.ts', default: './*.js' },
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
    if (!fs.existsSync(p)) { stale.push(rel); continue; }
    // Font files are Buffers; comparing them as utf8 would mangle both sides.
    const same = Buffer.isBuffer(content)
      ? fs.readFileSync(p).equals(content)
      : fs.readFileSync(p, 'utf8') === content;
    if (!same) stale.push(rel);
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
