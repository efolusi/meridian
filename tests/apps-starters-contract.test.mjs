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
})
