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
      for (const m of text.matchAll(/<Switch\b(?:=>|[^>])*>/g)) {
        if (/\bonChange=/.test(m[0])) hits.push(`${file}: ${m[0].slice(0, 80)}`)
      }
    }
    expect(hits).toEqual([])
  })

  // A placeholder is not a label. Every text-like field needs `label`,
  // `aria-label`, `aria-labelledby` or an `id` that a FieldLabel points at.
  it('gives every form field an accessible name', () => {
    const FIELD = /<(Input|Textarea|InputGroupInput|NativeSelect|Checkbox|Slider)\b(?:=>|[^>])*>|<x-import component-from-global-scope="[\w.]+\.(Input|Textarea|NativeSelect|Checkbox)"(?:=>|[^>])*>/g
    const NAMED = /\b(label|aria-label|aria-labelledby|id)=/
    const hits = []
    for (const { file, text } of sources) {
      for (const m of text.matchAll(FIELD)) {
        if (!NAMED.test(m[0])) hits.push(`${file}: ${m[0].slice(0, 90)}`)
      }
    }
    expect(hits).toEqual([])
  })
})

describe('apps: toast manager', () => {
  // cee1fb6 removed the callable toast() and toast.success/info/… surface; the
  // manager is { add, close, promise }. A stale call throws on click.
  it('only calls toast.add / toast.close / toast.promise', () => {
    const allowed = new Set(['add', 'close', 'promise'])
    const hits = []
    for (const { file, text } of sources) {
      for (const m of text.matchAll(/\btoast\s*(\.\s*(\w+)|\[|\(|\)\s*\()/g)) {
        if (m[2] && allowed.has(m[2])) continue
        hits.push(`${file}: ${text.slice(m.index, m.index + 40)}`)
      }
    }
    expect(hits).toEqual([])
  })
})
