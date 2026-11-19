import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// meridian.efolusi.com is a Cloudflare Worker serving static assets that
// scripts/build_worker_assets.mjs builds from a release commit. The public
// deploy docs must say so, in both locales, and name no retired path.
const docs = readFileSync('site/Docs.dc.html', 'utf8')

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
  it('describe the Worker deploy in both locales', () => {
    const pairs = copyPairs(deploySection())
    expect(pairs.length).toBeGreaterThan(0)
    for (const locale of ['en', 'id']) {
      const copy = pairs.map((pair) => pair[locale]).join('\n')
      for (const named of ['wrangler.jsonc', 'scripts/build_worker_assets.mjs', '_headers', '_redirects', 'index.html']) {
        expect(copy, `${locale}: ${named}`).toContain(named)
      }
      expect(copy).not.toMatch(/nginx|deploy-prod-static|deploy-dev-static/i)
    }
  })

  it('keep the deploy copy free of em dashes and double hyphens', () => {
    for (const { en, id } of copyPairs(deploySection())) {
      expect(en).not.toMatch(/—|--/)
      expect(id).not.toMatch(/—|--/)
    }
  })
})
