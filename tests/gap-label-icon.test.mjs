import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// One token for the gap between a label and its icon (MD59). Two tokens, both
// Meridian-level aliases in tokens/base.css, because tokens/spacing.css is vendored
// from design-tokens:
//   --gap-label-icon     8px, an inline text and icon pair
//   --gap-label-icon-sm  4px, the small controls: Badge, Button xs, Link
// Out of scope, and not listed here: stacked pairs (Tabbar item, Navigation menu link),
// full-row layouts (Accordion trigger, Sidenav item, Topnav) and container gaps
// (lists, the chips container, the tabs list).
const LABEL_ICON = 'var(--gap-label-icon)'
const LABEL_ICON_SM = 'var(--gap-label-icon-sm)'

const PAIRS = {
  [LABEL_ICON]: [
    '.ef-btn', '.ef-select-trigger', '.ef-dropdown-menu__item', '.ef-context-menu__item',
    '.ef-combobox__item', '.ef-tag', '.ef-suggestion', '.ef-tabs__tab', '.ef-seg__opt',
    '.ef-input-group__addon', '.ef-input-group__button', '.ef-breadcrumb__item',
    '.ef-pagination__link', '.ef-sidebar-menu-button', '.ef-sidebar-menu-sub-button',
    '.ef-command__input-wrap', '.ef-command__item', '.ef-status', '.ef-modelsel__btn',
    '.ef-navigation-menu__trigger', '.ef-agentrun__toggle',
  ],
  [LABEL_ICON_SM]: ['.ef-badge', '.ef-btn--xs', '.ef-link'],
}

// A rule is `selectors{declarations}`. Rules inside @media and @layer blocks match too,
// because a selector never contains a brace.
function rules(css) {
  const found = []
  for (const [, selectors, body] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    found.push({ selectors: selectors.split(',').map((s) => s.trim()), body })
  }
  return found
}

const gapsOf = (body) => [...body.matchAll(/(?:^|;)\s*((?:column-|row-)?gap)\s*:\s*([^;]*)/g)].map(([, prop, value]) => ({ prop, value: value.trim() }))

const componentsCss = readFileSync('registry/components.css', 'utf8')
const files = execFileSync('git', ['ls-files', 'components/*.jsx'], { encoding: 'utf8' }).split('\n').filter(Boolean)

describe('label and icon gap tokens', () => {
  it('are Meridian-level aliases of the space scale', () => {
    const base = readFileSync('tokens/base.css', 'utf8')
    expect(base).toMatch(/--gap-label-icon:\s*var\(--space-2\)/)
    expect(base).toMatch(/--gap-label-icon-sm:\s*var\(--space-1\)/)
  })

  for (const [token, selectors] of Object.entries(PAIRS)) {
    for (const selector of selectors) {
      it(`${selector} sets its gap to ${token}`, () => {
        const declared = rules(componentsCss)
          .filter((rule) => rule.selectors.includes(selector))
          .flatMap((rule) => gapsOf(rule.body))
          .filter((gap) => gap.prop === 'gap')
        expect(declared.length, `${selector} has no gap`).toBeGreaterThan(0)
        expect(declared.map((gap) => gap.value)).toEqual(declared.map(() => token))
      })
    }
  }

  it('no component CSS sets a literal px gap, except the 1px list rhythm of .ef-tree', () => {
    const raw = []
    for (const { selectors, body } of rules(componentsCss)) {
      for (const { prop, value } of gapsOf(body)) {
        if (/\d+px/.test(value) && !selectors.includes('.ef-tree')) raw.push(`${selectors.join(',')}{${prop}:${value}}`)
      }
    }
    expect(raw).toEqual([])
  })

  it('no component source sets a literal gap in an inline style', () => {
    const raw = []
    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      for (const [match] of source.matchAll(/style=\{\{[^}]*\b(?:column|row)?[gG]ap\s*:\s*['"`]?\d[^}]*/g)) raw.push(`${file}: ${match}`)
    }
    expect(raw).toEqual([])
  })
})
