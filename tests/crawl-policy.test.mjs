import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const prodNginx = readFileSync('nginx/meridian.efolusi.com.conf', 'utf8')
const robots = readFileSync('robots.txt', 'utf8')
const sitemap = readFileSync('sitemap.xml', 'utf8')

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

