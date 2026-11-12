import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const FONT_SIZES = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl']

// tailwind.preset.js is CommonJS inside a "type": "module" repo, which is why
// it ships as .cjs. Evaluate it the way a consuming tailwind.config.js does.
function loadPreset() {
  const module = { exports: {} }
  new Function('module', 'exports', 'require', readFileSync('tailwind.preset.js', 'utf8'))(module, module.exports, require)
  return module.exports.theme.extend
}

describe('Tailwind preset matches the token roles', () => {
  const preset = loadPreset()

  it('maps the type scale to fontSize, not to colors', () => {
    for (const size of FONT_SIZES) {
      expect(preset.colors, `text-${size} is a size, not a colour`).not.toHaveProperty(`text-${size}`)
      expect(preset.fontSize[size]).toBe(`var(--text-${size})`)
    }
  })

  it('exposes the fixed code, media and focus colours', () => {
    for (const name of ['code-ink', 'code-ink-muted', 'code-divider', 'media-backdrop', 'media-scrim', 'focus-ring-color']) {
      expect(preset.colors[name]).toBe(`var(--${name})`)
    }
  })
})

describe('tokens.json types', () => {
  const tokens = JSON.parse(readFileSync('tokens.json', 'utf8'))

  it('types the type scale as dimensions', () => {
    for (const size of FONT_SIZES) expect(tokens.text[size].$type).toBe('dimension')
    expect(tokens.text.primary.$type).toBe('color')
  })

  it('types the code, media and focus colours as colours', () => {
    expect(tokens.code.ink.$type).toBe('color')
    expect(tokens.media.backdrop.$type).toBe('color')
    expect(tokens.focus['ring-color'].$type).toBe('color')
    expect(tokens.focus.ring.$type).toBe('shadow')
  })
})

describe('forced colours keep a focus indicator', () => {
  // Every component draws focus with box-shadow: var(--focus-ring) after
  // outline: none. Forced-colours mode (Windows High Contrast) drops
  // box-shadow, so without this rule no control shows focus at all.
  const base = readFileSync('tokens/base.css', 'utf8')
  const block = base.match(/@media\s*\(forced-colors:\s*active\)\s*\{([\s\S]*?\})\s*\}/)

  it('draws a real outline on :focus-visible', () => {
    expect(block, 'tokens/base.css needs an @media (forced-colors: active) block').toBeTruthy()
    expect(block[1]).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px solid/)
  })

  it('sits outside @layer meridian, so it outranks the layered outline: none', () => {
    const before = base.slice(0, block.index)
    const depth = [...before].reduce((d, ch) => d + (ch === '{') - (ch === '}'), 0)
    expect(depth, 'the forced-colors block must be at top level').toBe(0)
  })
})
