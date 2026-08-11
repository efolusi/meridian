#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'packages', 'guard', 'src', 'generated', 'meridian-rules.json');
const CHECK = process.argv.includes('--check');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, '_ds_manifest.json'), 'utf8'));

const components = manifest.components
  .map(({ name, sourcePath }) => ({ name, sourcePath }))
  .sort((a, b) => a.name.localeCompare(b.name));
const icons = fs.readdirSync(path.join(ROOT, 'assets', 'icons'))
  .filter(file => file.endsWith('.svg'))
  .map(file => file.replace(/\.svg$/, ''))
  .sort();
const tokens = [...new Set(
  fs.readdirSync(path.join(ROOT, 'tokens'))
    .filter(file => file.endsWith('.css'))
    .flatMap(file => [...fs.readFileSync(path.join(ROOT, 'tokens', file), 'utf8').matchAll(/--([a-z0-9-]+)\s*:/g)].map(match => match[1])),
)].sort();

function interfaceBody(source, name) {
  const declaration = new RegExp(`export\\s+interface\\s+${name}Props(?:\\s+extends[^\\{]+)?\\s*\\{`, 'g').exec(source);
  if (!declaration) return null;
  const open = source.indexOf('{', declaration.index);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }
  return null;
}

const deprecated = [];
for (const component of components) {
  const declaration = path.join(ROOT, component.sourcePath.replace(/\.jsx$/, '.d.ts'));
  if (!fs.existsSync(declaration)) continue;
  const source = fs.readFileSync(declaration, 'utf8');
  const body = interfaceBody(source, component.name);
  if (!body) continue;
  const pattern = /\/\*\*((?:(?!\*\/)[\s\S])*?@deprecated(?:(?!\*\/)[\s\S])*)\*\/\s*([A-Za-z_$][\w$]*)\??\s*:/g;
  for (const match of body.matchAll(pattern)) {
    const message = match[1].replace(/^\s*\*?\s?/gm, ' ').replace(/\s+/g, ' ').trim();
    const replacement = message.match(/\buse\s+[`'"]?([A-Za-z_$][\w$]*)/i)?.[1]
      || message.match(/\bto\s+[`'"]?([A-Za-z_$][\w$]*)/i)?.[1]
      || null;
    deprecated.push({ component: component.name, prop: match[2], replacement, message });
  }
}
deprecated.sort((a, b) => a.component.localeCompare(b.component) || a.prop.localeCompare(b.prop));

const output = `${JSON.stringify({
  schemaVersion: 1,
  version: manifest.version,
  components,
  icons,
  tokens,
  deprecated,
}, null, 2)}\n`;

if (CHECK) {
  if (!fs.existsSync(OUTPUT) || fs.readFileSync(OUTPUT, 'utf8') !== output) {
    console.error('Meridian Guard rule pack is stale; run node scripts/build_guard_rules.mjs');
    process.exit(1);
  }
  console.log(`Meridian Guard rule pack matches ${components.length} exports, ${icons.length} icons, and ${tokens.length} tokens`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, output);
console.log(`Meridian Guard rule pack: ${components.length} exports, ${icons.length} icons, ${tokens.length} tokens -> ${path.relative(ROOT, OUTPUT)}`);
