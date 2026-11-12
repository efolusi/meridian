import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (p) => readFileSync(p, 'utf8')

// The default radius scale, as tokens/spacing.css declares it (light :root).
function defaultRadii() {
  const css = read('tokens/spacing.css')
  const out = {}
  for (const [, name, px] of css.matchAll(/--(radius-(?:xs|sm|md|lg|xl)):(\d+)px/g)) {
    if (!(name in out)) out['--' + name] = Number(px)
  }
  return out
}

describe('theme customizer radius presets', () => {
  const src = read('site/ThemeCustomizer.jsx')
  const literal = src.slice(src.indexOf('const RADII = ') + 'const RADII = '.length, src.indexOf('];', src.indexOf('const RADII = ')) + 1)
  const RADII = new Function('return ' + literal)()
  const defaults = defaultRadii()

  it('reads the full default scale', () => {
    expect(Object.keys(defaults).sort()).toEqual(['--radius-lg', '--radius-md', '--radius-sm', '--radius-xl', '--radius-xs'])
  })

  it('Square zeroes every radius token', () => {
    const square = RADII.find((r) => r.id === 'square').vars
    for (const name of Object.keys(defaults)) expect(square[name], name).toBe('0px')
  })

  it('Soft is rounder than the default at every step', () => {
    const soft = RADII.find((r) => r.id === 'soft').vars
    for (const [name, px] of Object.entries(defaults)) {
      expect(soft[name], name).toBeDefined()
      expect(parseFloat(soft[name]), name).toBeGreaterThan(px)
    }
  })
})
