import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// MD115: at a fine pointer the Checkbox row was 19.6 px tall (the label's 14 px at line-height 1.4; a bare box 19 px),
// and WCAG 2.5.8 passed only by the spacing exception. At a fine pointer the row, the label and the hit area of the
// box are 24 px at least. The 18 px box keeps its size, and the 44 px hit area at a coarse pointer stays. Measured
// in a browser (tests/fixtures/md115-checkbox-row.html): row 19.59 -> 24 (labelled), 37.79 -> 42.19 (with a
// description), 19 -> 24 (bare); the box stays 18 x 18.
const source = readFileSync('components/forms/Checkbox.jsx', 'utf8')
const css = /const CSS = `([\s\S]*?)`;/.exec(source)[1]

function mediaBlock(query) {
  const start = css.indexOf(`@media (${query}){`)
  expect(start, `@media (${query})`).toBeGreaterThan(-1)
  let depth = 0
  for (let i = css.indexOf('{', start); i < css.length; i += 1) {
    if (css[i] === '{') depth += 1
    if (css[i] === '}' && (depth -= 1) === 0) return css.slice(css.indexOf('{', start) + 1, i)
  }
  throw new Error(`unclosed @media (${query})`)
}
function rule(block, selector) {
  const m = new RegExp(`(?:^|[}\\n])${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\{([^}]*)\\}`).exec(block)
  expect(m, `${selector} in the block`).not.toBeNull()
  return m[1]
}

describe('Checkbox row at a fine pointer (MD115)', () => {
  const fine = () => mediaBlock('pointer:fine')

  it('the row is 24px tall at least', () => {
    expect(rule(fine(), '.ef-check')).toContain('min-height:24px')
  })

  it('the label is 24px tall at least: its line (1.4em) plus the padding that fills the rest', () => {
    expect(rule(fine(), '.ef-check__label')).toContain('min-height:24px')
    expect(rule(fine(), '.ef-check__label')).toContain('padding-block:max(0px,calc((24px - 1.4em) / 2))')
    expect(css).toMatch(/\.ef-check__label\{[^}]*line-height:1\.4/)
  })

  it('the box hit area is 24px square (the centred ::before of the coarse rule, 12px each way), and the box sits centred in the 24px row', () => {
    expect(rule(fine(), '.ef-check__box::before')).toContain('inset:calc(50% - 12px)')
    expect(rule(fine(), '.ef-check__box')).toContain('margin-top:3px')
  })

  it('does not change the box size', () => {
    expect(rule(css, '.ef-check__box')).toMatch(/width:18px;height:18px/)
    expect(fine()).not.toMatch(/(?:^|[;{])(?:width|height|min-width):/)
  })

  it('keeps the 44px hit area at a coarse pointer', () => {
    const coarse = mediaBlock('pointer:coarse')
    expect(coarse).toContain('.ef-check__box::before{content:"";position:absolute;inset:calc(50% - var(--tap-min) / 2)}')
  })
})
