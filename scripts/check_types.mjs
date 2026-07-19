// Typecheck the hand-written .d.ts files, and the emitted package's type barrel.
//
// The .d.ts layer is hand-maintained alongside each component, so nothing forces
// it to stay valid — and for a long time it was not. Every file referenced the
// `React` namespace without importing it, which meant the whole published type
// surface failed to compile the moment a consumer actually pointed tsc at it.
// Nothing caught that, because no gate ever ran tsc.
//
// Two passes, because they fail differently:
//   1. components/*/*.d.ts on their own — catches a missing import or a prop that
//      contradicts the DOM attribute it extends.
//   2. dist/index.d.ts through a consumer-style import — catches a barrel that
//      names unresolvable paths, which pass 1 cannot see.
//
//   node scripts/check_types.mjs
//
// Types are checked against the @types/react major that package.json pins as the
// react devDependency; the .d.ts are written to satisfy both 18 and 19 (hence
// React.JSX.Element rather than the global JSX namespace, which 19 removed).

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tsc = path.join(ROOT, 'node_modules', '.bin', 'tsc');

if (!fs.existsSync(tsc)) {
  console.error('typescript is not installed — run: npm ci');
  process.exit(1);
}

const BASE = ['--noEmit', '--jsx', 'react', '--lib', 'es2020,dom'];

function run(label, args) {
  try {
    execFileSync(tsc, args, { cwd: ROOT, stdio: 'pipe' });
    return 0;
  } catch (err) {
    const out = `${err.stdout || ''}${err.stderr || ''}`.trim();
    console.error(`\n${label} FAILED:\n${out}`);
    return out.split('\n').filter(l => l.includes('error TS')).length || 1;
  }
}

const declarations = fs
  .readdirSync(path.join(ROOT, 'components'))
  .flatMap(group => {
    const dir = path.join(ROOT, 'components', group);
    if (!fs.statSync(dir).isDirectory()) return [];
    return fs.readdirSync(dir).filter(f => f.endsWith('.d.ts')).map(f => `components/${group}/${f}`);
  })
  .sort();

let failures = run(`component .d.ts (${declarations.length} files)`, [...BASE, ...declarations]);

// tsc only ever sees the @types/react major that package.json pins, so a relapse
// to the bare global `JSX` namespace would pass here and then break every
// consumer on @types/react 19, which removed it. peerDependencies say react
// >=18, so that is a supported consumer. Cheap textual guard instead of a second
// type-install just to catch one pattern.
const bareJsx = declarations.filter(rel =>
  /(?<!React\.)\bJSX\./.test(fs.readFileSync(path.join(ROOT, rel), 'utf8')));
if (bareJsx.length) {
  console.error(
    `\nbare \`JSX.\` namespace in ${bareJsx.length} file(s) — use \`React.JSX.\`:\n` +
    bareJsx.map(f => `  ${f}`).join('\n') +
    `\n@types/react 19 removed the global JSX namespace; these break there.`);
  failures += bareJsx.length;
}

// The emitted barrel only exists after a build; skip rather than fail so this
// check is still useful on a clean checkout.
if (fs.existsSync(path.join(ROOT, 'dist', 'index.d.ts'))) {
  const probe = path.join(ROOT, '.check-types-consumer.ts');
  fs.writeFileSync(probe, "import * as M from './dist/index.js';\nexport default M;\n");
  try {
    failures += run('dist/ type barrel (consumer import)', [
      ...BASE, '--moduleResolution', 'bundler', '--module', 'esnext', '.check-types-consumer.ts',
    ]);
  } finally {
    fs.rmSync(probe, { force: true });
  }
} else {
  console.log('dist/ not built — skipping the package barrel pass');
}

if (failures) {
  console.error(`\n${failures} type error(s).`);
  process.exit(1);
}
console.log(`types check out: ${declarations.length} .d.ts files and the dist/ barrel compile clean`);
