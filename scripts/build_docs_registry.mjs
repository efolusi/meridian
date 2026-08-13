#!/usr/bin/env node
/** Keep the docs component catalogue aligned to the install registry. */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const docsPath = path.join(ROOT, 'site/registry.js')
const source = fs.readFileSync(docsPath, 'utf8')
const groups = JSON.parse(source.slice(source.indexOf('['), source.lastIndexOf(';')))
const install = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry.json'), 'utf8'))
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, '_ds_manifest.json'), 'utf8'))

const componentItems = install.items.filter(item => item.type === 'registry:ui')
const itemBySource = new Map(componentItems.map(item => [item.files.find(file => file.path.endsWith('.jsx'))?.path, item]))
const manifestByName = new Map(manifest.components.map(component => [component.name, component]))
const demoNames = new Set()
for (const file of fs.readdirSync(path.join(ROOT, 'site/examples')).filter(name => name.endsWith('.jsx'))) {
  const text = fs.readFileSync(path.join(ROOT, 'site/examples', file), 'utf8')
  for (const match of text.matchAll(/^\/\/ @demo\s+(\S+)/gm)) demoNames.add(match[1])
}

function interfaceProps(file, name) {
  if (!file || !fs.existsSync(file)) return { ext: null, props: [] }
  const text = fs.readFileSync(file, 'utf8')
  const match = text.match(new RegExp(`export interface ${name}Props(?: extends ([^{]+))? \\{([\\s\\S]*?)\\}`))
  if (!match) return { ext: null, props: [] }
  const props = []
  for (const prop of match[2].matchAll(/(?:^|;)\s*([A-Za-z_$][\w$]*)(\?)?\s*:\s*([^;]+);?/g)) {
    props.push({ n: prop[1], t: prop[3].trim(), req: !prop[2], d: '', def: null })
  }
  return { ext: match[1]?.trim() || null, props }
}

for (const group of groups) {
  group.items = group.items.filter(item => !manifestByName.has(item.name) || demoNames.has(item.name))
}

const existing = new Set(groups.flatMap(group => group.items.map(item => item.name)))
for (const name of [...demoNames].sort()) {
  const component = manifestByName.get(name)
  if (!component) continue
  if (existing.has(name)) continue
  const item = itemBySource.get(component.sourcePath)
  if (!item) throw new Error(`No install registry item for ${name} (${component.sourcePath})`)
  const groupId = item.categories?.[0]
  const group = groups.find(candidate => candidate.id === groupId)
  if (!group) throw new Error(`No docs group for registry category ${groupId}`)
  const dtsEntry = item.files?.find(file => file.path.endsWith('.d.ts'))
  const typed = interfaceProps(dtsEntry && path.join(ROOT, dtsEntry.path), name)
  group.items.push({ name, desc: item.description, ext: typed.ext, props: typed.props })
  group.items.sort((a, b) => a.name.localeCompare(b.name))
}

fs.writeFileSync(docsPath, `export const GROUPS = ${JSON.stringify(groups)};\n`)
process.stdout.write(`site/registry.js: ${existing.size + [...demoNames].filter(name => manifestByName.has(name) && !existing.has(name)).length} documented components across ${groups.length} groups\n`)
