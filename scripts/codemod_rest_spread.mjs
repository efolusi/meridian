// Add `...rest` to component signatures and spread it onto their root element.
//
// Without this, a component swallows every prop it does not name: you cannot
// attach an id, a data-* hook, an aria-* override, or an analytics handler, and
// "vendor it, own it" is not true of a component you cannot extend.
//
// The edit is located with a real parse (not a regex) and then applied as a
// surgical string splice, so formatting and comments survive untouched.
//
//   node scripts/codemod_rest_spread.mjs --dry     # report only
//   node scripts/codemod_rest_spread.mjs           # apply
//
// Skips a file when it cannot be certain: an existing rest element, a root that
// is a fragment, or a root it cannot resolve. Those are reported, not guessed.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const Babel = require('@babel/standalone');
const { parser } = Babel.packages;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');
const ONLY = process.argv.find(a => a.startsWith('--only='))?.slice(7);

const files = [];
for (const group of fs.readdirSync(path.join(ROOT, 'components')).sort()) {
  const dir = path.join(ROOT, 'components', group);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir).sort()) {
    if (f.endsWith('.jsx')) files.push(path.posix.join('components', group, f));
  }
}

/** `<React.Fragment>` / `<Fragment>` are JSXElements but accept only `key`. */
function isFragmentElement(el) {
  const n = el.openingElement.name;
  if (n.type === 'JSXIdentifier') return n.name === 'Fragment';
  if (n.type === 'JSXMemberExpression') return n.property && n.property.name === 'Fragment';
  return false;
}

/**
 * The outermost JSX element a function returns, if it is unambiguous.
 *
 * Bails out when a function has more than one JSX-returning path (Combobox
 * returns a bare control or a labelled field): spreading onto whichever return
 * happened to be found first drops the props on every other path.
 */
function rootJsx(fnNode) {
  let found = null;
  let returns = 0;
  const walk = node => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'ReturnStatement') {
      let arg = node.argument;
      // unwrap parenthesised / conditional returns to their first JSX element
      while (arg && arg.type === 'ConditionalExpression') arg = arg.consequent;
      if (arg && arg.type === 'JSXElement') {
        returns++;
        if (isFragmentElement(arg)) { found = 'fragment'; return; }
        if (!found) found = arg;
        return;
      }
      if (arg && arg.type === 'JSXFragment') { found = 'fragment'; return; }
      return;
    }
    // do not descend into nested functions: their returns are not the root
    if (node !== fnNode && (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression')) return;
    for (const k of Object.keys(node)) {
      const v = node[k];
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v.type === 'string') walk(v);
    }
  };
  (fnNode.body.body || []).forEach(walk);
  if (found === 'fragment') return 'fragment';
  if (returns > 1) return 'multiple';
  return found;
}

const applied = [], skipped = [];

for (const rel of files) {
  if (ONLY && !rel.includes(ONLY)) continue;
  const abs = path.join(ROOT, rel);
  const src = fs.readFileSync(abs, 'utf8');
  let ast;
  try {
    ast = parser.parse(src, { sourceType: 'module', plugins: ['jsx'] });
  } catch (e) {
    skipped.push([rel, 'parse failed: ' + e.message]); continue;
  }

  // every exported component function in the file
  const edits = [];
  let note = null;
  for (const stmt of ast.program.body) {
    if (stmt.type !== 'ExportNamedDeclaration' || !stmt.declaration) continue;
    const fn = stmt.declaration;
    if (fn.type !== 'FunctionDeclaration') continue;
    if (fn.params.length !== 1 || fn.params[0].type !== 'ObjectPattern') { note = 'signature is not a destructured object'; continue; }
    const pattern = fn.params[0];
    if (pattern.properties.some(p => p.type === 'RestElement')) { note = 'already has a rest element'; continue; }

    const root = rootJsx(fn);
    if (root === 'fragment') { note = 'root is a fragment (takes only key)'; continue; }
    if (root === 'multiple') { note = 'more than one JSX return path'; continue; }
    if (!root) { note = 'could not resolve a root element'; continue; }
    if (root.openingElement.attributes.some(a => a.type === 'JSXSpreadAttribute')) { note = 'root already spreads'; continue; }

    // 1. `...rest` before the pattern's closing brace
    const last = pattern.properties[pattern.properties.length - 1];
    edits.push({ pos: last.end, text: ', ...rest' });
    // 2. `{...rest}` as the first attribute, right after the tag name
    edits.push({ pos: root.openingElement.name.end, text: ' {...rest}' });
  }

  if (!edits.length) { skipped.push([rel, note || 'no exported component function']); continue; }

  let out = src;
  for (const e of edits.sort((a, b) => b.pos - a.pos)) {
    out = out.slice(0, e.pos) + e.text + out.slice(e.pos);
  }
  // sanity: the result must still parse
  try {
    parser.parse(out, { sourceType: 'module', plugins: ['jsx'] });
  } catch (e) {
    skipped.push([rel, 'edit produced invalid syntax, left alone']); continue;
  }
  applied.push(rel);
  if (!DRY) fs.writeFileSync(abs, out);
}

console.log(`${DRY ? '[dry run] ' : ''}rest-spread added to ${applied.length} component(s)`);
if (skipped.length) {
  console.log(`\nskipped ${skipped.length}:`);
  const byReason = {};
  for (const [f, r] of skipped) (byReason[r] ||= []).push(f);
  for (const [r, fs_] of Object.entries(byReason)) {
    console.log(`  ${r} (${fs_.length}): ${fs_.slice(0, 4).map(f => f.split('/').pop()).join(', ')}${fs_.length > 4 ? ', …' : ''}`);
  }
}
