import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// MD111: the copyright year is computed at render, never typed. No four-digit year in the SiteFooter component, its
// types, its prompt or its docs example (a typed year is what the komando site, efolusi.com and pay each have to edit
// every January).
const YEAR = /\b(19|20)\d{2}\b/
const example = (() => {
  const text = readFileSync('site/examples/marketing.jsx', 'utf8')
  const start = text.indexOf('// @demo SiteFooter ')
  expect(start, 'the SiteFooter demo').toBeGreaterThan(-1)
  const next = text.indexOf('// @demo ', start + 1)
  return text.slice(start, next === -1 ? undefined : next)
})()

describe('SiteFooter has no typed year (MD111)', () => {
  it.each([
    ['components/marketing/SiteFooter.jsx', () => readFileSync('components/marketing/SiteFooter.jsx', 'utf8')],
    ['components/marketing/SiteFooter.d.ts', () => readFileSync('components/marketing/SiteFooter.d.ts', 'utf8')],
    ['components/marketing/SiteFooter.prompt.md', () => readFileSync('components/marketing/SiteFooter.prompt.md', 'utf8')],
    ['the SiteFooter demo in site/examples/marketing.jsx', () => example],
  ])('%s', (_name, read) => {
    expect(read()).not.toMatch(YEAR)
  })

  it('the component reads the year from the clock', () => {
    expect(readFileSync('components/marketing/SiteFooter.jsx', 'utf8')).toContain('new Date().getFullYear()')
  })
})
