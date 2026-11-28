import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// MD147: a hero pair of buttons that stacks at phone width has ONE width, the wider one. A flex row that wraps gives each
// button its own width (seen on the komando site at 375 px: 164 and 194 px), so the stacked pair looks uneven. Below the
// stack breakpoint the actions are one grid column as wide as the widest button, and every button stretches to it.
// Measured in a real browser, English and Indonesian labels, light and dark, at 375 px: scripts/check_hero_pair.mjs.
const source = readFileSync('components/marketing/Hero.jsx', 'utf8')
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

describe('Hero actions pair (MD147)', () => {
  const stacked = mediaBlock('max-width:640px')

  it('stacks into one grid column as wide as the widest button', () => {
    expect(stacked).toMatch(/\.ef-hero__actions\{[^}]*display:grid/)
    expect(stacked).toMatch(/\.ef-hero__actions\{[^}]*grid-template-columns:minmax\(0,max-content\)/)
  })

  it('keeps the column centred, and at the start for align="start"', () => {
    expect(stacked).toMatch(/\.ef-hero__actions\{[^}]*justify-content:center/)
    expect(stacked).toMatch(/\.ef-hero\[data-align="start"\] \.ef-hero__actions\{[^}]*justify-content:start/)
  })

  it('leaves the row layout above the breakpoint as it was: a wrapping flex row', () => {
    expect(css).toMatch(/\.ef-hero__actions\{display:flex;flex-wrap:wrap;gap:var\(--space-3\)/)
  })

  it('is written in the Hero prompt, so a front deletes its own pair CSS', () => {
    const prompt = readFileSync('components/marketing/Hero.prompt.md', 'utf8')
    expect(prompt).toContain('one width')
    expect(prompt).toContain('widest')
  })
})
