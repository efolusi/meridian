#!/usr/bin/env node
/**
 * Every deprecation must be documented in guidelines/migration.md.
 *
 * A deprecation has two halves that this gate ties together:
 *   - the type: `@deprecated` on a prop in the component's .d.ts. Guard's rule
 *     pack (packages/guard/src/generated/meridian-rules.json) is generated from
 *     these, so the gate reads that file.
 *   - the runtime: a development `console.warn` in components/<group>/*.jsx whose
 *     message says "deprecated" and names the call site as `<Component prop`.
 *
 * Fails when a runtime warning has no `@deprecated` type, a `@deprecated` type
 * has no runtime warning, or either is missing its `### Component \`prop\``
 * heading in the migration guide.
 *
 *   node scripts/check_migration_guide.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GUIDE = 'guidelines/migration.md';

/** `{ component, prop }` for each deprecation warning in a component source. */
export function runtimeDeprecations(source) {
  const found = [];
  const unparsed = [];
  for (const call of source.matchAll(/console\.warn\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g)) {
    const message = call[2];
    if (!/deprecat/i.test(message)) continue;
    const site = message.match(/<([A-Z][\w.]*)\s+([a-zA-Z_$][\w$]*)/);
    if (site) found.push({ component: site[1], prop: site[2] });
    else unparsed.push(message);
  }
  return { found, unparsed };
}

/** True when the guide has a `### Component \`prop\`` heading. */
export function guideMentions(guide, { component, prop }) {
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^###\\s+${escape(component)}\\s+\`${escape(prop)}\``, 'm').test(guide);
}

/** Problems found when comparing typed and runtime deprecations against the guide. */
export function migrationProblems({ typed, runtime, unparsed = [], guide }) {
  const key = item => `${item.component}.${item.prop}`;
  const typedKeys = new Set(typed.map(key));
  const runtimeKeys = new Set(runtime.map(item => key(item)));
  const problems = [];
  for (const { file, message } of unparsed) {
    problems.push(`${file}: deprecation warning does not name its call site as "<Component prop": ${JSON.stringify(message)}`);
  }
  for (const item of runtime) {
    if (!typedKeys.has(key(item))) {
      problems.push(`${item.file}: warns that <${item.component} ${item.prop}> is deprecated, but the .d.ts does not mark ${key(item)} @deprecated`);
    }
  }
  for (const item of typed) {
    if (!runtimeKeys.has(key(item))) {
      problems.push(`${key(item)} is @deprecated in its .d.ts but no component logs a development warning naming <${item.component} ${item.prop}`);
    }
  }
  for (const k of [...new Set([...typedKeys, ...runtimeKeys])].sort()) {
    const [component, prop] = k.split('.');
    if (!guideMentions(guide, { component, prop })) {
      problems.push(`${GUIDE} has no "### ${component} \`${prop}\`" section for the ${k} deprecation`);
    }
  }
  return problems;
}

function main() {
  const rules = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages/guard/src/generated/meridian-rules.json'), 'utf8'));
  const typed = rules.deprecated.map(({ component, prop }) => ({ component, prop }));
  const runtime = [];
  const unparsed = [];
  const componentsDir = path.join(ROOT, 'components');
  for (const group of fs.readdirSync(componentsDir).sort()) {
    const dir = path.join(componentsDir, group);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const name of fs.readdirSync(dir).filter(file => file.endsWith('.jsx')).sort()) {
      const file = path.join('components', group, name);
      const result = runtimeDeprecations(fs.readFileSync(path.join(ROOT, file), 'utf8'));
      runtime.push(...result.found.map(item => ({ ...item, file })));
      unparsed.push(...result.unparsed.map(message => ({ file, message })));
    }
  }
  const guidePath = path.join(ROOT, GUIDE);
  const guide = fs.existsSync(guidePath) ? fs.readFileSync(guidePath, 'utf8') : '';
  const problems = migrationProblems({ typed, runtime, unparsed, guide });
  if (problems.length) {
    console.error(`Migration guide is missing deprecations:\n${problems.map(line => `  ${line}`).join('\n')}`);
    process.exit(1);
  }
  console.log(`${GUIDE} covers ${typed.length} deprecation(s)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
