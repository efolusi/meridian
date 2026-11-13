import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Prepared for an administrator to install; the live vhosts do not include it
// yet. nginx drops every server-level add_header in a location that sets its
// own, so the header snippet is written to be included at server level and in
// each such location, and the CORS snippet once at server level.
const HEADERS = 'nginx/snippets/meridian-security-headers.conf'
const CORS = 'nginx/snippets/meridian-cors.conf'

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')
const directives = (src) => src.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'))

describe('prepared nginx security headers', () => {
  const headers = read(HEADERS)
  const cors = read(CORS)

  it('sends nosniff, HSTS, a referrer policy and same-origin framing on every response', () => {
    const expected = {
      'X-Content-Type-Options': '"nosniff"',
      // Same value Cloudflare already sends at the edge, so the two agree.
      'Strict-Transport-Security': '"max-age=15552000; includeSubDomains"',
      'Referrer-Policy': '"strict-origin-when-cross-origin"',
      'X-Frame-Options': '"SAMEORIGIN"',
      'Content-Security-Policy': `"frame-ancestors 'self'"`,
    }
    for (const [name, value] of Object.entries(expected)) {
      expect(headers).toContain(`add_header ${name} ${value} always;`)
    }
  })

  it('holds only add_header lines, so it is safe inside any location', () => {
    const lines = directives(headers)
    expect(lines.length).toBeGreaterThan(0)
    for (const line of lines) expect(line).toMatch(/^add_header \S+ .+ always;$/)
  })

  it('opens CORS for the registry only, through a variable that is empty elsewhere', () => {
    expect(headers).toContain('add_header Access-Control-Allow-Origin $meridian_cors always;')
    expect(directives(cors)).toEqual([
      'set $meridian_cors "";',
      `if ($uri ~ "^/(site/registry(\\.json|/.*)|registry\\.json)$") {`,
      '    set $meridian_cors "*";',
      '}',
    ])
    const re = /^\/(site\/registry(\.json|\/.*)|registry\.json)$/
    for (const path of ['/site/registry.json', '/site/registry/button.json', '/registry.json']) {
      expect(re.test(path), path).toBe(true)
    }
    for (const path of ['/site/Docs.dc.html', '/site/registry.json.bak', '/registryXjson', '/tokens.json']) {
      expect(re.test(path), path).toBe(false)
    }
  })

  it('is never published to the web root', () => {
    const prod = readFileSync('scripts/deploy-prod-static.sh', 'utf8')
    const paths = prod.match(/^public_paths=\(\n([\s\S]*?)\n\)/m)[1].split('\n').map((p) => p.trim())
    expect(paths).not.toContain('nginx')
  })
})
