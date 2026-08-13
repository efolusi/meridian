#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const source = fs.readFileSync(path.join(ROOT, 'site', 'registry.js'), 'utf8')
const marker = 'GROUPS = '
const start = source.indexOf(marker)
if (start < 0) throw new Error('site/registry.js does not export GROUPS')

const groups = JSON.parse(source.slice(start + marker.length, source.lastIndexOf(';')))
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, '_ds_manifest.json'), 'utf8'))
const exports = new Set(manifest.components.map((component) => component.name))
const demoNames = new Set()
for (const file of fs.readdirSync(path.join(ROOT, 'site', 'examples'))) {
  if (!file.endsWith('.jsx')) continue
  const demoSource = fs.readFileSync(path.join(ROOT, 'site', 'examples', file), 'utf8')
  for (const match of demoSource.matchAll(/^\/\/ @demo (\S+)/gm)) demoNames.add(match[1])
}
const seen = new Set()
const errors = []

for (const group of groups) {
  const card = path.resolve(ROOT, 'site', group.card)
  if (!fs.existsSync(card)) errors.push(`${group.id}: missing card ${group.card}`)
  for (const item of group.items) {
    if (seen.has(item.name)) errors.push(`${item.name}: duplicate docs entry`)
    seen.add(item.name)
    if (!exports.has(item.name)) errors.push(`${item.name}: not exported by _ds_manifest.json`)
    if (!demoNames.has(item.name)) errors.push(`${item.name}: missing matching // @demo marker`)
  }
}

if (errors.length) {
  console.error(`docs registry drift:\n${errors.map((error) => `  - ${error}`).join('\n')}`)
  process.exit(1)
}

console.log(`docs registry: ${groups.length} groups, ${seen.size} exported component entries`)
