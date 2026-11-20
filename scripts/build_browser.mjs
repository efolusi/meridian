#!/usr/bin/env node
// Generate browser/theme.js, theme.d.ts, theme-init.js and hashes.json: the plain
// scripts for sites without React. browser/marketing.js is hand-written and only hashed.
// The theme contract has one source, the marked block in ThemeToggle.jsx.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = 'components/marketing/ThemeToggle.jsx';
const OUT = path.join(ROOT, 'browser');

function themeBlock() {
  const src = fs.readFileSync(path.join(ROOT, SOURCE), 'utf8');
  const m = src.match(/\/\/ theme-contract:start[^\n]*\n([\s\S]*?)\/\/ theme-contract:end\n/);
  if (!m) throw new Error(`${SOURCE}: theme-contract markers not found`);
  return m[1];
}

// The types travel with theme.js: the contract's declarations from ThemeToggle.d.ts, without the React component.
function themeTypes() {
  const dts = fs.readFileSync(path.join(ROOT, SOURCE.replace(/\.jsx$/, '.d.ts')), 'utf8');
  const parts = dts.match(/(?:\/\*\*[^\n]*\*\/\n)?export (?:type ThemePreference|declare function)[^\n]*/g);
  return `// Generated from ${SOURCE.replace(/\.jsx$/, '.d.ts')} by scripts/build_browser.mjs. Do not edit.\n${parts.join('\n')}\n`
    + 'export declare const THEME_PREFERENCES: ThemePreference[];\n'
    + "export declare const THEME_STORAGE_KEY: 'efolusi-theme';\n"
    + "export declare const THEME_CHANGE_EVENT: 'efolusi-theme-change';\n"
    + "export declare const LABELS: Record<'en' | 'id', Record<ThemePreference | 'next', string>>;\n";
}

const sri = (text) => `sha256-${createHash('sha256').update(text).digest('base64')}`;

/** Every generated file as { name: text }; the same input always gives the same bytes. */
export function buildBrowserFiles() {
  const block = themeBlock();
  const theme = `// Generated from ${SOURCE} by scripts/build_browser.mjs. Do not edit.\n${block}`
    + 'export { THEME_PREFERENCES, THEME_STORAGE_KEY, THEME_CHANGE_EVENT, LABELS };\n';
  const context = {};
  vm.runInNewContext(`${block.replace(/^export /gm, '')}\nthis.init = themeInitScript();`, context);
  const init = context.init;
  const marketing = fs.readFileSync(path.join(OUT, 'marketing.js'), 'utf8');
  const hashes = { 'marketing.js': sri(marketing), 'theme-init.js': sri(init), 'theme.js': sri(theme) };
  return { 'hashes.json': `${JSON.stringify(hashes, null, 2)}\n`, 'theme-init.js': init, 'theme.d.ts': themeTypes(), 'theme.js': theme };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  for (const [name, text] of Object.entries(buildBrowserFiles())) fs.writeFileSync(path.join(OUT, name), text);
  console.log('[build_browser] wrote browser/theme.js, theme.d.ts, theme-init.js, hashes.json');
}
