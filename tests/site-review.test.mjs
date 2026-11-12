// @vitest-environment jsdom
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
function pageLogic(page) {
  const html = read('site/' + page)
  const start = html.indexOf('class Component extends DCLogic')
  const script = html.slice(start, html.indexOf('</script>', start))
  const Component = new Function('DCLogic', script + '\nreturn Component;')(class { setState() {} })
  return new Component()
}
const pageVals = (page) => pageLogic(page).renderVals()

// renderVals() with the site language forced, as i18n.js reports it.
function inLang(lang, fn) {
  const prev = window.EfLang
  window.EfLang = { get: () => lang }
  try { return fn() } finally { window.EfLang = prev }
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

describe('Indonesian copy on state-rendered pages', () => {
  it('Blocks translates every block description', () => {
    const en = inLang('en', () => pageVals('Blocks.dc.html')).blocks
    const id = inLang('id', () => pageVals('Blocks.dc.html')).blocks
    expect(id).toHaveLength(en.length)
    en.forEach((b, i) => expect(id[i].desc, b.title).not.toBe(b.desc))
  })

  it('Examples translates every kit title and description', () => {
    const logic = pageLogic('Examples.dc.html')
    expect(Object.keys(logic.KITS_ID).sort()).toEqual(logic.KITS.map((k) => k.id).sort())
    for (const k of logic.KITS) expect(logic.KITS_ID[k.id].desc, k.id).not.toBe(k.desc)
  })

  it('Charts translates every recipe title', () => {
    const en = inLang('en', () => pageVals('Charts.dc.html')).recipes
    const id = inLang('id', () => pageVals('Charts.dc.html')).recipes
    en.forEach((r, i) => expect(id[i].title, r.exp).not.toBe(r.title))
  })

  it('Colors translates every section title and note', () => {
    const logic = pageLogic('Colors.dc.html')
    const src = read('site/Colors.dc.html')
    const titles = [...src.matchAll(/\{ title: '([^']+)', note: '[^']*', tokens:/g)].map((m) => m[1])
    expect(titles.length).toBeGreaterThan(0)
    for (const title of titles) expect(logic.SECTIONS_ID[title], title).toBeDefined()
  })

  it('Docs and Components translate the table-of-contents label', () => {
    for (const page of ['Docs.dc.html', 'Components.dc.html']) {
      expect(read('site/' + page)).toContain('data-lang-id="Di halaman ini">On this page<')
    }
  })
})

describe('live language switching', () => {
  it('i18n.js announces a language change as a window event', () => {
    new Function(read('site/i18n.js'))()
    const seen = []
    const on = (e) => seen.push(e.detail.lang)
    window.addEventListener('ef:langchange', on)
    window.EfLang.set('id')
    window.EfLang.set('en')
    window.removeEventListener('ef:langchange', on)
    expect(seen).toEqual(['id', 'en'])
  })

  it('marks the language button with the language its label is written in', () => {
    document.body.innerHTML = '<button class="site-lang">ID</button>'
    new Function(read('site/i18n.js'))()
    const btn = document.querySelector('.site-lang')
    window.EfLang.set('en')
    expect(btn.getAttribute('lang')).toBe('id')
    window.EfLang.set('id')
    expect(btn.getAttribute('lang')).toBe('en')
    window.EfLang.set('en')
  })

  it('pages listen for the event rather than subscribing before i18n.js may exist', () => {
    const files = readdirSync('site').filter((f) => f.endsWith('.dc.html') || f.endsWith('.jsx'))
    for (const f of files) {
      const src = read('site/' + f)
      expect(src, f).not.toMatch(/EfLang\.onChange\(/)
      if (/langTick|EfLang\.get\(/.test(src)) expect(src, f).toContain("addEventListener('ef:langchange'")
    }
  })
})

describe('docs search', () => {
  const src = read('site/SiteSearch.jsx')
  it('describes itself as documentation search, not the Command default', () => {
    expect(src).toMatch(/description: '[^']+'/)
  })
  it('matches multi-word queries against PascalCase component names', () => {
    const spaced = new Function(src.match(/const spaced = ([^;]+);/)[0] + '; return spaced;')()
    expect(spaced('TimePicker')).toBe('time picker')
    expect(spaced('InputOTP')).toBe('input otp')
  })
})

describe('house copy rule: no em dashes in authored prose', () => {
  // Inline code quoting a literal string (e.g. the smoke page's document.title)
  // is exempt; everything a reader sees as prose is not.
  const prose = ['README.md', 'STYLEGUIDE.md', 'CONTRIBUTING.md', 'SUPPORT.md', 'CODE_OF_CONDUCT.md', 'THIRD_PARTY_NOTICES.md', 'llms.txt', 'skills/SKILL.md']
    .concat(readdirSync('guidelines').map((f) => 'guidelines/' + f))
    .concat(readdirSync('site').filter((f) => f.endsWith('.dc.html') || f.endsWith('.jsx')).map((f) => 'site/' + f))
  it.each(prose)('%s', (file) => {
    const text = read(file).replace(/`[^`\n]*`/g, '')
    const hits = text.split('\n').filter((line) => line.includes('—'))
    expect(hits, file).toEqual([])
  })
})

describe('house copy rule: specific calls to action, no buzzwords', () => {
  const site = readdirSync('site').filter((f) => f.endsWith('.dc.html')).map((f) => 'site/' + f)
  it.each(site)('%s has no template CTA label', (file) => {
    expect(read(file)).not.toMatch(/>(Get started|Learn more|Try now|Explore|Discover)</)
  })
  it.each(['README.md', 'guidelines/brand.md', 'skills/SKILL.md', 'llms.txt', ...site])('%s avoids R-16 buzzwords', (file) => {
    expect(read(file)).not.toMatch(/\b(seamless|powerful|effortless|revolutionary|cutting[- ]edge|next[- ]generation|world[- ]class)\b/i)
  })
})

describe('README inventory', () => {
  const readme = read('README.md')
  it('counts the blocks that ship', () => {
    const blocks = readdirSync('blocks').filter((f) => f.endsWith('.html')).length
    expect(readme).toContain(`\`blocks/\`: ${blocks} pre-composed sections`)
  })
  it.each(['navigation', 'feedback'])('lists every %s component', (group) => {
    const line = readme.split('\n').find((l) => l.startsWith(`- \`components/${group}/\``))
    const names = readdirSync('components/' + group).filter((f) => f.endsWith('.jsx')).map((f) => f.replace('.jsx', '').replace(/^Breadcrumbs$/, 'Breadcrumb'))
    for (const n of names) expect(line, n).toMatch(new RegExp(`\\b${n === 'Toast' ? 'Toast' : n}\\b`))
  })
})

describe('touch targets and frame tabs', () => {
  const css = read('site/site.css')
  const coarse = [...css.matchAll(/@media \(pointer: coarse\) \{([\s\S]*?)\n\}/g)].map((m) => m[1]).join('\n')
  it.each(['.site-frame-tab', '.side-drawer__panel button', 'footer a', '.site-top > a:first-child', '.hero-pad > a', '.site-spec-link'])(
    'coarse pointers give %s the 44px minimum', (sel) => expect(coarse).toContain(sel),
  )
  it.each(['site/Components.dc.html', 'site/Charts.dc.html', 'site/ExampleFrame.jsx', 'site/BlockFrame.jsx'])(
    '%s marks its Preview/Code tabs with a class and aria-pressed', (file) => {
      const src = read(file)
      expect(src).not.toMatch(/\('button', \{ style: tabStyle\(/)
      expect(src).toMatch(/className: 'site-frame-tab', 'aria-pressed': tab === 'preview'/)
    },
  )
})
