import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// MD134: the dark raised surface (lighter step + ring) must be in a visual-regression group, otherwise
// update-visual-baselines reports "baselines unchanged" while the change ships. g-display and g-navigation
// render these demos, so their baselines move when the elevated surface changes.
const display = readFileSync('site/examples/display.jsx', 'utf8')
const navigation = readFileSync('site/examples/navigation.jsx', 'utf8')
const demoBody = (src, name) => {
  const at = src.indexOf(`export function ${name}(`)
  if (at === -1) return ''
  const next = src.indexOf('\n// @demo', at)
  return src.slice(at, next === -1 ? undefined : next)
}

describe('the gallery renders the dark raised surface (MD134)', () => {
  it('g-display has an elevated Card that holds a sunken well', () => {
    const body = demoBody(display, 'CardElevatedDemo')
    expect(body).toMatch(/<Card\s+elevated[\s>]/)
    expect(body).toMatch(/<Item\s+variant="muted"/)
  })

  it('g-display has an elevated Card that holds a code block', () => {
    expect(demoBody(display, 'CardElevatedDemo')).toMatch(/<pre|<CodeBlock/)
  })

  it('g-navigation has the floating Sidebar panel', () => {
    const body = demoBody(navigation, 'SidebarFloatingDemo')
    expect(body).toMatch(/<Sidebar[^>]*variant="floating"/)
    expect(body).toMatch(/<SidebarMenuBadge/)
  })
})
