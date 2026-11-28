import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// MD151: the secondary Button has a transparent fill, so its edge is its only boundary (WCAG 1.4.11 wants 3:1). It used
// --border-strong, a divider tone (1.5:1 in light and 1.63:1 in dark against the page). It now uses --border-control, the
// edge token of every form control (Input, Select, Textarea, Checkbox), which scripts/check_contrast.py gates at 3:1 on all
// five surfaces in light, dark and both increased-contrast tables. No new token: design-tokens already names the role.
// The measured pair, in a real browser, light and dark: scripts/check_button_secondary_edge.mjs.
const button = readFileSync('components/forms/Button.jsx', 'utf8')
const contrast = readFileSync('scripts/check_contrast.py', 'utf8')
const rule = /\.ef-btn--secondary\{([^}]*)\}/.exec(button)[1]

describe('the secondary Button edge (MD151)', () => {
  it('paints --border-control, not the divider tone --border-strong', () => {
    expect(rule).toContain('border-color:var(--border-control)')
    expect(rule).not.toContain('--border-strong')
  })

  it('keeps the transparent fill and the primary-ink label', () => {
    expect(rule).toContain('background:transparent')
    expect(rule).toContain('color:var(--text-primary)')
  })

  it('the contrast gate holds the edge at 3:1 on every surface, and names the Button', () => {
    expect(contrast).toMatch(/\("--border-control", SURFACES, 3\.0, "[^"]*secondary Button edge[^"]*"\)/)
  })

  it('the Button prompt says which edge it is', () => {
    const prompt = readFileSync('components/forms/Button.prompt.md', 'utf8')
    expect(prompt).toContain('--border-control')
  })
})
