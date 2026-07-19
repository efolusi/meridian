// Compile every component and showcase source into _ds_bundle.js.
//
// This is the DS compiler. It used to live outside the repository, which meant
// nobody but the owner could regenerate the one artifact every page actually
// runs — an outside contributor could edit a component and had no way to build
// or verify it, and CI could only check a self-reported hash. This file removes
// that limit: the bundle is now reproducible from source by anyone with node.
//
//   npm install                          # once, for @babel/standalone
//   node scripts/build_bundle.mjs        # write _ds_bundle.js
//   node scripts/build_bundle.mjs --check  # exit 1 if the committed bundle is stale
//
// The output format is documented in ARCHITECTURE.md § The bundle format. This
// implementation reproduces the previous compiler's output byte for byte, which
// is asserted by --check against the committed artifact.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NAMESPACE = 'EfolusiDesignSystem_4ffc3d';
const OUT = path.join(ROOT, '_ds_bundle.js');

let Babel;
try {
  Babel = require('@babel/standalone');
} catch {
  console.error(
    'Could not load @babel/standalone.\n' +
    'Run `npm install` in the repo root first (it is the only build dependency).'
  );
  process.exit(2);
}

/** Every source the bundle is built from: components first, then showcases. */
function discover() {
  const out = [];
  for (const base of ['components', 'showcases']) {
    const dir = path.join(ROOT, base);
    if (!fs.existsSync(dir)) continue;
    for (const group of fs.readdirSync(dir).sort()) {
      const gdir = path.join(dir, group);
      if (!fs.statSync(gdir).isDirectory()) continue;
      for (const f of fs.readdirSync(gdir).sort()) {
        if (f.endsWith('.jsx')) out.push(path.posix.join(base, group, f));
      }
    }
  }
  return out;
}

/** Relative-import edges between bundled sources. Bare imports (react) are dropped. */
function depsOf(rel, known) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const deps = [];
  for (const m of src.matchAll(/^import .* from '([^']+)';/gm)) {
    const spec = m[1];
    if (!spec.startsWith('.')) continue;
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(rel), spec));
    if (known.has(target)) deps.push(target);
  }
  return deps;
}

/**
 * Emission order: repeatedly take the lexicographically-first file whose
 * dependencies have all been emitted. Order is not load-bearing at runtime —
 * every cross-unit reference resolves inside a function body — but matching it
 * keeps the artifact diff-stable against the previous compiler.
 */
function order(files, graph) {
  const done = new Set();
  const pending = [...files].sort();
  const out = [];
  while (pending.length) {
    const i = pending.findIndex(p => graph.get(p).every(d => done.has(d)));
    if (i === -1) throw new Error(`import cycle among: ${pending.slice(0, 5).join(', ')}`);
    const [p] = pending.splice(i, 1);
    done.add(p);
    out.push(p);
  }
  return out;
}

/**
 * Compile one source into a bundle unit.
 *
 * Imports are erased and every reference to an imported binding is rewritten to
 * __ds_scope.<local>, so units share one private scope instead of a module
 * graph. React is read off the window global. A unit that throws is caught and
 * recorded rather than taking down the whole page.
 */
function compileUnit(rel) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const exportNames = [];
  const plugin = ({ types: t }) => ({
    visitor: {
      ImportDeclaration(p) {
        if (!p.node.source.value.startsWith('.')) { p.remove(); return; }
        for (const spec of p.node.specifiers) {
          const local = spec.local.name;
          const binding = p.scope.getBinding(local);
          if (!binding) continue;
          for (const ref of binding.referencePaths) {
            if (ref.node && ref.node.type === 'JSXIdentifier') {
              ref.replaceWith(t.jsxMemberExpression(t.jsxIdentifier('__ds_scope'), t.jsxIdentifier(local)));
            } else {
              ref.replaceWith(t.memberExpression(t.identifier('__ds_scope'), t.identifier(local)));
            }
          }
        }
        p.remove();
      },
      ExportNamedDeclaration(p) {
        const decl = p.node.declaration;
        if (decl) {
          if (decl.id) exportNames.push(decl.id.name);
          else if (decl.declarations) decl.declarations.forEach(d => exportNames.push(d.id.name));
          p.replaceWith(decl);
        } else {
          p.remove();
        }
      },
    },
  });

  const code = Babel.transform(src, { presets: ['react'], plugins: [plugin] }).code;
  const assign = exportNames.length ? `Object.assign(__ds_scope, { ${exportNames.join(', ')} });\n` : '';
  const unit =
    `// ${rel}\n` +
    `try { (() => {\n${code}\n${assign}})(); } ` +
    `catch (e) { __ds_ns.__errors.push({ path: "${rel}", error: String((e && e.message) || e) }); }`;
  return { unit, exportNames };
}

function build() {
  const files = discover();
  const known = new Set(files);
  const graph = new Map(files.map(f => [f, depsOf(f, known)]));
  const emitOrder = order(files, graph);

  const units = [];
  const exportsBySource = new Map();
  for (const rel of emitOrder) {
    const { unit, exportNames } = compileUnit(rel);
    units.push(unit);
    exportsBySource.set(rel, exportNames);
  }

  // A capitalised export from components/ is a public component; a lowercase one
  // (injectEfCss, computeDiff, formatTime) is an internal helper that stays off
  // the namespace. Showcases export screens that are never exposed globally.
  const components = [];
  const unexposedExports = [];
  for (const rel of [...files].sort()) {
    for (const name of exportsBySource.get(rel) || []) {
      if (name[0] === name[0].toUpperCase()) {
        if (rel.startsWith('components/')) components.push({ name, sourcePath: rel });
      } else {
        unexposedExports.push({ name, sourcePath: rel });
      }
    }
  }
  unexposedExports.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  const sourceHashes = {};
  for (const rel of [...files].sort()) {
    sourceHashes[rel] = crypto
      .createHash('sha256')
      .update(fs.readFileSync(path.join(ROOT, rel)))
      .digest('hex')
      .slice(0, 12);
  }

  const header = {
    format: 4,
    namespace: NAMESPACE,
    components,
    sourceHashes,
    inlinedExternals: [],
    unexposedExports,
  };

  const epilogue = components.map(c => `__ds_ns.${c.name} = __ds_scope.${c.name};`);

  return [
    `/* @ds-bundle: ${JSON.stringify(header)} */`,
    '',
    '(() => {',
    '',
    `const __ds_ns = (window.${NAMESPACE} = window.${NAMESPACE} || {});`,
    '',
    'const __ds_scope = {};',
    '',
    '(__ds_ns.__errors = __ds_ns.__errors || []);',
    '',
    ...units.flatMap(u => [u, '']),
    ...epilogue.flatMap(e => [e, '']),
    '})();',
    '',
  ].join('\n');
}

const check = process.argv.includes('--check');
const next = build();
const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;

if (check) {
  if (current === next) {
    console.log('_ds_bundle.js is reproducible from source (byte-identical)');
    process.exit(0);
  }
  console.error(
    '_ds_bundle.js does not match a fresh compile of the sources.\n' +
    'Run `node scripts/build_bundle.mjs` and commit the result.'
  );
  process.exit(1);
}

fs.writeFileSync(OUT, next);
console.log(
  current === next
    ? `_ds_bundle.js unchanged (${Object.keys(JSON.parse(next.slice(next.indexOf('{'), next.indexOf(' */'))).sourceHashes).length} sources)`
    : '_ds_bundle.js rewritten'
);
