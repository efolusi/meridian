import { readdirSync, readFileSync } from 'node:fs'
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

describe('docs site skip link', () => {
  const pages = readdirSync('site').filter((f) => f.endsWith('.dc.html'))

  it('covers all eight pages', () => expect(pages.length).toBe(8))

  it.each(pages)('%s puts the skip link before every other control and targets a focusable main', (page) => {
    const html = read('site/' + page)
    expect(html).toContain('<script src="./skip-link.js"></script>')
    const template = html.slice(html.indexOf('</helmet>'))
    const firstControl = template.match(/<(a|button|x-import|details|input|select)\b[^>]*>/)[0]
    expect(firstControl).toContain('class="site-skip"')
    expect(firstControl).toContain('href="#main"')
    expect(firstControl).toContain('data-lang-id=')
    const mains = template.match(/<main\b[^>]*>/g)
    expect(mains[0]).toMatch(/\bid="main"/)
    expect(mains[0]).toMatch(/\btabIndex="-1"/)
  })

  it('moves focus without changing the hash the pages route on', () => {
    const js = read('site/skip-link.js')
    expect(js).toContain('preventDefault()')
    expect(js).toContain('.focus(')
  })
})
