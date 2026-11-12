import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// _headers is not read by the Meridian deploy (nginx is), but it ships in the
// repository for forks on static hosts. It must not promise a cache policy or
// a header that the served vhosts do not send.
const headers = readFileSync('_headers', 'utf8')
const vhosts = {
  prod: readFileSync('nginx/meridian.efolusi.com.conf', 'utf8'),
  dev: readFileSync('nginx/dev-meridian.efolusi.com.conf', 'utf8'),
}

// path pattern -> { header: value }
function parseHeaders(src) {
  const rules = {}
  let path = null
  for (const line of src.split('\n')) {
    if (/^\s*(#|$)/.test(line)) continue
    if (!/^\s/.test(line)) { path = line.trim(); rules[path] = {}; continue }
    const [name, ...rest] = line.trim().split(':')
    rules[path][name.toLowerCase()] = rest.join(':').trim()
  }
  return rules
}

// Request path a _headers pattern stands for, for matching against nginx.
const SAMPLE = {
  '/assets/*': '/assets/icons/x.svg',
  '/assets/fonts/*': '/assets/fonts/x.woff2',
  '/_ds_bundle.js': '/_ds_bundle.js',
  '/styles.css': '/styles.css',
  '/landing.css': '/landing.css',
  '/tokens/*': '/tokens/x.css',
  '/site/*': '/site/Docs.dc.html',
  '/meridian-release.txt': '/meridian-release.txt',
}

// The Cache-Control nginx sends for a request path, following nginx location
// precedence: exact (=), then the longest ^~ prefix, then the first regex.
function nginxCacheControl(conf, path) {
  const locations = [...conf.matchAll(/location\s+(=|\^~|~)?\s*(\S+)\s*\{([^}]*)\}/g)]
    .map(([, mod, pattern, body]) => ({ mod: mod ?? '', pattern, body }))
  const cache = (loc) => loc?.body.match(/add_header Cache-Control "([^"]+)"/)?.[1] ?? null
  const exact = locations.find((l) => l.mod === '=' && l.pattern === path)
  if (exact) return cache(exact)
  const prefixes = locations
    .filter((l) => (l.mod === '^~' || l.mod === '') && path.startsWith(l.pattern))
    .sort((a, b) => b.pattern.length - a.pattern.length)
  if (prefixes[0]?.mod === '^~') return cache(prefixes[0])
  const regex = locations.find((l) => l.mod === '~' && new RegExp(l.pattern).test(path))
  return cache(regex ?? prefixes[0])
}

describe('_headers mirrors the nginx vhosts', () => {
  const rules = parseHeaders(headers)

  it('covers every path with a cache rule and no unknown patterns', () => {
    expect(Object.keys(rules).sort()).toEqual(Object.keys(SAMPLE).sort())
  })

  for (const [host, conf] of Object.entries(vhosts)) {
    it(`sends the same Cache-Control as the ${host} vhost`, () => {
      for (const [pattern, sample] of Object.entries(SAMPLE)) {
        expect(rules[pattern]['cache-control'], `${pattern} on ${host}`).toBe(nginxCacheControl(conf, sample))
      }
    })
  }

  it('promises no header the vhosts never send', () => {
    for (const rule of Object.values(rules)) {
      for (const name of Object.keys(rule)) {
        if (name === 'cache-control') continue
        for (const conf of Object.values(vhosts)) {
          expect(conf.toLowerCase(), name).toContain(`add_header ${name}`)
        }
      }
    }
  })
})
