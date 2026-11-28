import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// MD113: one page-title rule in the voice guideline. Before it, pay and efolusi.com wrote Title Case and the
// products used three separators (pipe, colon, middle dot). The rule is in guidelines/brand.md, "Content
// fundamentals". This test pins its words, so a later edit cannot loosen it without changing the test.
const brand = readFileSync('guidelines/brand.md', 'utf8')
const fundamentals = brand.slice(brand.indexOf('## Content fundamentals'), brand.indexOf('## Visual foundations'))
const bullet = fundamentals.split('\n').find((line) => line.startsWith('- **Page titles:**')) ?? ''

describe('page title rule (guidelines/brand.md)', () => {
  it('has one Page titles bullet in Content fundamentals', () => {
    expect(bullet).not.toBe('')
    expect(fundamentals.match(/\*\*Page titles:\*\*/g)).toHaveLength(1)
  })

  it('says sentence case, the page first and the product name last', () => {
    expect(bullet).toContain('sentence case')
    expect(bullet).toContain('the page first and the product name last')
  })

  it('names the separator: a middle dot with a space on each side', () => {
    expect(bullet).toContain('` · `')
    expect(bullet).toContain('a middle dot with a space on each side')
  })

  it('rules out the other separators', () => {
    expect(bullet).toContain('never a pipe, a colon or a dash')
  })

  it('is the same in English and Indonesian, with one example each', () => {
    expect(bullet).toContain('The same in English and Indonesian')
    expect(bullet).toContain('"Invoices · Meridian"')
    expect(bullet).toContain('"Tagihan · Meridian"')
  })
})
