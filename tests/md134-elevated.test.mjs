import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// design-tokens v0.10.0 (DT23, MD134): a raised surface in dark is a lighter step plus a visible ring.
// This file holds the vendored tokens; the Card and the other raised cards are pinned further down.
const colors = readFileSync('tokens/colors.css', 'utf8')
const effects = readFileSync('tokens/effects.css', 'utf8')
const lock = JSON.parse(readFileSync('tokens/design-tokens.lock.json', 'utf8'))
const tokensJson = JSON.parse(readFileSync('tokens.json', 'utf8'))

const blocks = (text, opener) => {
  const out = []
  let at = text.indexOf(opener)
  while (at !== -1) {
    const open = text.indexOf('{', at)
    let depth = 1
    let i = open + 1
    while (depth && i < text.length) {
      depth += text[i] === '{' ? 1 : text[i] === '}' ? -1 : 0
      i += 1
    }
    out.push(text.slice(open + 1, i - 1))
    at = text.indexOf(opener, i)
  }
  return out
}
const decl = (block, name) => new RegExp(`${name}\\s*:\\s*([^;]+);`).exec(block)?.[1].trim()

describe('vendored design-tokens v0.10.0 (DT23)', () => {
  it('is pinned to a tag at v0.10.0 or newer', () => {
    const [major, minor] = lock.ref.replace(/^v/, '').split('.').map(Number)
    expect(major > 0 || minor >= 10).toBe(true)
  })

  it('--surface-elevated is the card in light and a lighter step in dark', () => {
    const light = blocks(colors, ':root, [data-theme="light"]')[0]
    expect(decl(light, '--surface-elevated')).toBe('var(--surface-card)')
    const dark = blocks(colors, '[data-theme="dark"]')[0]
    expect(decl(dark, '--surface-elevated')).toBe('#2E2721')
    expect(decl(dark, '--surface-card')).toBe('#26201B')
  })

  it('--shadow-elevated is a soft shadow in light and a ring, a lit top edge and a shadow in dark', () => {
    const light = blocks(effects, ':root, [data-theme="light"]')[0]
    expect(decl(light, '--shadow-elevated')).toBe('0 1px 2px rgba(46,41,34,.04),0 2px 8px rgba(46,41,34,.05)')
    const dark = blocks(effects, '[data-theme="dark"]')[0]
    expect(decl(dark, '--shadow-elevated')).toBe('0 0 0 1px #453C31,inset 0 1px 0 rgba(255,244,230,.05),0 8px 24px rgba(0,0,0,.45)')
  })

  it('increased contrast draws the ring in a 3:1 colour in both themes', () => {
    const more = blocks(effects, '@media (prefers-contrast: more)')
    const all = more.join('\n')
    expect(all).toContain('--shadow-elevated: 0 0 0 1px #948A74,')
    expect(all).toContain('--shadow-elevated: 0 0 0 1px #7C725E,')
  })

  it('tokens.json carries both tokens', () => {
    const text = JSON.stringify(tokensJson)
    expect(text).toContain('#2E2721')
    expect(text).toContain('#453C31')
  })
})
