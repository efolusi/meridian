import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Every whole page in the example apps declares its language (WCAG 3.1.1) and
// carries a title (WCAG 2.4.2): screen readers pick a voice from `lang`, and
// the tab, history and bookmarks read the title.
const pages = [
  ...readdirSync('blocks').filter(f => f.endsWith('.html')).map(f => join('blocks', f)),
  ...readdirSync('showcases').map(d => join('showcases', d, 'index.html')),
  ...readdirSync('starters', { withFileTypes: true }).filter(d => d.isDirectory())
    .flatMap(d => readdirSync(join('starters', d.name)).filter(f => f.endsWith('.dc.html')).map(f => join('starters', d.name, f))),
  'hello.html', '404.html', 'index.html',
]

describe('apps: page semantics', () => {
  it('declares <html lang> on every page', () => {
    const missing = pages.filter(p => !/<html\b[^>]*\blang="[a-z]{2}/.test(readFileSync(p, 'utf8')))
    expect(missing).toEqual([])
  })

  it('gives every page a non-empty <title>', () => {
    const missing = pages.filter(p => !/<title>[^<\s][^<]*<\/title>/.test(readFileSync(p, 'utf8')))
    expect(missing).toEqual([])
  })
})

describe('apps: heading outline', () => {
  // A heading never skips a level on the way down (h1 then h3): screen-reader
  // users navigate by heading level and read the gap as missing content.
  it('never skips a heading level in a block or starter page', () => {
    const hits = []
    for (const p of pages.filter(p => /^(blocks|starters)\//.test(p))) {
      const levels = [...readFileSync(p, 'utf8').matchAll(/<h([1-6])\b/g)].map(m => Number(m[1]))
      levels.forEach((level, i) => { if (i && level > levels[i - 1] + 1) hits.push(`${p}: h${levels[i - 1]} -> h${level}`) })
    }
    expect(hits).toEqual([])
  })
})
