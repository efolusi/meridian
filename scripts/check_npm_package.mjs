// Import the emitted ESM package the way a consumer would, and fail if it does
// not actually resolve. Compiling is not the same as importing: a wrong export
// name, a relative import still pointing at .jsx, or a missing barrel entry all
// compile fine and only surface here.
//
//   node scripts/build_npm.mjs && node scripts/check_npm_package.mjs

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

// deep imports are the reason for the directory shape; check one from each group
for (const p of ['forms/Button.js', 'data/Table.js', 'overlay/Portal.js', 'feedback/Toast.js']) {
  const mod = await import(dist(p));
  if (!Object.values(mod).some(renderable)) {
    console.error('deep import exported nothing renderable:', p);
    process.exit(1);
  }
}

// internal helpers must NOT be on the public barrel
const leaked = ['injectEfCss', 'mergeRefs', 'useAnchoredStyle', 'useFieldProps'].filter(n => n in barrel);
if (leaked.length) {
  console.error('internal helpers leaked onto the package barrel:', leaked.join(', '));
  process.exit(1);
}

console.log(`dist/ imports cleanly: ${Object.keys(barrel).length} exports, deep imports resolve, no internals leaked`);
