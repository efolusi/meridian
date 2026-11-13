import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Ported from PR #66 (DS-04, DS-07, DS-08, DS-10). DS-01, DS-05 and DS-09
// already shipped differently in 1.22.0 and are not repeated here.
const read = (path) => readFileSync(path, 'utf8')
const colors = read('tokens/colors.css')
const base = read('tokens/base.css')
const fonts = read('tokens/fonts.css')
const typography = read('tokens/typography.css')

const AUTO = ':root:not(:where([data-theme="light"]))'

function declarations(css) {
  return Object.fromEntries([...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[\w-]+|color-scheme):([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}

/** Strip comments, then return what is left after removing every @layer meridian{...} block. */
function outsideMeridianLayer(css) {
  let text = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const start = text.indexOf('@layer meridian{')
  if (start === -1) return text
  let depth = 0
  for (let i = text.indexOf('{', start); i < text.length; i++) {
    if (text[i] === '{') depth++
    if (text[i] === '}' && --depth === 0) return outsideMeridianLayer(text.slice(0, start) + text.slice(i + 1))
  }
  throw new Error('unbalanced @layer meridian block')
}

/** Every `[data-theme="dark"] <selector>{body}` rule, keyed by selector, with its body. */
function explicitDarkRules(css) {
  return Object.fromEntries([...css.matchAll(/\[data-theme="dark"\] ([^{\n]+)\{([^}]*)\}/g)].map((m) => [m[1].trim(), m[2]]))
}
function autoDarkRules(css) {
  const media = css.match(/@media \(prefers-color-scheme:dark\)\{([^\n]*)\}/)?.[1] ?? ''
  const prefix = AUTO.replace(/[()[\]:"=]/g, '\\$&')
  return Object.fromEntries([...media.matchAll(new RegExp(`${prefix} ([^{]+)\\{([^}]*)\\}`, 'g'))].map((m) => [m[1].trim(), m[2]]))
}

describe('dark tokens follow the OS when no theme is set (DS-08)', () => {
  const explicit = colors.match(/\[data-theme="dark"\]\{([\s\S]*?)\n\}/)?.[1]
  const auto = colors.match(/@media \(prefers-color-scheme:dark\)\{\n:root:not\(:where\(\[data-theme="light"\]\)\)\{([\s\S]*?)\n\}/)?.[1]

  it('mirrors every [data-theme="dark"] declaration exactly, color-scheme included', () => {
    expect(explicit).toBeTruthy()
    expect(auto, 'tokens/colors.css needs the prefers-color-scheme block').toBeTruthy()
    expect(declarations(auto)).toEqual(declarations(explicit))
    expect(declarations(auto)['color-scheme']).toBe('dark')
  })

  it('mirrors the dark ::selection colours', () => {
    const rule = colors.match(/\[data-theme="dark"\] ::selection\{([^}]*)\}/)[1]
    expect(colors).toContain(`${AUTO} ::selection{${rule}}`)
  })

  it('stays at :root specificity, so data-theme="light" opts out and a product :root remap still wins', () => {
    expect(colors).toContain(`${AUTO}{`)
    expect(colors).not.toMatch(/:root:not\(\[data-theme/)
  })

  for (const path of ['components/display/Badge.jsx', 'components/feedback/Toast.jsx']) {
    it(`mirrors the component dark rules in ${path}`, () => {
      const explicitRules = explicitDarkRules(read(path))
      expect(Object.keys(explicitRules).length).toBeGreaterThan(0)
      expect(autoDarkRules(read(path))).toEqual(explicitRules)
    })
  }

  it('gives Chart an OS-dark colour block', () => {
    expect(read('components/data/Chart.jsx')).toContain(`@media (prefers-color-scheme:dark){${AUTO} [data-chart=`)
  })

  it('leaves no other component with a [data-theme="dark"] rule and no OS-dark mirror', () => {
    const files = execFileSync('git', ['grep', '-l', '\\[data-theme="dark"\\]', '--', 'components'], { encoding: 'utf8' }).trim().split('\n')
    for (const file of files) expect(read(file), file).toContain('prefers-color-scheme:dark')
  })
})

describe('base element rules (DS-04, DS-10)', () => {
  it('puts everything inside @layer meridian except the forced-colors outline', () => {
    const outside = outsideMeridianLayer(base).trim()
    expect(outside).toMatch(/^@media \(forced-colors:active\)\{:focus-visible\{outline:2px solid Highlight;outline-offset:2px\}\}$/)
  })

  it('keeps the anchor default at zero specificity so .ef-btn variants keep their foreground', () => {
    expect(base).toContain(':where(a){color:var(--text-link)')
    expect(base).not.toMatch(/(^|[}\s])a\s*\{/)
  })

  it('zeroes animation and transition delays under reduced motion', () => {
    const reduce = base.slice(base.indexOf('@media (prefers-reduced-motion:reduce)'))
    expect(reduce).toContain('animation-delay:0s!important')
    expect(reduce).toContain('transition-delay:0s!important')
  })
})

describe('font fallbacks (DS-07)', () => {
  it('ships metric-matched fallback faces and lists each right after its brand face', () => {
    for (const family of ['Figtree Fallback', 'Bricolage Grotesque Fallback']) {
      const face = fonts.match(new RegExp(`@font-face\\{font-family:'${family}';[^}]*\\}`))?.[0]
      expect(face, family).toBeTruthy()
      // Figtree (body) matches Arial Regular; Bricolage (headings) matches Arial Bold.
      expect(face).toMatch(/local\('Arial( Bold)?'\)/)
      for (const descriptor of ['size-adjust', 'ascent-override', 'descent-override', 'line-gap-override']) {
        expect(face, `${family} ${descriptor}`).toMatch(new RegExp(`${descriptor}:\\d+(\\.\\d+)?%`))
      }
    }
    expect(typography).toContain("--font-sans:'Figtree','Figtree Fallback',")
    expect(typography).toContain("--font-display:'Bricolage Grotesque','Bricolage Grotesque Fallback',")
  })

  it('documents the preload in the frameworks guide', () => {
    const guide = read('guidelines/frameworks.md')
    expect(guide).toMatch(/rel="preload"[^>]*Figtree-Variable\.woff2[^>]*crossorigin/)
    expect(guide).toContain('Figtree Fallback')
  })
})
