import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// meridian.efolusi.com is served by Nginx from an immutable release that
// scripts/deploy-{dev,prod}-static.sh publish. There is no Cloudflare Pages
// project and no wrangler config, so no public surface may tell a reader to
// deploy that way.
const docs = readFileSync('site/Docs.dc.html', 'utf8')
const assetsignore = readFileSync('.assetsignore', 'utf8')
const roadmap = readFileSync('ROADMAP.md', 'utf8')
const headers = readFileSync('_headers', 'utf8')
const redirects = readFileSync('_redirects', 'utf8')
const prodVhost = readFileSync('nginx/meridian.efolusi.com.conf', 'utf8')
const devVhost = readFileSync('nginx/dev-meridian.efolusi.com.conf', 'utf8')

function deploySection() {
  const start = docs.indexOf("h2('deploy'")
  expect(start).toBeGreaterThan(-1)
  const end = docs.indexOf("h2('", start + 1)
  expect(end).toBeGreaterThan(start)
  return docs.slice(start, end)
}

// Every p('English', 'Indonesian') pair in the section, unescaped.
function copyPairs(section) {
  const unescape = (s) => s.replace(/\\(.)/g, '$1')
  return [...section.matchAll(/\bp\('((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'\)/g)].map(
    ([, en, id]) => ({ en: unescape(en), id: unescape(id) }),
  )
}

describe('public deployment docs', () => {
  it('describe the native static deploy in both locales', () => {
    const pairs = copyPairs(deploySection())
    expect(pairs.length).toBeGreaterThan(0)

    for (const locale of ['en', 'id']) {
      const copy = pairs.map((pair) => pair[locale]).join('\n')
      expect(copy).toContain('scripts/deploy-dev-static.sh')
      expect(copy).toContain('scripts/deploy-prod-static.sh')
      expect(copy).toContain('nginx/')
      expect(copy).toContain('index.html')
      expect(copy).not.toMatch(/wrangler|cloudflare/i)
    }
  })

  it('keep the deploy copy free of em dashes and double hyphens', () => {
    for (const { en, id } of copyPairs(deploySection())) {
      expect(en).not.toMatch(/—|--/)
      expect(id).not.toMatch(/—|--/)
    }
  })

  it('promise only headers the served vhosts actually send', () => {
    const section = deploySection()
    if (/CORS|Access-Control/i.test(section)) {
      expect(prodVhost).toContain('Access-Control-Allow-Origin')
      expect(devVhost).toContain('Access-Control-Allow-Origin')
    }
  })

  it('carry no wrangler configuration or Cloudflare hosting claims', () => {
    expect(assetsignore).not.toMatch(/wrangler/i)
    expect(roadmap).not.toMatch(/Cloudflare (Pages|dashboard)/)
    expect(headers).not.toMatch(/Cloudflare/)
    expect(redirects).not.toMatch(/Cloudflare/)
  })
})
