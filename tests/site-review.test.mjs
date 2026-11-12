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

describe('public copy stays current', () => {
  const components = readdirSync('components', { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => readdirSync('components/' + d.name).filter((f) => f.endsWith('.jsx')))
  const docs = read('site/Docs.dc.html')

  it('every "all N" / "not all N" component claim uses the real count', () => {
    for (const file of ['site/Docs.dc.html', 'README.md']) {
      // The Docs changelog is history: its counts were true when written.
      const text = file === 'site/Docs.dc.html' ? docs.slice(0, docs.indexOf("id: 'changelog'")) : read(file)
      for (const [claim, n] of text.matchAll(/\b(?:all|seluruh)\s+(\d{2,3})\b(?!\s*(?:px|ms|%))/g)) {
        expect(Number(n), `${file}: "${claim}"`).toBe(components.length)
      }
    }
  })

  it('the Docs changelog shows an Unreleased section only when CHANGELOG.md has unreleased entries', () => {
    const changelog = read('CHANGELOG.md')
    const start = changelog.indexOf('## Unreleased') + '## Unreleased'.length
    const unreleased = changelog.slice(start, changelog.indexOf('\n## ', start))
    expect(docs.includes("h2('unreleased'")).toBe(/^\s*-\s/m.test(unreleased))
  })
})

describe('radius and icon docs match the tokens', () => {
  const defaults = defaultRadii()

  it('guidelines/brand.md states the current px for every radius token', () => {
    const brand = read('guidelines/brand.md')
    const line = brand.split('\n').find((l) => l.startsWith('- **Radii:**'))
    for (const [name, px] of Object.entries(defaults)) {
      expect(line, name).toMatch(new RegExp(`${px}px[^(]*\\(\`${name}\`\\)`))
    }
  })

  it('the corner radii card renders the tokens rather than hard-coded px', () => {
    const card = read('guidelines/spacing-radius.html')
    expect(card).not.toMatch(/border-radius:\d/)
    for (const name of Object.keys(defaults)) expect(card).toContain(`border-radius:var(${name})`)
  })

  it('guidelines/brand.md counts the icons that ship', () => {
    const icons = readdirSync('assets/icons').filter((f) => f.endsWith('.svg')).length
    expect(read('guidelines/brand.md')).toContain(`${icons} curated glyphs`)
  })
})

// Load a page's DCLogic class and call renderVals() without the runtime.
function pageVals(page) {
  const html = read('site/' + page)
  const start = html.indexOf('class Component extends DCLogic')
  const script = html.slice(start, html.indexOf('</script>', start))
  const Component = new Function('DCLogic', script + '\nreturn Component;')(class { setState() {} })
  return new Component().renderVals()
}

describe('Charts page demo props', () => {
  const reg = read('site/registry.js')
  const items = JSON.parse(reg.slice(reg.indexOf('GROUPS = ') + 9, reg.lastIndexOf(';'))).flatMap((g) => g.items)
  const iface = Object.fromEntries(items.map((it) => [it.name, it.props || []]))
  const vals = pageVals('Charts.dc.html')
  const cases = { barProps: 'BarChart', lineProps: 'LineChart', donutProps: 'DonutChart', sparkUp: 'Sparkline', sparkDown: 'Sparkline', sparkFlat: 'Sparkline' }

  it.each(Object.entries(cases))('%s only passes props %s declares', (key, comp) => {
    const known = new Set(iface[comp].map((p) => p.n))
    for (const prop of Object.keys(vals[key])) expect(known.has(prop), `${comp} has no "${prop}" prop`).toBe(true)
  })
})
