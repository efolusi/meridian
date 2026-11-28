import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { componentFiles, rulesOf } from './helpers/component-css.mjs'

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

// MD134: a raised card reads the elevated pair and keeps a transparent 1px border under the ring, because forced
// colours remove every box-shadow and the border is then the only edge.
const cssOf = (file) => /const CSS = `([\s\S]*?)`;/.exec(readFileSync(file, 'utf8'))[1]
const rule = (css, selector) => rulesOf(css).find((r) => r.selector === selector)?.body ?? ''

describe('Card elevated (MD134)', () => {
  const body = rule(cssOf('components/display/Card.jsx'), '.ef-card--elevated')

  it('reads --surface-elevated and --shadow-elevated', () => {
    expect(body).toContain('background:var(--surface-elevated)')
    expect(body).toContain('box-shadow:var(--shadow-elevated)')
  })

  it('keeps a 1px transparent border so forced colours still draw an edge', () => {
    expect(body).toContain('border:1px solid transparent')
  })

  it('no longer reads --shadow-sm or --surface-card', () => {
    expect(body).not.toContain('--shadow-sm')
    expect(body).not.toContain('--surface-card')
  })
})

describe('floating Sidebar panel (MD134)', () => {
  const body = rule(cssOf('components/navigation/Sidebar.jsx'), '.ef-sidebar[data-variant=floating] .ef-sidebar__panel')

  it('is a raised card: the elevated pair and a transparent border', () => {
    expect(body).toContain('background:var(--surface-elevated)')
    expect(body).toContain('box-shadow:var(--shadow-elevated)')
    expect(body).toContain('border:1px solid transparent')
  })
})

// Every component that reads --shadow-sm or --shadow-md, with the decision. A raised card takes the elevated pair;
// a control, a menu or a popover keeps its own shadow. A new file that reads either shadow fails here until it is named.
const KEEPS_ITS_SHADOW = {
  'components/ai/Citation.jsx': 'popover (the citation card opens over the page)',
  'components/ai/Conversation.jsx': 'floating jump button',
  'components/ai/MessageScroller.jsx': 'floating scroll button',
  'components/ai/ModelSelector.jsx': 'popover panel',
  'components/code/Console.jsx': 'floating jump button',
  'components/dates/TimePicker.jsx': 'popover panel',
  'components/display/Carousel.jsx': 'floating nav buttons',
  'components/forms/Combobox.jsx': 'popover list',
  'components/forms/Select.jsx': 'popover list',
  'components/forms/Switch.jsx': 'the thumb of a control',
  'components/navigation/NavigationMenu.jsx': 'menu panel and viewport',
  'components/navigation/SegmentedControl.jsx': 'the thumb of a control',
  'components/navigation/SkipLink.jsx': 'a link that appears over the page on focus',
  'components/overlay/ContextMenu.jsx': 'menu',
  'components/overlay/DropdownMenu.jsx': 'menu',
  'components/overlay/HoverCard.jsx': 'popover',
  'components/overlay/Popover.jsx': 'popover',
}
const RAISED_CARDS = ['components/display/Card.jsx', 'components/navigation/Sidebar.jsx']

describe('every --shadow-sm and --shadow-md is a decision (MD134)', () => {
  const readers = componentFiles().filter((f) => /var\(--shadow-(sm|md)\)/.test(readFileSync(f, 'utf8')))

  it('is a named keeper, or a raised card that moved to the elevated pair', () => {
    const unnamed = readers.filter((f) => !(f in KEEPS_ITS_SHADOW))
    // Card and Sidebar keep no --shadow-sm/-md on a card: the Sidebar still names none on its floating panel.
    expect(unnamed.filter((f) => !RAISED_CARDS.includes(f))).toEqual([])
    for (const f of RAISED_CARDS) {
      const body = rulesOf(readFileSync(f, 'utf8'), f).filter((r) => /elevated|floating/.test(r.selector) && /ef-card--elevated|__panel/.test(r.selector))
      for (const r of body) expect(r.body, `${f} ${r.selector}`).not.toMatch(/var\(--shadow-(sm|md)\)/)
    }
  })

  it('names no file that no longer reads one of them', () => {
    const stale = Object.keys(KEEPS_ITS_SHADOW).filter((f) => !readers.includes(f))
    expect(stale).toEqual([])
  })
})
