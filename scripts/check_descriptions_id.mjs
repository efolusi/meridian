// Gate: site/descriptions.id.json must cover every component in the registry,
// and carry no stale extras. The English descriptions are generated into the
// registry from each .prompt.md; their Indonesian translations are hand-authored
// here, so this check is what keeps the two in step — add a component and the
// build reminds you to translate its description (and to drop it when removed).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const descId = JSON.parse(fs.readFileSync(path.join(ROOT, 'site', 'descriptions.id.json'), 'utf8'));

// The docs Components page reads its groups from registry.js (a `GROUPS = [...]`
// literal), so read the same source: group → items → { name, desc }.
const reg = fs.readFileSync(path.join(ROOT, 'site', 'registry.js'), 'utf8');
const groups = JSON.parse(reg.slice(reg.indexOf('GROUPS = ') + 9, reg.lastIndexOf(';')));
const names = groups.flatMap((g) => (g.items || []).map((it) => it.name));
const translated = new Set(Object.keys(descId));

const missing = names.filter((n) => !translated.has(n));
const extra = [...translated].filter((n) => !names.includes(n));
const empty = names.filter((n) => translated.has(n) && !String(descId[n]).trim());

if (missing.length || extra.length || empty.length) {
  if (missing.length) console.error(`descriptions.id.json is missing ${missing.length}: ${missing.join(', ')}`);
  if (empty.length) console.error(`descriptions.id.json has empty values for: ${empty.join(', ')}`);
  if (extra.length) console.error(`descriptions.id.json has stale extras (not in registry): ${extra.join(', ')}`);
  console.error('edit site/descriptions.id.json so every registry component has one non-empty Indonesian description.');
  process.exit(1);
}
console.log(`site/descriptions.id.json covers all ${names.length} components`);
