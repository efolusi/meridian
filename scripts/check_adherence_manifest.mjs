#!/usr/bin/env node
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync(new URL('../_ds_manifest.json', import.meta.url), 'utf8'));
const adherence = JSON.parse(fs.readFileSync(new URL('../_adherence.oxlintrc.json', import.meta.url), 'utf8'));
const expected = manifest.components.map(component => component.name).sort();
const actual = Object.keys(adherence['x-omelette']?.components || {}).sort();
const missing = expected.filter(name => !actual.includes(name));
const stale = actual.filter(name => !expected.includes(name));

if (missing.length || stale.length) {
  if (missing.length) console.error(`adherence metadata is missing ${missing.length} public export(s): ${missing.join(', ')}`);
  if (stale.length) console.error(`adherence metadata has ${stale.length} stale export(s): ${stale.join(', ')}`);
  process.exit(1);
}

console.log(`adherence metadata matches all ${expected.length} public exports`);
