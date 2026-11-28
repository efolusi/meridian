import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// MD111: the legal links are 24 px at least at a fine pointer and 44 px at a coarse pointer (WCAG 2.5.8 and the 44 px
// touch rule). They use --control-h-sm: 28 px at a fine pointer, 24 px in compact density, --tap-min at a coarse
// pointer (tokens/spacing.css). Measured in a browser: tests/fixtures/md111-site-footer-legal.html.
const source = readFileSync('components/marketing/SiteFooter.jsx', 'utf8')
const css = /const CSS = `([\s\S]*?)`;/.exec(source)[1]
const tokens = readFileSync('tokens/spacing.css', 'utf8')

describe('SiteFooter legal links (MD111)', () => {
  it('are --control-h-sm tall at least', () => {
    expect(css).toMatch(/\.ef-site-footer__legal-link\{[^}]*min-height:var\(--control-h-sm\)/)
  })

  it('are --control-h-sm wide at least, so a short word such as "Status" is a target of that size too', () => {
    expect(css).toMatch(/\.ef-site-footer__legal-link\{[^}]*min-width:var\(--control-h-sm\)/)
  })

  it('--control-h-sm is 28px at a fine pointer, 24px in compact density and --tap-min (44px) at a coarse pointer', () => {
    expect(tokens).toMatch(/--control-h-sm:\s*28px/)
    expect(tokens).toMatch(/\[data-density="compact"\][^}]*--control-h-sm:\s*24px/)
    expect(tokens).toMatch(/@media \(pointer: coarse\)\s*\{[^}]*--control-h-sm:\s*var\(--tap-min\)/)
    expect(tokens).toMatch(/--tap-min:\s*44px/)
  })

  it('have the library focus ring', () => {
    expect(css).toMatch(/\.ef-site-footer__legal-link:focus-visible[^{]*\{[^}]*box-shadow:var\(--focus-ring\)/)
  })

  it('use no literal colour', () => {
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/)
  })
})
