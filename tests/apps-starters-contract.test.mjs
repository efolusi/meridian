import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Contracts for the copyable starter journeys (starters/<journey>/*.dc.html).
const journeys = readdirSync('starters', { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
const pages = journeys.flatMap(j => readdirSync(join('starters', j))
  .filter(f => f.endsWith('.dc.html'))
  .map(f => ({ file: join('starters', j, f), text: readFileSync(join('starters', j, f), 'utf8') })))

describe('starters', () => {
  it('finds the starter pages', () => {
    expect(pages.length).toBeGreaterThan(20)
  })

  // The README contract: copy the folder, edit the one `base` line in
  // ds-base.js, and every page works. A page that reaches the DS root itself
  // (src="../../assets/…") breaks the moment the folder is copied out.
  // Links to a sibling journey (../auth-page/…) are deliberate and allowed.
  it('reaches the design-system root only through ds-base.js', () => {
    const hits = []
    for (const { file, text } of pages) {
      for (const m of text.matchAll(/(?:src|href)="(\.\.\/\.\.\/[^"]*)"|url\(\s*['"]?(\.\.\/\.\.\/[^)'"]*)/g)) {
        hits.push(`${file}: ${m[1] || m[2]}`)
      }
    }
    expect(hits).toEqual([])
  })

  // The dc runtime's first render reads the browser-parsed <x-dc> markup, and
  // the HTML parser foster-parents unknown elements out of table context: an
  // <sc-for> inside <tbody> lands before the <table>, its {{ row.field }}
  // bindings render empty and the runtime warns "never resolved".
  it('never puts sc-for / sc-if inside a table', () => {
    const hits = []
    for (const { file, text } of pages) {
      for (const table of text.matchAll(/<table\b[\s\S]*?<\/table>/g)) {
        const m = table[0].match(/<sc-(for|if)\b/)
        if (m) hits.push(`${file}: <sc-${m[1]}> inside <table>`)
      }
    }
    expect(hits).toEqual([])
  })
  // tokens/spacing.css raises controls to --tap-min (44px) on coarse pointers;
  // a starter's own page chrome (header, nav and footer links) must follow,
  // or a phone gets 18-35px targets four pixels apart.
  it('sizes its own header, nav and footer links for coarse pointers', () => {
    const missing = pages.filter(({ text }) => !/@media \(pointer:coarse\)\{[^}]*\b(header|nav)\b[^{]*a[^{]*\{[^}]*min-height/.test(text) && !/@media \(pointer:coarse\)\{[^}]*-nav a/.test(text)).map(p => p.file)
    expect(missing).toEqual([])
  })
})
