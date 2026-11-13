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
