import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// MD109: one token for the accent coloured word of a heading or a script title. The products (sso web,
// efolusi.com, the toolips site) each remapped their own --accent-word, and two of them pointed it at
// brand-400 (#CE9C66) in dark instead of accent-edge (#CD8F69). Meridian now ships the one definition:
// --accent-word is an alias of --accent-edge, so the dark and both increased-contrast tables follow it.
// The alias sits on :root and on every [data-theme] element, so a themed subtree resolves its own
// --accent-edge and not the root's.
const base = readFileSync('tokens/base.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const theming = readFileSync('guidelines/theming.md', 'utf8')

describe('--accent-word', () => {
  it('is declared in tokens/base.css as var(--accent-edge)', () => {
    expect(base).toMatch(/--accent-word\s*:\s*var\(--accent-edge\)/)
  })

  it('is declared on :root and on [data-theme], so a themed subtree re-resolves it', () => {
    const rule = /([^{}]*)\{[^{}]*--accent-word\s*:\s*var\(--accent-edge\)[^{}]*\}/.exec(base)
    expect(rule, 'rule holding --accent-word').not.toBeNull()
    const selectors = rule[1].split(',').map((s) => s.trim())
    expect(selectors).toContain(':root')
    expect(selectors).toContain('[data-theme]')
  })

  it('points at accent-edge only: no hex, no brand ramp stop', () => {
    const values = [...base.matchAll(/--accent-word\s*:\s*([^;}]+)/g)].map((m) => m[1].trim())
    expect(values.length).toBeGreaterThan(0)
    for (const value of values) expect(value).toBe('var(--accent-edge)')
  })

  it('is documented in guidelines/theming.md', () => {
    expect(theming).toContain('--accent-word')
  })
})
