import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { openingTags, rulesOf } from './helpers/component-css.mjs'

// MD132 (owner, 2026-11-28): the theme toggle has no border at rest on any product; the hover fill is its only
// resting-state styling, inside @media (hover: hover) so touch never keeps it. The three header controls (the
// ThemeToggle, the LanguageSwitch and the SiteHeader menu button) share one size token, --control-h-md (36 px with a mouse, 44 px coarse),
// one pill shape and the same hover and pressed fills.
const cssOf = (file) => /const CSS = `([\s\S]*?)`;/.exec(readFileSync(file, 'utf8'))[1]
const toggleSource = readFileSync('components/marketing/ThemeToggle.jsx', 'utf8')
const toggleCss = cssOf('components/marketing/ThemeToggle.jsx')
const langCss = cssOf('components/marketing/LanguageSwitch.jsx')
const headerCss = cssOf('components/marketing/SiteHeader.jsx')
const base = readFileSync('tokens/base.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const spacing = readFileSync('tokens/spacing.css', 'utf8')
const rule = (css, selector) => rulesOf(css).find((r) => r.selector === selector)?.body ?? ''
const hoverBlocks = (css) => {
  const blocks = []
  let i = 0
  for (;;) {
    const start = css.indexOf('@media (hover:hover){', i)
    if (start === -1) break
    let depth = 0
    let j = css.indexOf('{', start)
    const open = j
    for (; j < css.length; j += 1) {
      if (css[j] === '{') depth += 1
      if (css[j] === '}' && (depth -= 1) === 0) break
    }
    blocks.push(css.slice(open + 1, j))
    i = j + 1
  }
  return blocks
}
const hoverBlock = (css) => {
  const blocks = hoverBlocks(css)
  expect(blocks.length, '@media (hover:hover)').toBeGreaterThan(0)
  return blocks.join('\n')
}
const outsideHover = (css) => hoverBlocks(css).reduce((rest, block) => rest.replace(`@media (hover:hover){${block}}`, ''), css)

describe('one size for the header controls: --control-h-md', () => {
  it('is 36 px at a fine pointer and --tap-min (44 px) at a coarse pointer, from the vendored spacing tokens', () => {
    expect(spacing).toMatch(/--control-h-md:\s*36px/)
    expect(spacing).toMatch(/@media \(pointer: coarse\)[\s\S]*--control-h-md:\s*var\(--tap-min\)/)
  })

  it('sizes the toggle, the language item and the menu button', () => {
    expect(rule(toggleCss, '.ef-theme-toggle')).toMatch(/width:var\(--control-h-md\)/)
    expect(rule(toggleCss, '.ef-theme-toggle')).toMatch(/height:var\(--control-h-md\)/)
    expect(rule(langCss, '.ef-language-switch__item')).toMatch(/min-width:var\(--control-h-md\)/)
    expect(rule(langCss, '.ef-language-switch__item')).toMatch(/min-height:var\(--control-h-md\)/)
    expect(rule(headerCss, '.ef-site-header__menu')).toMatch(/width:var\(--control-h-md\)/)
    expect(rule(headerCss, '.ef-site-header__menu')).toMatch(/height:var\(--control-h-md\)/)
  })

  it('gives all three the same pill shape, no border and a transparent background at rest', () => {
    const toggle = rule(toggleCss, '.ef-theme-toggle')
    const menu = rule(headerCss, '.ef-site-header__menu')
    for (const body of [toggle, menu]) {
      expect(body).toContain('border-radius:var(--radius-full)')
      expect(body).toMatch(/(^|;)border:0(;|$)/)
      expect(body).toMatch(/background:transparent/)
    }
    expect(rule(langCss, '.ef-language-switch__item')).toContain('border-radius:var(--radius-full)')
  })
})

describe('the theme toggle at rest', () => {
  it('draws no border, ring or glass: border:0, a transparent background, no ef-glass class (its 1px border leaked through)', () => {
    const body = rule(toggleCss, '.ef-theme-toggle')
    expect(body).toMatch(/(^|;)border:0(;|$)/)
    expect(body).toMatch(/background:transparent/)
    expect(body).not.toMatch(/box-shadow/)
    expect(toggleSource).not.toMatch(/ef-glass/)
  })

  it('fills only on hover, and only where a pointer can hover', () => {
    expect(outsideHover(toggleCss)).not.toMatch(/\.ef-theme-toggle:hover/)
    expect(hoverBlock(toggleCss)).toMatch(/\.ef-theme-toggle:hover\{background:var\(--surface-sunken\)/)
  })

  it('shows the pressed fill and the focus ring', () => {
    expect(rule(toggleCss, '.ef-theme-toggle:active')).toContain('background:var(--state-pressed)')
    expect(rule(toggleCss, '.ef-theme-toggle:focus-visible')).toContain('box-shadow:var(--focus-ring)')
  })
})

describe('the same hover and pressed fills on all three', () => {
  it('LanguageSwitch fills on hover inside (hover: hover), and shows the pressed fill', () => {
    expect(outsideHover(langCss)).not.toMatch(/__item:hover/)
    expect(hoverBlock(langCss)).toMatch(/a\.ef-language-switch__item:hover\{background:var\(--surface-sunken\)/)
    expect(rule(langCss, 'a.ef-language-switch__item:active')).toContain('background:var(--state-pressed)')
  })

  it('the SiteHeader menu button fills on hover inside (hover: hover), and shows the pressed fill', () => {
    expect(outsideHover(headerCss)).not.toMatch(/__menu:hover/)
    expect(hoverBlock(headerCss)).toMatch(/\.ef-site-header__menu:hover\{background:var\(--surface-sunken\)/)
    expect(rule(headerCss, '.ef-site-header__menu:active')).toContain('background:var(--state-pressed)')
  })
})

// The sweep (chief, 2026-11-28): the ThemeToggle drew a border on pay and sso because the library never said
// `border:0` and those products have no button reset, so the browser's default button border leaked through.
// Every button the library renders names its own border and background in its base rule; nothing relies on a
// product's reset. A class that has no base rule of its own (a modifier, a class another component styles) is
// checked where its base rule lives.
const allowed = {
  // 'components/x/Y.jsx .ef-class': 'reason',
}

describe('no button relies on a product reset for its border or background', () => {
  const files = execFileSync('git', ['ls-files', '-z', 'components'], { encoding: 'utf8' }).split('\0').filter((f) => f.endsWith('.jsx'))
  const cssBlocks = (text) => [...text.matchAll(/(?:const|let)\s+\w*CSS\w*\s*=\s*`([\s\S]*?)`/g)].map((m) => m[1]).join('\n')
  const CLASS = /(?<![\w-])(ef-[a-z0-9]+(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?)(?![\w-])/g
  const found = []
  let checked = 0
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    const rules = rulesOf(cssBlocks(text))
    // A button, a summary, or any element that says role="button". Its classes together must give it a border and a background.
    const tags = [...openingTags(text, 'button'), ...openingTags(text, 'summary')]
    for (const name of ['div', 'span', 'a', 'li']) tags.push(...openingTags(text, name).filter((tag) => /role="button"/.test(tag)))
    for (const tag of tags) {
      const classes = [...new Set([...tag.matchAll(CLASS)].map((m) => m[1]))]
      const own = classes.flatMap((cls) => rules.filter((r) => r.selector === `.${cls}`))
      // No rule of its own in this file: the classes belong to a component whose file declares them (Button, IconButton).
      if (!own.length) continue
      checked += 1
      const body = own.map((r) => r.body).join(';')
      const border = /(^|;)\s*border(-width|-style)?\s*:/.test(body) || /all:\s*unset/.test(body)
      const background = /(^|;)\s*background(-color)?\s*:/.test(body) || /all:\s*unset/.test(body)
      const key = `${file} ${classes.join(' ')}`
      if ((!border || !background) && !(key in allowed)) found.push(`${key}: ${!border ? 'no border' : ''}${!border && !background ? ', ' : ''}${!background ? 'no background' : ''}`)
    }
  }

  it('checks the buttons it should (the sweep found them)', () => {
    expect(checked).toBeGreaterThan(40)
  })

  it('every button declares its border and its background in the rules of its own classes', () => {
    expect(found).toEqual([])
  })

  it('every allow-list entry has a reason', () => {
    for (const [key, reason] of Object.entries(allowed)) expect(reason.length, key).toBeGreaterThan(10)
  })
})

// The hover sweep (chief, 2026-11-28): a :hover rule outside @media (hover: hover) sticks after a tap on a touch
// screen. Every :hover rule of the library sits inside that query, except these, each with its reason. The five hover
// reveals (message actions, image actions, env row buttons, sort arrow, sidebar action) moved inside it in batch C2:
// they are shown at rest where nothing hovers (tests/hover-reveal-touch.test.mjs).
const hoverAllowed = {
  'components/forms/Button.jsx .ef-btn--primary[data-loading]:is(:hover,:active)': 'resets the primary fill while loading, for hover and for press; it undoes a fill, it adds none',
}

const withoutHoverQueries = outsideHover

describe('no :hover rule of a component sits outside @media (hover: hover)', () => {
  const files = execFileSync('git', ['ls-files', '-z', 'components'], { encoding: 'utf8' }).split('\0').filter((f) => f.endsWith('.jsx'))
  const found = []
  let queries = 0
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    for (const m of text.matchAll(/(?:const|let)\s+\w*CSS\w*\s*=\s*`([\s\S]*?)`/g)) {
      queries += (m[1].match(/@media \(hover:hover\)\{/g) ?? []).length
      for (const rule of rulesOf(withoutHoverQueries(m[1]))) {
        for (const sel of rule.selector.split(/,(?![^(]*\))/)) {
          if (sel.includes(':hover')) found.push(`${file} ${sel.trim()}`)
        }
      }
    }
  }

  it('the sweep wrapped the rules (it did not just skip the files)', () => {
    expect(queries).toBeGreaterThan(80)
  })

  it('every :hover selector outside the query is on the allow-list', () => {
    expect(found.filter((key) => !(key in hoverAllowed))).toEqual([])
  })

  it('every allow-list entry is still needed and has a reason', () => {
    for (const [key, reason] of Object.entries(hoverAllowed)) {
      expect(found, key).toContain(key)
      expect(reason.length, key).toBeGreaterThan(20)
    }
  })
})

describe('the guideline and the CHANGELOG say it (MD132)', () => {
  const brand = readFileSync('guidelines/brand.md', 'utf8')
  const changelog = readFileSync('CHANGELOG.md', 'utf8')
  it('guidelines/brand.md: the theme toggle has no border at rest, hover fill only; hover fills sit in (hover: hover)', () => {
    expect(brand).toContain('The theme toggle has no border at rest and no glass: hover fill only, on every product.')
    expect(brand).toContain('every hover fill sits inside `@media (hover: hover)`')
    expect(brand).toContain('`--control-h-md`')
  })
  it('the CHANGELOG has a VISIBLE CHANGE bullet that names the marketing baselines that move', () => {
    expect(changelog).toMatch(/theme toggle has no border at rest[^\n]*VISIBLE CHANGE/)
    expect(changelog).toContain('`g-marketing-light`, `g-marketing-dark`, `g-marketing-coarse-light` and `g-marketing-compact-light`')
  })
})
