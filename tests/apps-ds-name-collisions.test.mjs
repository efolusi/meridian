import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// CLAUDE.md: a local helper in a showcase, block or starter must never share a
// name with a design-system export. The DS page runtime resolves JSX identifiers
// against the namespace first, and showcase files are compiled into
// _ds_bundle.js, whose `Object.assign(window, …)` would publish the local over
// the real component's global name on every page that loads the bundle.
const manifest = JSON.parse(readFileSync('_ds_manifest.json', 'utf8'))
const dsNames = new Set(manifest.components.map(c => c.name))

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const sources = [...walk('showcases'), ...walk('blocks'), ...walk('starters')]
  .filter(file => /\.(jsx|html)$/.test(file))
  .concat(['index.html', 'hello.html', '404.html', 'thumbnail.html'])

// function Name(…) · const Name = … · let Name = … · class Name …
const DECL = /\b(?:function|const|let|var|class)\s+([A-Z][A-Za-z0-9]*)\b/g

describe('apps: local component names', () => {
  it('reads a non-trivial DS export list', () => {
    expect(dsNames.size).toBeGreaterThan(100)
    expect(dsNames.has('Sidebar')).toBe(true)
  })

  it('never declares a local with the name of a DS export', () => {
    const hits = []
    for (const file of sources) {
      const text = readFileSync(file, 'utf8')
      for (const match of text.matchAll(DECL)) {
        if (dsNames.has(match[1])) hits.push(`${file}: ${match[1]}`)
      }
    }
    expect(hits).toEqual([])
  })
})
