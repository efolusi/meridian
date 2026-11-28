import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// MD112: every language target is 24 px at least at a fine pointer and 44 px at a coarse pointer (WCAG 2.5.8, and the
// 44 px touch rule of the library). md is the --tap-min circle of the ThemeToggle; sm is --control-h-sm, which is 28 px
// at a fine pointer (24 px in compact density) and --tap-min at a coarse pointer. Measured in a browser:
// tests/fixtures/md112-language-switch.html.
const source = readFileSync('components/marketing/LanguageSwitch.jsx', 'utf8')
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

describe('LanguageSwitch targets (MD112)', () => {
  it('md is the 44px tap target at every pointer', () => {
    const r = rule(css, '.ef-language-switch__item')
    expect(r).toContain('min-width:var(--tap-min)')
    expect(r).toContain('min-height:var(--tap-min)')
  })

  it('sm is --control-h-sm square, never under 24px at a fine pointer', () => {
    const r = rule(css, '.ef-language-switch[data-size="sm"] .ef-language-switch__item')
    expect(r).toContain('min-width:var(--control-h-sm)')
    expect(r).toContain('min-height:var(--control-h-sm)')
    expect(readFileSync('tokens/spacing.css', 'utf8')).toMatch(/--control-h-sm:\s*28px/)
    expect(readFileSync('tokens/spacing.css', 'utf8')).toMatch(/\[data-density="compact"\][^}]*--control-h-sm:\s*24px/)
  })

  it('sm grows to 44px at a coarse pointer', () => {
    const coarse = mediaBlock('pointer:coarse')
    expect(coarse).toContain('.ef-language-switch[data-size="sm"] .ef-language-switch__item{min-width:var(--tap-min);min-height:var(--tap-min)}')
  })

  it('keeps a visible focus ring from the library and the colour transition from the motion tokens', () => {
    expect(css).toContain('.ef-language-switch__item:focus-visible{outline:2px solid transparent;box-shadow:var(--focus-ring)}')
    expect(css).toMatch(/transition:background var\(--dur-fast\) var\(--ease-enter\),color var\(--dur-fast\) var\(--ease-enter\)/)
    expect(css).toContain('@media (prefers-reduced-motion:reduce){.ef-language-switch__item{transition:none}}')
  })

  it('uses no literal colour', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/)
  })
})
