// Wrap named components in React.forwardRef and point the ref at their root.
//
// Only Player did this before, so you could not measure a Table, focus a
// Combobox, or hand a Popover to a positioning library. The set here is the
// components a consumer most often needs a handle on.
//
//   node scripts/codemod_forward_ref.mjs --dry
//   node scripts/codemod_forward_ref.mjs
//
// Positions come from a real parse; edits are string splices, so formatting and
// comments survive. Where a component already keeps its own ref on the root, the
// two are combined with mergeRefs rather than one clobbering the other.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { parser } = require('@babel/standalone').packages;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');

// file → { component, param, ownRef }
//   param  : name for the forwarded ref (avoids colliding with a local `ref`)
//   ownRef : the component's existing root ref, to merge with (null if none)
const TARGETS = [
  { file: 'components/data/Table.jsx',           component: 'Table',          param: 'ref',  ownRef: null },
  { file: 'components/feedback/Dialog.jsx',      component: 'Dialog',         param: 'ref',  ownRef: null },
  { file: 'components/ai/PromptComposer.jsx',    component: 'PromptComposer', param: 'ref',  ownRef: null },
  { file: 'components/ai/Conversation.jsx',      component: 'Conversation',   param: 'ref',  ownRef: null },
  { file: 'components/navigation/Tabs.jsx',      component: 'Tabs',           param: 'fRef', ownRef: 'ref' },
  { file: 'components/overlay/Drawer.jsx',       component: 'Drawer',         param: 'ref',  ownRef: 'panelRef' },
  { file: 'components/overlay/Menu.jsx',         component: 'Menu',           param: 'fRef', ownRef: 'ref' },
  { file: 'components/overlay/Popover.jsx',      component: 'Popover',        param: 'fRef', ownRef: 'ref' },
];

const done = [], skipped = [];

for (const t of TARGETS) {
  const abs = path.join(ROOT, t.file);
  const src = fs.readFileSync(abs, 'utf8');
  if (/React\.forwardRef\(function\s+\w+/.test(src) && src.includes(`function ${t.component}(`)) {
    // already converted
    if (src.includes(`React.forwardRef(function ${t.component}(`)) { skipped.push([t.file, 'already forwards a ref']); continue; }
  }
  const ast = parser.parse(src, { sourceType: 'module', plugins: ['jsx'] });

  let stmt = null;
  for (const s of ast.program.body) {
    if (s.type === 'ExportNamedDeclaration' && s.declaration &&
        s.declaration.type === 'FunctionDeclaration' && s.declaration.id.name === t.component) { stmt = s; break; }
  }
  if (!stmt) { skipped.push([t.file, `no exported function ${t.component}`]); continue; }
  const fn = stmt.declaration;

  // the root element carrying {...rest}
  let root = null;
  const walk = n => {
    if (!n || typeof n !== 'object' || root) return;
    if (n.type === 'JSXOpeningElement' && n.attributes.some(a => a.type === 'JSXSpreadAttribute')) { root = n; return; }
    for (const k of Object.keys(n)) {
      const v = n[k];
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v.type === 'string') walk(v);
    }
  };
  walk(fn.body);
  if (!root) { skipped.push([t.file, 'no root element spreading rest']); continue; }

  const existing = root.attributes.find(a => a.type === 'JSXAttribute' && a.name.name === 'ref');
  if (t.ownRef && !existing) { skipped.push([t.file, `expected an existing ref=${t.ownRef} on the root`]); continue; }
  if (!t.ownRef && existing) { skipped.push([t.file, 'root unexpectedly already has a ref']); continue; }

  const edits = [];
  // 1. wrap: `export function X(` -> `export const X = React.forwardRef(function X(`
  edits.push({ start: fn.start, end: fn.id.end, text: `const ${t.component} = React.forwardRef(function ${t.component}` });
  // 2. second parameter
  edits.push({ start: fn.params[0].end, end: fn.params[0].end, text: `, ${t.param}` });
  // 3. ref on the root
  if (existing) {
    edits.push({ start: existing.start, end: existing.end, text: `ref={mergeRefs(${t.param}, ${t.ownRef})}` });
  } else {
    edits.push({ start: root.name.end, end: root.name.end, text: ` ref={${t.param}}` });
  }
  // 4. close the forwardRef call
  edits.push({ start: fn.end, end: fn.end, text: ');' });

  let out = src;
  for (const e of edits.sort((a, b) => b.start - a.start)) {
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
  }
  // mergeRefs has to be imported where it is used
  if (existing && !/\bmergeRefs\b/.test(src)) {
    out = out.replace(/import \{ injectEfCss \} from '([^']+)';/, "import { injectEfCss, mergeRefs } from '$1';");
    if (!/mergeRefs.*from/.test(out)) { skipped.push([t.file, 'could not add the mergeRefs import']); continue; }
  }
  try {
    parser.parse(out, { sourceType: 'module', plugins: ['jsx'] });
  } catch (e) {
    skipped.push([t.file, 'edit produced invalid syntax: ' + e.message]); continue;
  }
  done.push(t.file + (existing ? ` (merged with ${t.ownRef})` : ''));
  if (!DRY) fs.writeFileSync(abs, out);
}

console.log(`${DRY ? '[dry run] ' : ''}forwardRef added to ${done.length}:`);
done.forEach(d => console.log('  ' + d));
if (skipped.length) {
  console.log(`\nskipped ${skipped.length}:`);
  skipped.forEach(([f, r]) => console.log(`  ${f}: ${r}`));
}
