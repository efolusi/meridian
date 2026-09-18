import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const devNginx = readFileSync('nginx/dev-meridian.efolusi.com.conf', 'utf8')
const prodNginx = readFileSync('nginx/meridian.efolusi.com.conf', 'utf8')
const robots = readFileSync('robots.txt', 'utf8')
const sitemap = readFileSync('sitemap.xml', 'utf8')

const SITE_PAGES = [
  'site/Blocks.dc.html',
  'site/Charts.dc.html',
  'site/Colors.dc.html',
  'site/Components.dc.html',
  'site/Docs.dc.html',
  'site/DsSite.dc.html',
  'site/Examples.dc.html',
  'site/Themes.dc.html',
]

/**
 * The deploy publishes an exact `git archive`, so both hosts receive identical
 * bytes: robots.txt and every page's robots meta are production's. The dev/prod
 * split therefore has to live in the vhosts, keyed on server_name — not in the
 * published files, and not in NODE_ENV (there is no application runtime here).
 */
describe('dev-meridian.efolusi.com is never indexed', () => {
  it('serves disallow-all, with no sitemap, from the dev vhost', () => {
    expect(devNginx).toContain('location = /robots.txt {')
    expect(devNginx).toContain('return 200 "User-agent: *\\nDisallow: /\\n";')
    // The committed Sitemap: line points at production; the override must not
    // reintroduce it for this host.
    const override = devNginx.slice(devNginx.indexOf('location = /robots.txt {'))
    expect(override.slice(0, override.indexOf('}'))).not.toMatch(/Sitemap/i)
  })

  it('stamps X-Robots-Tag on every response the dev vhost can produce', () => {
    // add_header does not inherit into a location that declares its own, so
    // each such location repeats it. `location /` declares none and inherits.
    const locationsWithOwnHeaders = devNginx.match(/location [^{]*\{[^}]*add_header[^}]*\}/g) ?? []
    expect(locationsWithOwnHeaders.length).toBeGreaterThan(0)
    for (const block of locationsWithOwnHeaders) {
      expect(block).toContain('add_header X-Robots-Tag "noindex, nofollow" always;')
    }
    // Server level, covering `location /`, index.html and the 404 page.
    expect(devNginx).toMatch(/server_name dev-meridian\.efolusi\.com;[\s\S]*add_header X-Robots-Tag "noindex, nofollow" always;/)
  })

  it('rewrites the committed index,follow meta in flight on the dev vhost', () => {
    expect(devNginx).toContain(
      `sub_filter '<meta name="robots" content="index,follow">'`,
    )
    expect(devNginx).toContain(
      `'<meta name="robots" content="noindex,nofollow">'`,
    )
    // sub_filter_types defaults to text/html, so the text/plain robots.txt
    // override is not itself rewritten.
    expect(devNginx).not.toMatch(/^\s*sub_filter_types/m)
  })

  it('matches the exact meta string every published page carries', () => {
    for (const page of SITE_PAGES) {
      expect(readFileSync(page, 'utf8')).toContain('<meta name="robots" content="index,follow">')
    }
  })
})

describe('meridian.efolusi.com keeps its production crawl policy', () => {
  it('leaves the committed robots.txt as production\'s allow policy', () => {
    expect(robots).toContain('User-agent: *')
    expect(robots).toContain('Allow: /')
    expect(robots).toContain('Disallow: /site/_smoke.html')
    expect(robots).toContain('Sitemap: https://meridian.efolusi.com/sitemap.xml')
    expect(robots).not.toMatch(/^Disallow: \/$/m)
  })

  it('never applies the noindex overrides to the production vhost', () => {
    expect(prodNginx).toContain('server_name meridian.efolusi.com;')
    expect(prodNginx).not.toContain('X-Robots-Tag')
    expect(prodNginx).not.toContain('sub_filter')
    expect(prodNginx).not.toContain('location = /robots.txt')
  })

  it('keeps the sitemap pointing only at production URLs', () => {
    expect(sitemap).toContain('https://meridian.efolusi.com/')
    expect(sitemap).not.toContain('dev-meridian.efolusi.com')
  })
})
