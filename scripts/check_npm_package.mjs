// Import the emitted ESM package the way a consumer would, and fail if it does
// not actually resolve. Compiling is not the same as importing: a wrong export
// name, a relative import still pointing at .jsx, or a missing barrel entry all
// compile fine and only surface here.
//
//   node scripts/build_npm.mjs && node scripts/check_npm_package.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = p => pathToFileURL(path.join(ROOT, 'dist', p)).href;

// forwardRef components are objects carrying $$typeof, not functions.
const renderable = v => typeof v === 'function' || (v && typeof v === 'object' && v.$$typeof);

const MUST_EXPORT = [
  'Button', 'Input', 'FormField', 'Table', 'Toaster', 'Menu', 'Checkbox',
  'Dialog', 'Portal', 'Tooltip', 'Combobox',
];

const barrel = await import(dist('index.js'));
const missing = MUST_EXPORT.filter(n => !renderable(barrel[n]));
if (missing.length) {
  console.error('missing or unrenderable exports:', missing.join(', '));
  process.exit(1);
}

// Deep imports must be checked THROUGH the package name, not by file path.
// Importing dist/forms/Button.js directly bypasses the "exports" map entirely,
// which is how a broken map shipped: './*' appended .js, so the documented
// '@efolusi/meridian/forms/Button.js' resolved to forms/Button.js.js and threw
// for every consumer, while this check stayed green.
// Symlink the built package into a temp node_modules so Node resolves it by
// name and applies exports exactly as it would after npm install.
const sandbox = path.join(ROOT, '.check-pkg-sandbox');
fs.rmSync(sandbox, { recursive: true, force: true });
fs.mkdirSync(path.join(sandbox, 'node_modules', '@efolusi'), { recursive: true });
fs.symlinkSync(path.join(ROOT, 'dist'), path.join(sandbox, 'node_modules', '@efolusi', 'meridian'), 'dir');
fs.writeFileSync(path.join(sandbox, 'package.json'), '{"type":"module"}\n');

const NAME = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist', 'package.json'), 'utf8')).name;
const probe = path.join(sandbox, 'probe.mjs');

async function resolvesByName(specifier) {
  fs.writeFileSync(probe, `export { default as m } from ${JSON.stringify(specifier)};\n`);
  try { await import(pathToFileURL(probe).href + `?t=${specifier}`); return true; }
  catch (err) { return err.code === 'ERR_MODULE_NOT_FOUND' ? false : true; }
}

try {
  const specs = [
    `${NAME}`,
    `${NAME}/package.json`,
    // both spellings, because both appear in the docs and in the wild
    `${NAME}/forms/Button.js`, `${NAME}/forms/Button`,
    `${NAME}/data/Table.js`, `${NAME}/data/Table`,
    `${NAME}/overlay/Portal.js`, `${NAME}/feedback/Toast.js`,
  ];
  const unresolvable = [];
  for (const s of specs) if (!(await resolvesByName(s))) unresolvable.push(s);
  if (unresolvable.length) {
    console.error('these specifiers do not resolve through the package "exports" map:');
    for (const s of unresolvable) console.error(`  ${s}`);
    process.exit(1);
  }

  // and they must actually export something usable
  for (const s of [`${NAME}/forms/Button.js`, `${NAME}/data/Table.js`, `${NAME}/overlay/Portal.js`]) {
    fs.writeFileSync(probe, `export * from ${JSON.stringify(s)};\n`);
    const mod = await import(pathToFileURL(probe).href + `?u=${s}`);
    if (!Object.values(mod).some(renderable)) {
      console.error('deep import exported nothing renderable:', s);
      process.exit(1);
    }
  }
} finally {
  fs.rmSync(sandbox, { recursive: true, force: true });
}

// Every asset the CSS references must actually be in the tarball. A dangling
// url() is not a cosmetic miss: Vite and webpack fail the build outright when
// they cannot resolve one, so shipping tokens/fonts.css without the fonts next
// to it breaks every bundler consumer on import.
const cssFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(path.join(ROOT, 'dist', dir), { withFileTypes: true })) {
    const rel = dir ? `${dir}/${e.name}` : e.name;
    if (e.isDirectory()) walk(rel);
    else if (e.name.endsWith('.css')) cssFiles.push(rel);
  }
})('');

const dangling = [];
for (const rel of cssFiles) {
  const css = fs.readFileSync(path.join(ROOT, 'dist', rel), 'utf8');
  for (const [, url] of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    if (/^(data:|https?:|\/\/)/.test(url)) continue;
    const target = path.resolve(path.dirname(path.join(ROOT, 'dist', rel)), url.split(/[?#]/)[0]);
    if (!fs.existsSync(target)) dangling.push(`${rel} -> ${url}`);
  }
}
if (dangling.length) {
  console.error('CSS references assets missing from the package:');
  for (const d of dangling) console.error(`  ${d}`);
  process.exit(1);
}

// internal helpers must NOT be on the public barrel
const leaked = ['injectEfCss', 'mergeRefs', 'useAnchoredStyle', 'useFieldProps'].filter(n => n in barrel);
if (leaked.length) {
  console.error('internal helpers leaked onto the package barrel:', leaked.join(', '));
  process.exit(1);
}

console.log(`dist/ imports cleanly: ${Object.keys(barrel).length} exports, deep imports resolve, ${cssFiles.length} css files with no dangling assets, no internals leaked`);
