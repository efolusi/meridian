import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path) => readFileSync(path, 'utf8')
const colors = read('tokens/colors.css')
const base = read('tokens/base.css')
const fonts = read('tokens/fonts.css')
const typography = read('tokens/typography.css')

function declarations(css) {
  return Object.fromEntries([...css.matchAll(/(--[\w-]+):([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}

/** Strip comments, then return the text left after removing every @layer meridian{...} block. */
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

describe('dark tokens follow the OS when no theme is set (DS-08)', () => {
  const explicit = colors.match(/\[data-theme="dark"\]\{([\s\S]*?)\n\}/)?.[1]
  const fallback = colors.match(
    /@media \(prefers-color-scheme:dark\)\{\n:root:not\(:where\(\[data-theme="light"\]\)\)\{([\s\S]*?)\n\}/,
  )?.[1]

  it('mirrors every [data-theme="dark"] token exactly', () => {
    expect(explicit).toBeTruthy()
    expect(fallback).toBeTruthy()
    expect(declarations(fallback)).toEqual(declarations(explicit))
  })

  it('stays at :root specificity so data-theme="light" and product :root remaps win', () => {
    expect(colors).toContain(':root:not(:where([data-theme="light"])){')
    expect(colors).not.toMatch(/:root:not\(\[data-theme/)
  })

  it('mirrors the component-level dark overrides too', () => {
    for (const path of ['components/display/Badge.jsx', 'components/feedback/Toast.jsx']) {
      const css = read(path)
      const explicitRules = css.match(/\[data-theme="dark"\] [^{\n]+\{/g) || []
      const fallbackRules = css.match(/:root:not\(:where\(\[data-theme="light"\]\)\) [^{]+\{/g) || []
      expect(explicitRules.length).toBeGreaterThan(0)
      expect(fallbackRules.length).toBe(explicitRules.length)
    }
    expect(read('components/data/Chart.jsx')).toContain('@media (prefers-color-scheme:dark){:root:not(:where([data-theme="light"]))')
  })
})

describe('form controls have a 3:1 boundary token (DS-01)', () => {
  it('defines --border-control in light and dark', () => {
    expect(declarations(colors)['--border-control']).toBeTruthy()
    expect(explicitDark()['--border-control']).toBeTruthy()
  })

  it('uses it on every form control edge instead of --border-strong', () => {
    const controls = {
      'components/forms/Input.jsx': ['.ef-input__el{', '.ef-file-input{'],
      'components/forms/Textarea.jsx': ['.ef-textarea{'],
      'components/forms/Select.jsx': ['.ef-select-trigger{'],
      'components/forms/NativeSelect.jsx': ['.ef-native-select select{'],
      'components/forms/Checkbox.jsx': ['.ef-check__box{'],
      'components/forms/Radio.jsx': ['.ef-radio__dot{'],
      'components/forms/Switch.jsx': ['.ef-switch{'],
      'components/forms/InputGroup.jsx': ['.ef-input-group{'],
      'components/forms/NumberInput.jsx': ['.ef-number{'],
      'components/forms/Combobox.jsx': ['.ef-combobox__chips{'],
      'components/forms/InputOTP.jsx': ['.ef-otp__slot{'],
      'components/dates/TimePicker.jsx': ['.ef-timepicker__input{'],
    }
    for (const [path, selectors] of Object.entries(controls)) {
      const css = read(path)
      for (const selector of selectors) {
        const start = css.indexOf(selector)
        const rule = css.slice(start, css.indexOf('}', start))
        expect(start, `${path} ${selector}`).toBeGreaterThan(-1)
        expect(rule, `${path} ${selector}`).toContain('var(--border-control)')
        expect(rule, `${path} ${selector}`).not.toContain('var(--border-strong)')
      }
    }
  })

  it('is measured by the contrast gate', () => {
    const script = read('scripts/check_contrast.py')
    expect(script).toContain('("--border-control", SURFACES, 3.0')
    expect(script).toContain('("--code-ink-faint", ["--surface-code"], 4.5')
  })
})

function explicitDark() {
  return declarations(colors.match(/\[data-theme="dark"\]\{([\s\S]*?)\n\}/)[1])
}

describe('base element rules (DS-02, DS-04, DS-10)', () => {
  it('leaves nothing outside @layer meridian, so Tailwind utilities can override element defaults', () => {
    expect(outsideMeridianLayer(base).trim()).toBe('')
  })

  it('keeps the anchor default at zero specificity so .ef-btn variants keep their foreground', () => {
    expect(base).toContain(':where(a){color:var(--text-link)')
    expect(base).not.toMatch(/(^|[}\s])a\s*\{/)
  })

  it('paints a real outline for focus in forced-colors mode', () => {
    expect(base).toMatch(/@media \(forced-colors:active\)\{\s*:focus-visible\{outline:2px solid Highlight!important/)
  })

  it('zeroes animation and transition delays under reduced motion', () => {
    const reduce = base.slice(base.indexOf('@media (prefers-reduced-motion:reduce)'))
    expect(reduce).toContain('animation-delay:0s!important')
    expect(reduce).toContain('transition-delay:0s!important')
  })
})

describe('font fallbacks (DS-07)', () => {
  it('ships metric-matched fallback faces and puts them right after the brand face', () => {
    for (const family of ['Figtree Fallback', 'Bricolage Grotesque Fallback']) {
      const face = fonts.match(new RegExp(`@font-face\\{font-family:'${family}';[^}]*\\}`))?.[0]
      expect(face, family).toBeTruthy()
      expect(face).toContain("local('Arial')")
      expect(face).toMatch(/size-adjust:\d+(\.\d+)?%/)
      expect(face).toMatch(/ascent-override:\d+(\.\d+)?%/)
      expect(face).toMatch(/descent-override:\d+(\.\d+)?%/)
    }
    expect(typography).toContain("--font-sans:'Figtree','Figtree Fallback',")
    expect(typography).toContain("--font-display:'Bricolage Grotesque','Bricolage Grotesque Fallback',")
  })
})

describe('coarse-pointer hit areas (DS-05)', () => {
  const coarse = (path) => {
    const css = read(path)
    const at = css.indexOf('@media (pointer:coarse){')
    expect(at, path).toBeGreaterThan(-1)
    return css.slice(at, css.indexOf('\n', at))
  }

  it('lifts every small control to --tap-min on touch', () => {
    expect(coarse('components/forms/Button.jsx')).toMatch(/\.ef-btn--xs\{height:var\(--tap-min\)\}/)
    expect(coarse('components/forms/Button.jsx')).toMatch(/\.ef-btn--icon-xs\{width:var\(--tap-min\);height:var\(--tap-min\)\}/)
    expect(coarse('components/forms/IconButton.jsx')).toContain('min-inline-size:var(--tap-min);min-block-size:var(--tap-min)')
    expect(coarse('components/navigation/Tabs.jsx')).toContain('min-block-size:var(--tap-min)')
    expect(coarse('components/forms/Radio.jsx')).toContain('.ef-radio{min-block-size:var(--tap-min);min-inline-size:var(--tap-min)')
    // Checkbox and Switch rows grow to the tap height, so their hit boxes never reach a stacked neighbour.
    expect(coarse('components/forms/Checkbox.jsx')).toContain('.ef-check{min-block-size:var(--tap-min)')
    expect(coarse('components/forms/Checkbox.jsx')).toContain('inset-block:calc(50% - var(--tap-min) / 2)')
    expect(coarse('components/forms/Switch.jsx')).toContain('.ef-switch-field{min-block-size:var(--tap-min)}')
    expect(coarse('components/forms/Switch.jsx')).toContain('inset-block:calc(50% - var(--tap-min) / 2)')
  })

  it('draws the switch at least 24px tall at every size', () => {
    const css = read('components/forms/Switch.jsx')
    for (const selector of ['.ef-switch{', '.ef-switch--sm{']) {
      const start = css.indexOf(selector)
      const height = Number(css.slice(start, css.indexOf('}', start)).match(/height:(\d+)px/)[1])
      expect(height, selector).toBeGreaterThanOrEqual(24)
    }
  })
})
