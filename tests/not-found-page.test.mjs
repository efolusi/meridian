import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// MD110: the root 404.html is the shared not-found page that products copy. A static
// host serves it under a strict CSP, so it carries no inline script and no inline style.
// MD148: it loads the theme script (browser/theme-init.js, a file of its own, allowed by 'self')
// in the head before the stylesheet, so a saved efolusi-theme is applied before the first paint.
const page = readFileSync('404.html', 'utf8')
const base = readFileSync('tokens/base.css', 'utf8')
const guide = readFileSync('guidelines/frameworks.md', 'utf8')

describe('404.html, the shared not-found page', () => {
  it('has nothing a strict CSP blocks: no inline script, no style element, no style attribute', () => {
    expect(page).not.toMatch(/<script(?![^>]*\ssrc=)[^>]*>/i)
    expect(page).not.toMatch(/<style\b/i)
    expect(page).not.toMatch(/\sstyle\s*=/i)
  })

  it('loads the theme script from its own origin, in the head and before the stylesheet (MD148)', () => {
    expect(page.match(/<script\b[^>]*>/g)).toEqual(['<script src="/browser/theme-init.js">'])
    const head = page.slice(page.indexOf('<head>'), page.indexOf('</head>'))
    expect(head.indexOf('<script src="/browser/theme-init.js">')).toBeGreaterThan(-1)
    expect(head.indexOf('<script src="/browser/theme-init.js">')).toBeLessThan(head.indexOf('<link rel="stylesheet"'))
  })

  it('loads one stylesheet and no framework', () => {
    expect(page.match(/<link rel="stylesheet"[^>]*>/g)).toEqual(['<link rel="stylesheet" href="/styles.css">'])
  })

  it('says the same thing in English and in Indonesian, each section with its own lang and one link home', () => {
    for (const lang of ['en', 'id']) {
      const section = page.match(new RegExp(`<section[^>]*lang="${lang}"[\\s\\S]*?</section>`))
      expect(section, lang).not.toBeNull()
      expect(section[0].match(/<a [^>]*href="\/"/g), lang).toHaveLength(1)
    }
    expect(page.match(/<h1\b/g)).toHaveLength(1)
  })

  it('shows a mark that reads in both themes, with no alt text of its own', () => {
    expect(page).toContain('src="/assets/favicon.svg" alt=""')
  })

  it('has every ef-notfound class it uses in tokens/base.css', () => {
    const used = [...new Set(page.match(/ef-notfound[\w-]*/g))]
    expect(used.length).toBeGreaterThan(0)
    for (const cls of used) expect(base, cls).toContain(`.${cls}`)
  })
})

// MD149: from 880px the two languages sit side by side, and one language kept (the other section deleted) sits in the middle.
// A fixed two-column grid put a single section in the left half. One column per section, as many as there are sections, does not.
// Measured in a real browser, 375 to 1920px: scripts/check_not_found.mjs.
describe('the language grid of the 404 page (MD149)', () => {
  const wide = base.slice(base.indexOf('@media (min-width:880px){.ef-notfound__langs'))
  it('is one column per section from 880px, not two fixed columns', () => {
    expect(wide).toMatch(/\.ef-notfound__langs\{[^}]*grid-auto-flow:column;grid-auto-columns:1fr/)
    expect(wide).not.toMatch(/\.ef-notfound__langs\{[^}]*grid-template-columns/)
  })
  it('keeps the divider between two sections only', () => {
    expect(wide).toContain('.ef-notfound__lang+.ef-notfound__lang{padding-block-start:0;padding-inline-start:var(--space-8);border-block-start:0;border-inline-start:1px solid var(--border-default)}')
  })
})

describe('the deploy rule for the 404 page', () => {
  it('is written in the framework guide: status 404, the CSP header, the Workers setting and the check', () => {
    const section = guide.slice(guide.indexOf('## A 404 page on a static site'), guide.indexOf('## Dark mode and density, everywhere'))
    expect(section).toContain('"not_found_handling": "404-page"')
    expect(section).toContain('status `404`')
    expect(section).toContain('content-security-policy')
    expect(section).toContain('curl -si')
  })
})
