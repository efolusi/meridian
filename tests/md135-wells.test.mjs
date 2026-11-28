import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { componentFiles, rulesOf } from './helpers/component-css.mjs'

const cssOf = (file) => /const CSS = `([\s\S]*?)`;/.exec(readFileSync(file, 'utf8'))[1]

// MD135: a well (a --surface-sunken fill with no edge of its own) vanishes on the dark elevated surface (1.01:1), so
// inside a raised card it gets a --border-default edge (1.17:1). The rule is scoped to the elevated card, never a
// global border on every sunken element.
const WELLS = [
  '.ef-item[data-variant="muted"]',
  '.ef-bubble[data-variant="secondary"]>.ef-bubble__content',
  '.ef-badge--secondary',
  '.ef-empty__media[data-variant="icon"]',
  '.ef-attachment__media',
  '.ef-filetile__icon',
]
const FLOATING_WELLS = ['.ef-sidebar-menu-badge']

describe('a well inside an elevated card has an edge (MD135)', () => {
  const card = rulesOf(cssOf('components/display/Card.jsx'))
  const edge = card.find((r) => r.selector.startsWith('.ef-card--elevated :is('))

  it('has one descendant rule scoped to .ef-card--elevated that draws the --border-default edge', () => {
    expect(edge, 'a rule starting .ef-card--elevated :is(').toBeTruthy()
    expect(edge.body.replace(/\s/g, '')).toBe('border:1pxsolidvar(--border-default)')
  })

  it('lists every well of the library', () => {
    for (const w of WELLS) expect(edge.selector, w).toContain(w)
  })

  it('the floating Sidebar panel gives its count badge the same edge', () => {
    const rules = rulesOf(cssOf('components/navigation/Sidebar.jsx'))
    for (const w of FLOATING_WELLS) {
      const r = rules.find((x) => x.selector === `.ef-sidebar[data-variant=floating] ${w}`)
      expect(r?.body.replace(/\s/g, ''), w).toBe('border:1pxsolidvar(--border-default)')
    }
  })

  it('the wells exist as written: each listed selector is a --surface-sunken fill with no edge of its own', () => {
    const all = componentFiles().flatMap((f) => rulesOf(readFileSync(f, 'utf8'), f))
    for (const w of [...WELLS, ...FLOATING_WELLS]) {
      const own = all.filter((r) => r.selector === w)
      expect(own.length, w).toBeGreaterThan(0)
      expect(own.some((r) => /background:var\(--surface-sunken\)/.test(r.body)), w).toBe(true)
    }
  })
})

// Every resting --surface-sunken fill of the library is a well (edge added under an elevated card above) or has a
// reason it needs none. A new component that fills a block with --surface-sunken fails here until it is placed.
const STATE = /:hover|:focus|:active|:disabled|data-highlighted|data-state|data-selected|data-active|aria-current|--active|--on\b|--hi\b|--sel/
const NEEDS_NO_EDGE = {
  '.ef-genimg': 'own 1px --border-default edge',
  '.ef-toolcall__grid': 'own 1px --border-default edge',
  '.ef-toolcall__args': 'own 1px --border-default edge',
  '.ef-webprev__stage': 'own 1px --border-default edge',
  '.ef-copyfield__box': 'own 1px --border-strong edge',
  '.ef-item__media[data-variant="icon"]': 'own 1px --border-default edge',
  '.ef-avatar-count': 'own 2px --surface-card ring',
  '.ef-badge--default': 'own --border-strong edge',
  '.ef-input__el': 'form control: own --border-control edge (3:1)',
  '.ef-file-input': 'form control: own --border-control edge (3:1)',
  '.ef-native-select select': 'form control: own --border-control edge (3:1)',
  '.ef-number': 'form control: own --border-control edge (3:1)',
  '.ef-select-trigger': 'form control: own --border-control edge (3:1)',
  '.ef-textarea': 'form control: own --border-control edge (3:1)',
  '.ef-sidebar-input': 'form control: own --border-strong edge',
  '.ef-combobox__chip': 'a chip inside a field, which has its own edge',
  '.ef-sourcecard__thumb': 'an image; the fill shows only while it loads',
  '.ef-task__detail code': 'inline code: its text is the shape',
  '.ef-usage__track': 'a rail under a fill; the fill is the mark',
  '.ef-table__skel': 'a loading placeholder',
  '.ef-sidebar-skeleton': 'a loading placeholder',
  '.ef-drawer__handle': 'the drag handle of a drawer, which is --surface-card',
  '.ef-banner--neutral': 'a full-width bar with its own bottom edge',
}

describe('every resting --surface-sunken fill is placed (MD135)', () => {
  const fills = componentFiles().flatMap((f) => rulesOf(readFileSync(f, 'utf8'), f))
    .filter((r) => /(^|;)background:var\(--surface-sunken\)/.test(r.body) && !STATE.test(r.selector))
    .map((r) => r.selector)

  it('is a well, or named with the reason it needs no edge', () => {
    const placed = new Set([...WELLS, ...FLOATING_WELLS, ...Object.keys(NEEDS_NO_EDGE)])
    expect([...new Set(fills)].filter((s) => !placed.has(s))).toEqual([])
  })

  it('names no selector that no longer fills with --surface-sunken', () => {
    const set = new Set(fills)
    expect(Object.keys(NEEDS_NO_EDGE).filter((s) => !set.has(s))).toEqual([])
  })
})
