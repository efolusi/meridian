import { readdirSync, readFileSync, statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { carryGzip, kb, renderMarkdown } from '../scripts/build_size_table.mjs'

const data = JSON.parse(readFileSync('site/sizes.json', 'utf8'))

const componentModules = readdirSync('components')
  .filter((g) => statSync('components/' + g).isDirectory())
  .flatMap((g) => readdirSync('components/' + g).filter((f) => f.endsWith('.jsx')).map((f) => `${g}/${f.replace(/\.jsx$/, '.js')}`))
  .sort()

describe('per-component size table', () => {
  it('has one row per component module', () => {
    expect(data.modules.map((m) => m.module).sort()).toEqual(componentModules)
  })

  it('records plausible sizes', () => {
    for (const m of [...data.modules, ...Object.values(data.totals)]) {
      expect(m.bytes).toBeGreaterThan(0)
      expect(m.gzip).toBeGreaterThan(0)
      expect(m.gzip).toBeLessThan(m.bytes)
    }
  })

  it('counts a module\'s Meridian dependencies: anything importing Icon is at least as big as Icon', () => {
    const icon = data.modules.find((m) => m.module === 'icons/Icon.js')
    const button = data.modules.find((m) => m.module === 'forms/Button.js')
    expect(button.bytes).toBeGreaterThan(icon.bytes)
  })

  it('the root import is bigger than any single deep import', () => {
    const largest = Math.max(...data.modules.map((m) => m.bytes))
    expect(data.totals['@efolusi/meridian'].bytes).toBeGreaterThan(largest)
  })

  it('the markdown page is rendered from the same data', () => {
    expect(readFileSync('guidelines/bundle-size.md', 'utf8')).toBe(renderMarkdown(data))
  })

  it('formats kilobytes with one decimal', () => {
    expect(kb(1024)).toBe('1.0 kB')
    expect(kb(1587)).toBe('1.5 kB')
  })
})

describe('carryGzip', () => {
  it('keeps the committed gzip while the minified bytes are unchanged', () => {
    expect(carryGzip({ a: { bytes: 100, gzip: 41 } }, { a: { bytes: 100, gzip: 40 } })).toEqual({ a: { bytes: 100, gzip: 40 } })
  })

  it('takes the new gzip once the minified bytes change', () => {
    expect(carryGzip({ a: { bytes: 120, gzip: 48 } }, { a: { bytes: 100, gzip: 40 } })).toEqual({ a: { bytes: 120, gzip: 48 } })
  })

  it('takes the new gzip for a module with no previous record', () => {
    expect(carryGzip({ b: { bytes: 10, gzip: 9 } }, null)).toEqual({ b: { bytes: 10, gzip: 9 } })
  })
})

describe('docs surface the table', () => {
  const docs = readFileSync('site/Docs.dc.html', 'utf8')

  it('has a Bundle size section that reads sizes.json', () => {
    expect(docs).toContain("id: 'bundle-size'")
    expect(docs).toContain("fetch('./sizes.json'")
    expect(docs).toContain('EfolusiDesignSystem_4ffc3d.Table')
  })

  it('lists the section in site search', () => {
    const nav = JSON.parse(readFileSync('site/nav.json', 'utf8'))
    expect(nav.docs.map((d) => d.id)).toContain('./Docs.dc.html#bundle-size')
  })
})
