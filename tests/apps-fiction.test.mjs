import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Owner decision 2026-11-13: the SaaS the example apps pretend to be is a
// fictional product, Fernwick, never "Meridian" (the design system's own name)
// and never on Efolusi's real domain, package scope or key prefix. Real-world
// compliance and uptime claims stay bracketed placeholders.
function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}
const sources = [...walk('showcases'), ...walk('blocks'), ...walk('starters')]
  .filter(file => /\.(jsx|html)$/.test(file))
  .map(file => ({ file, text: readFileSync(file, 'utf8') }))

// What may still say Meridian: the kit's own tab title on a block or showcase
// page ("Pricing block | Meridian"), the mark's asset path, and sentences about
// the design system itself ("composed from Meridian components").
function productText(file, text) {
  let t = text.replace(/meridian-mark\.svg/g, '').replace(/Meridian components/g, '')
  if (!file.startsWith('starters/')) t = t.replace(/<title>[^<]*<\/title>/g, '')
  return t
}

describe('apps: the fictional product', () => {
  it('never calls the fictional SaaS "Meridian"', () => {
    const hits = []
    for (const { file, text } of sources) {
      const t = productText(file, text)
      for (const m of t.matchAll(/Meridian/g)) hits.push(`${file}: …${t.slice(Math.max(0, m.index - 30), m.index + 20).replace(/\s+/g, ' ')}`)
    }
    expect(hits).toEqual([])
  })

  it('never puts the fictional product on Efolusi\'s domain, package scope or key prefix', () => {
    const hits = []
    for (const { file, text } of sources) {
      for (const m of text.matchAll(/(?<![A-Za-z])efolusi(?![A-Za-z]*DesignSystem)|\bef_(?:live|test)_/g)) hits.push(`${file}: ${text.slice(m.index, m.index + 24)}`)
    }
    expect(hits).toEqual([])
  })

  it('makes no real-world compliance or uptime claim', () => {
    const hits = []
    for (const { file, text } of sources) {
      for (const m of text.matchAll(/(?<!\[)\b(?:SOC ?2(?: Type I{1,2})?|ISO 27001|HIPAA|\d{2}\.\d+% uptime)/g)) hits.push(`${file}: ${m[0]}`)
    }
    expect(hits).toEqual([])
  })
  // Owner decision 2026-11-13: invented metrics carry a visible "Sample data"
  // label, the way the finance starters badge their headings. A showcase is
  // judged as a folder (its screens share one shell); a starter page alone.
  it('labels every page with invented metrics as sample data', () => {
    const METRIC = /\b(?:Stat|Sparkline|BarChart)\b|\bMRR\b/
    const groups = {}
    for (const { file, text } of sources) {
      const key = file.startsWith('showcases/') ? file.split('/').slice(0, 2).join('/') : file
      ;(groups[key] ||= []).push(text)
    }
    const missing = Object.entries(groups)
      .filter(([, texts]) => texts.some(t => METRIC.test(t)) && !texts.some(t => />\s*Sample data\s*</.test(t) || /Sample data:/.test(t)))
      .map(([key]) => key)
      .filter(key => !key.startsWith('blocks/'))
    expect(missing).toEqual([])
  })
})
