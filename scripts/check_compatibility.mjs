#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const catalog = JSON.parse(readFileSync(resolve(ROOT, 'compatibility/catalog.json'), 'utf8'))
const manifest = JSON.parse(readFileSync(resolve(ROOT, '_ds_manifest.json'), 'utf8'))
const bundleHead = readFileSync(resolve(ROOT, '_ds_bundle.js'), 'utf8').split('\n', 1)[0]
const bundleMeta = JSON.parse(bundleHead.slice(bundleHead.indexOf('{'), bundleHead.lastIndexOf('}') + 1))

const EXPECTED_NAMES = [
  'Accordion', 'Alert', 'Alert Dialog', 'Aspect Ratio', 'Attachment', 'Avatar',
  'Badge', 'Breadcrumb', 'Bubble', 'Button', 'Button Group', 'Calendar', 'Card',
  'Carousel', 'Chart', 'Checkbox', 'Collapsible', 'Combobox', 'Command',
  'Context Menu', 'Data Table', 'Date Picker', 'Dialog', 'Direction', 'Drawer',
  'Dropdown Menu', 'Empty', 'Field', 'Hover Card', 'Input', 'Input Group',
  'Input OTP', 'Item', 'Kbd', 'Label', 'Marker', 'Menubar', 'Message',
  'Message Scroller', 'Native Select', 'Navigation Menu', 'Pagination', 'Popover',
  'Progress', 'Radio Group', 'Resizable', 'Scroll Area', 'Select', 'Sonner',
  'Separator', 'Sheet', 'Sidebar', 'Skeleton', 'Slider', 'Spinner', 'Switch',
  'Table', 'Tabs', 'Textarea', 'Toast', 'Toggle', 'Toggle Group', 'Tooltip',
  'Typography',
]

const VALID_STATUSES = new Set(['unverified', 'proven'])
const entries = catalog.components
const names = entries.map((entry) => entry.name)
const failures = []

if (catalog.version !== 1) failures.push('catalog.version must be 1')
if (!/^\d{4}-\d{2}-\d{2}$/.test(catalog.snapshot)) failures.push('snapshot must be YYYY-MM-DD')
if (names.length !== EXPECTED_NAMES.length) {
  failures.push(`expected ${EXPECTED_NAMES.length} component families, found ${names.length}`)
}
if (new Set(names).size !== names.length) failures.push('component family names must be unique')

const missing = EXPECTED_NAMES.filter((name) => !names.includes(name))
const unexpected = names.filter((name) => !EXPECTED_NAMES.includes(name))
if (missing.length) failures.push(`missing component families: ${missing.join(', ')}`)
if (unexpected.length) failures.push(`unexpected component families: ${unexpected.join(', ')}`)

const exports = new Set(manifest.components.map((component) => component.name))
const publicHelpers = new Set((bundleMeta.publicHelpers ?? []).map((helper) => helper.name))
for (const entry of entries) {
  if (!VALID_STATUSES.has(entry.status)) {
    failures.push(`${entry.name}: invalid status ${entry.status}`)
    continue
  }
  if (entry.status !== 'proven') continue

  for (const field of ['requiredExports', 'sourceFiles', 'registryItems', 'tests']) {
    if (!Array.isArray(entry[field]) || entry[field].length === 0) {
      failures.push(`${entry.name}: proven entries require non-empty ${field}`)
    }
  }
  for (const exportName of entry.requiredExports ?? []) {
    if (!exports.has(exportName)) failures.push(`${entry.name}: missing export ${exportName}`)
  }
  const sourceText = (entry.sourceFiles ?? [])
    .filter((path) => path.endsWith('.jsx'))
    .map((path) => readFileSync(resolve(ROOT, path), 'utf8'))
    .join('\n')
  for (const exportName of entry.requiredModuleExports ?? []) {
    const declaration = new RegExp(`export\\s+(?:const|function|class)\\s+${exportName}\\b`)
    if (!declaration.test(sourceText)) failures.push(`${entry.name}: missing module export ${exportName}`)
    if (!publicHelpers.has(exportName)) failures.push(`${entry.name}: ${exportName} is not exposed by the bundle`)
  }
  for (const field of ['sourceFiles', 'registryItems', 'tests']) {
    for (const path of entry[field] ?? []) {
      try {
        if (!statSync(resolve(ROOT, path)).isFile()) failures.push(`${entry.name}: ${path} is not a file`)
      } catch {
        failures.push(`${entry.name}: missing evidence file ${path}`)
      }
    }
  }
}

if (failures.length) {
  process.stderr.write(`${failures.map((failure) => `- ${failure}`).join('\n')}\n`)
  process.exit(1)
}

const proven = entries.filter((entry) => entry.status === 'proven').length
process.stdout.write(`compatibility inventory valid: ${proven}/${entries.length} proven\n`)
