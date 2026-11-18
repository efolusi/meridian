import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// nginx drops every server-level add_header in a location that sets its own,
// so the header snippet is included at server level and in each such location,
// and the CORS snippet once at server level.
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
    const lines = directives(cors)
    expect(lines[0]).toBe('set $meridian_cors "";')
    expect(lines[1]).toMatch(/^if \(\$uri ~ "\^.+\$"\) \{$/)
    expect(lines.slice(2)).toEqual(['    set $meridian_cors "*";', '}'])
    const re = new RegExp(lines[1].match(/"(.+)"/)[1])
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

// The location blocks of a vhost's TLS server, as { spec, body }.
function locations(conf) {
  const tls = conf.slice(conf.indexOf('listen 443'))
  return [...tls.matchAll(/\n {4}location ([^{]+) \{\n([\s\S]*?)\n {4}\}/g)].map(([, spec, body]) => ({
    spec: spec.trim(),
    body,
  }))
}

const VHOSTS = {
  prod: { conf: readFileSync('nginx/meridian.efolusi.com.conf', 'utf8'), env: 'production' },
  dev: { conf: readFileSync('nginx/dev-meridian.efolusi.com.conf', 'utf8'), env: 'development' },
}

describe('security headers are wired into both vhosts', () => {
  for (const [host, { conf, env }] of Object.entries(VHOSTS)) {
    it(`${host}: includes the CORS and header snippets at server level`, () => {
      const tls = conf.slice(conf.indexOf('listen 443'))
      const server = tls.slice(0, tls.indexOf('\n    location'))
      expect(server).toContain('    include snippets/meridian-cors.conf;\n')
      expect(server).toContain('    include snippets/meridian-security-headers.conf;\n')
    })

    it(`${host}: every location that sets its own headers repeats the inherited ones`, () => {
      const own = locations(conf).filter(({ body }) => /add_header|return 200/.test(body))
      expect(own.length).toBeGreaterThan(3)
      for (const { spec, body } of own) {
        // add_header in a location drops every server-level add_header.
        expect(body, spec).toContain('include snippets/meridian-security-headers.conf;')
        expect(body, spec).toContain(`add_header X-Meridian-Environment ${env} always;`)
        if (host === 'dev') expect(body, spec).toContain('add_header X-Robots-Tag "noindex, nofollow" always;')
      }
    })
  }

  it('lets any origin load the registry and the self-hosted fonts, nothing else', () => {
    const cond = read(CORS).match(/if \(\$uri ~ "(.+)"\)/)[1]
    const re = new RegExp(cond)
    for (const path of ['/site/registry.json', '/site/registry/button.json', '/registry.json', '/assets/fonts/inter-var.woff2']) {
      expect(re.test(path), path).toBe(true)
    }
    for (const path of ['/assets/icons/x.svg', '/assets/fontsX/a.woff2', '/site/Docs.dc.html', '/tokens.json']) {
      expect(re.test(path), path).toBe(false)
    }
  })
})

describe('deploys refuse to publish against stale snippets', () => {
  for (const script of ['scripts/deploy-prod-static.sh', 'scripts/deploy-dev-static.sh']) {
    it(`${script} checks each installed snippet byte for byte, root-owned and read-only`, () => {
      const src = readFileSync(script, 'utf8')
      expect(src).toMatch(/for snippet in meridian-cors\.conf meridian-security-headers\.conf; do/)
      expect(src).toContain('cmp --silent "${repo_root}/nginx/snippets/${snippet}" "$installed"')
      expect(src).toContain('installed="/etc/nginx/snippets/${snippet}"')
      expect(src).toContain(`stat -c '%U:%G:%a' "$installed"`)
      expect(src).toContain('exit 81')
      // Checked before any release is written.
      expect(src.indexOf('exit 81')).toBeLessThan(src.indexOf('mkdir -p "$releases_root"'))
    })
  }
})
