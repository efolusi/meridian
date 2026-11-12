import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Static contract checks for the example apps (showcases, blocks, starters):
// misuse of a DS component API that renders fine but leaves a control dead.
function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}
const sources = [...walk('showcases'), ...walk('blocks'), ...walk('starters')]
  .filter(file => /\.(jsx|html)$/.test(file))
  .map(file => ({ file, text: readFileSync(file, 'utf8') }))

describe('apps: control wiring', () => {
  // Switch renders a <button role="switch">; a click never fires `change`, so
  // an onChange handler is silently dead. The API is onCheckedChange.
  it('wires Switch with onCheckedChange, never onChange', () => {
    const hits = []
    for (const { file, text } of sources) {
      for (const m of text.matchAll(/<Switch\b[^>]*>/g)) {
        if (/\bonChange=/.test(m[0])) hits.push(`${file}: ${m[0].slice(0, 80)}`)
      }
    }
    expect(hits).toEqual([])
  })
})
