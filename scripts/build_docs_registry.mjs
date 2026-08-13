#!/usr/bin/env node
/** Keep the docs component catalogue aligned to the install registry. */
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const ROOT = new URL('..', import.meta.url).pathname
const docsPath = path.join(ROOT, 'site/registry.js')
const source = fs.readFileSync(docsPath, 'utf8')
const groups = JSON.parse(source.slice(source.indexOf('['), source.lastIndexOf(';')))
const install = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry.json'), 'utf8'))
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, '_ds_manifest.json'), 'utf8'))
const iconCount = fs.readdirSync(path.join(ROOT, 'assets/icons')).filter(name => name.endsWith('.svg')).length

// Descriptions are editorial, but these entries describe contracts that have
// changed or were truncated by the old prompt importer. Keep the corrections
// beside the generator so a rebuild cannot silently resurrect stale copy.
const DESCRIPTION_OVERRIDES = {
  ButtonGroup: 'Attaches adjacent buttons into one segment with shared borders and squared inner corners. Use it for tightly related actions of equal rank.',
  InputGroup: 'Composable bordered control row with explicit input, textarea, addon, text, and button parts.',
  NativeSelect: 'Browser-native select with Meridian sizing, mobile picker behavior, option, and optgroup parts.',
  Select: 'Composable custom select with controlled state, anchored content, groups, labels, separators, and keyboard navigation.',
  Avatar: 'Composable avatar with explicit image, fallback, badge, group, and group-count parts in three named sizes.',
  Badge: 'Compact status, category, or link label with canonical variants and explicit child composition.',
  Card: 'Composable surface with header, title, description, action, content, and footer parts; supports compact, elevated, and interactive treatments.',
  Separator: 'Unlabelled horizontal or vertical dividing rule with optional decorative semantics and no built-in spacing.',
  Menubar: 'Desktop-style composable menu bar with controlled state, keyboard navigation, groups, choices, shortcuts, separators, and nested submenus.',
  Pagination: 'Composable semantic pager with explicit content, items, links, previous and next controls, and ellipsis.',
  Tabs: 'Controlled or uncontrolled tabs with composable list, trigger, and content parts, plus horizontal and vertical orientation.',
  Alert: 'Composable inline notice with explicit icon, title, description, and action parts; use the destructive variant for failures.',
  Skeleton: 'Native div loading placeholder with ref forwarding; compose repeated placeholders and set dimensions through native attributes and styles.',
  Table: 'Sortable, selectable data table with sticky headers, loading and empty states, plus composable semantic table parts.',
  Marker: 'Composable compact status note, system event, bordered row, or labelled separator with icon and content parts.',
  Player: 'Audio player with a seekable waveform, skip, play, mute, keyboard controls, tabular timestamps, and an imperative jumpTo ref for transcripts.',
  PromptSteps: 'Keyboard-first inline question wizard with numbered choices, arrow navigation, confirmation, dismissal, back navigation, and an optional freeform choice.',
  RichComposer: 'Composer with atomic @-mention chips and /-commands, grouped filtering, keyboard selection, and structured submit output.',
  SelectionQuote: 'Select-to-quote affordance with a viewport-aware floating toolbar that flips and clamps around the selected text.',
  Transcript: 'Time-synced transcript with an active row, optional word timing, automatic centering, and timestamp controls that can drive a player.',
  WebPreview: 'Responsive browser preview with a draft address bar, reload, desktop/tablet/mobile widths, and a collapsible console.',
  Console: 'Streaming log viewer with level styling, timestamps, collapsible stack traces, live-edge following, and a jump-to-latest control.',
  Exception: 'Runtime-error card with an error type, message, collapsible frames, internal-frame treatment, and an optional source excerpt.',
  Icon: `Renders one of the ${iconCount} curated Lucide-derived icons from assets/icons/, inheriting currentColor.`,
}

const componentItems = install.items.filter(item => item.type === 'registry:ui')
const itemBySource = new Map(componentItems.map(item => [item.files.find(file => file.path.endsWith('.jsx'))?.path, item]))
const manifestByName = new Map(manifest.components.map(component => [component.name, component]))
const demoNames = new Set()
for (const file of fs.readdirSync(path.join(ROOT, 'site/examples')).filter(name => name.endsWith('.jsx'))) {
  const text = fs.readFileSync(path.join(ROOT, 'site/examples', file), 'utf8')
  for (const match of text.matchAll(/^\/\/ @demo\s+(\S+)/gm)) demoNames.add(match[1])
}

function interfaceProps(file, name, previous = { ext: null, props: [] }) {
  if (!file || !fs.existsSync(file)) return { ext: null, props: [] }
  const text = fs.readFileSync(file, 'utf8')
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const propsName = `${name}Props`
  const declaration = source.statements.find(node =>
    (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name.text === propsName)
  if (!declaration) return previous

  const members = []
  const inherited = []
  if (ts.isInterfaceDeclaration(declaration)) {
    members.push(...declaration.members)
    for (const clause of declaration.heritageClauses || []) {
      inherited.push(...clause.types.map(type => type.getText(source)))
    }
  } else if (ts.isTypeLiteralNode(declaration.type)) {
    members.push(...declaration.type.members)
  } else if (ts.isIntersectionTypeNode(declaration.type)) {
    for (const type of declaration.type.types) {
      if (ts.isTypeLiteralNode(type)) members.push(...type.members)
      else inherited.push(type.getText(source))
    }
  } else {
    inherited.push(declaration.type.getText(source))
  }

  const oldByName = new Map((previous.props || []).map(prop => [prop.n, prop]))
  const props = members.flatMap(member => {
    if (!ts.isPropertySignature(member) || !member.name || !member.type) return []
    const propName = member.name.getText(source).replace(/^['"]|['"]$/g, '')
    const jsdoc = ts.getJSDocCommentsAndTags(member)
      .map(node => node.getText(source).replace(/^\/\*\*|\*\/$/g, '').replace(/^\s*\*\s?/gm, '').trim())
      .join('\n')
    const defaultMatch = jsdoc.match(/@default\s+([^\n]+)/)
    const description = jsdoc.replace(/\s*@default\s+[^\n]+/, '').trim()
    const old = oldByName.get(propName)
    return [{
      n: propName,
      t: member.type.getText(source),
      req: !member.questionToken,
      d: description || old?.d || '',
      def: defaultMatch?.[1]?.trim() || old?.def || null,
    }]
  })
  return { ext: inherited.join(' & ') || null, props }
}

for (const group of groups) {
  group.items = group.items.filter(item => !manifestByName.has(item.name) || demoNames.has(item.name))
  for (const doc of group.items) {
    const component = manifestByName.get(doc.name)
    const item = component && itemBySource.get(component.sourcePath)
    const dtsEntry = item?.files?.find(file => file.path.endsWith('.d.ts'))
    const typed = interfaceProps(dtsEntry && path.join(ROOT, dtsEntry.path), doc.name, doc)
    doc.ext = typed.ext
    doc.props = typed.props
    if (DESCRIPTION_OVERRIDES[doc.name]) doc.desc = DESCRIPTION_OVERRIDES[doc.name]
  }
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
