import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FORBIDDEN_PATHS, PUBLIC_PATHS, buildWorkerAssets } from '../scripts/build_worker_assets.mjs'

const workflow = readFileSync('.github/workflows/deploy-production.yml', 'utf8')
const wrangler = readFileSync('wrangler.jsonc', 'utf8')
const headers = readFileSync('_headers', 'utf8')

// path pattern -> { header: value }, in file order
function parseHeaders(src) {
  const rules = []
  for (const line of src.split('\n')) {
    if (/^\s*(#|$)/.test(line)) continue
    if (!/^\s/.test(line)) { rules.push({ path: line.trim(), set: {} }); continue }
    const at = line.indexOf(':')
    rules.at(-1).set[line.slice(0, at).trim().toLowerCase()] = line.slice(at + 1).trim()
  }
  return rules
}

// Cloudflare's _headers matching: * is a splat, :name one path segment.
function matches(pattern, path) {
  const re = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/:[A-Za-z]\w*/g, '[^/]+')
  return new RegExp(`^${re}$`).test(path)
}

function headersFor(path) {
  const out = {}
  for (const { path: pattern, set } of parseHeaders(headers)) {
    if (!matches(pattern, path)) continue
    for (const [name, value] of Object.entries(set)) (out[name] ??= []).push(value)
  }
  return out
}

describe('Meridian production deploy to Cloudflare Workers', () => {
  it('deploys only from a v* tag or a manual run, never on a branch push', () => {
    const on = workflow.slice(workflow.indexOf('\non:\n'), workflow.indexOf('\npermissions:'))
    expect(on).toContain("tags: ['v*']")
    expect(on).toContain('workflow_dispatch:')
    expect(on).not.toMatch(/branches:/)
    expect(on).not.toContain('pull_request')
  })

  it('is started by publish.yml on the release tag, with actions: write on that job only', () => {
    const publish = readFileSync('.github/workflows/publish.yml', 'utf8')
    const job = publish.slice(publish.indexOf('\n  deploy:\n'))
    expect(job).toContain('needs: [build, release]')
    expect(job).toContain('actions: write')
    expect(job).toContain('gh workflow run deploy-production.yml --repo "$GITHUB_REPOSITORY" --ref "v$PKG"')
    expect(publish.match(/actions: write/g)).toHaveLength(1)
  })

  it('runs only in efolusi/meridian, on a v* tag, in the production environment, on a hosted runner', () => {
    expect(workflow).toContain("if: github.repository == 'efolusi/meridian' && startsWith(github.ref, 'refs/tags/v')")
    expect(workflow).toContain('environment: production')
    expect(workflow).toContain('runs-on: ubuntu-24.04')
    expect(workflow).not.toMatch(/self-hosted/)
  })

  it('binds the exact tagged SHA, checks it is on main and passed its checks, and runs the full gate', () => {
    expect(workflow).toContain('ref: ${{ github.sha }}')
    expect(workflow).toContain('[[ "$GITHUB_REF" == refs/tags/v* ]]')
    expect(workflow).not.toContain('refs/heads/main')
    expect(workflow).toContain('[[ "$(git rev-parse HEAD)" == "$MERIDIAN_RELEASE_SHA" ]]')
    expect(workflow).toContain('git merge-base --is-ancestor "$MERIDIAN_RELEASE_SHA" FETCH_HEAD')
    expect(workflow).toContain('node scripts/require_successful_checks.mjs')
    expect(workflow).toContain('node-version-file: .nvmrc')
    expect(workflow).toContain('npm ci --no-audit --no-fund')
    expect(workflow).toContain('npm run check')
    expect(workflow).toContain('git diff --exit-code')
    expect(workflow).toContain('node scripts/build_worker_assets.mjs "$MERIDIAN_RELEASE_SHA"')
  })

  it('deploys with a pinned wrangler and the token from the environment, then checks the live release', () => {
    expect(workflow).toMatch(/npx --yes wrangler@\d+\.\d+\.\d+ deploy\n/)
    expect(workflow).toContain('CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}')
    expect(workflow).toContain('CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}')
    expect(workflow).toContain('https://meridian.efolusi.com/meridian-release.txt')
    expect(workflow).toContain('[[ "$live" == "$MERIDIAN_RELEASE_SHA" ]]')
  })

  it('serves static assets only from public/ on the meridian.efolusi.com route', () => {
    expect(wrangler).toContain('"name": "meridian"')
    expect(wrangler).toContain('"directory": "./public"')
    expect(wrangler).toContain('"not_found_handling": "404-page"')
    // Pretty URLs would redirect every published *.html URL (the sitemap included).
    expect(wrangler).toContain('"html_handling": "none"')
    expect(wrangler).toContain('"name": "meridian"')
    expect(wrangler).toContain('{ "pattern": "meridian.efolusi.com", "custom_domain": true }')
    expect(wrangler).not.toContain('"main"')
    expect(readFileSync('.gitignore', 'utf8').split('\n')).toContain('public/')
  })
})

describe('Worker assets (scripts/build_worker_assets.mjs)', () => {
  it('publishes every root file the hosted consumers fetch', () => {
    const servedBy = (rel) => PUBLIC_PATHS.some((p) => rel === p || rel.startsWith(`${p}/`))
    // @efolusi/meridian-mcp reads these from https://meridian.efolusi.com by
    // default; llms.txt advertises root paths to agents.
    const mcp = readFileSync('mcp/server.mjs', 'utf8')
    const mcpReads = [...mcp.matchAll(/readJSON\(['`]([^'`$]+)/g)].map(([, rel]) => rel)
    const llms = readFileSync('llms.txt', 'utf8')
    const llmsPaths = [
      ...[...llms.matchAll(/(?:^|[\s(,])\/([A-Za-z0-9_][\w./-]*\.(?:json|js|css|txt|html|xml|md))\b/gm)].map(([, rel]) => rel),
      ...[...llms.matchAll(/(?:^|[\s(,])\/(LICENSE)\b/gm)].map(([, rel]) => rel),
    ]
    expect(readFileSync('skills/SKILL.md', 'utf8')).toContain('repository README.md')
    llmsPaths.push('README.md')
    expect(mcpReads).toContain('tokens.json')
    for (const rel of [...mcpReads, ...llmsPaths]) {
      expect(servedBy(rel), `${rel} is fetched from the host but not published`).toBe(true)
    }
  })

  it('keeps repository and operator files out of the published tree', () => {
    for (const path of FORBIDDEN_PATHS) expect(PUBLIC_PATHS).not.toContain(path)
    expect(PUBLIC_PATHS).toEqual(expect.arrayContaining(['index.html', '404.html', '_ds_bundle.js', '_headers', '_redirects', 'assets', 'browser', 'site', 'tokens']))
  })

  it('builds public/ from the exact committed bytes of HEAD', () => {
    // A throwaway clone, so the test never writes public/ into this checkout.
    const dir = mkdtempSync(join(tmpdir(), 'meridian-worker-test-'))
    try {
      execFileSync('git', ['clone', '--quiet', '--no-hardlinks', '--depth', '1', `file://${process.cwd()}`, dir])
      const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim()
      const out = buildWorkerAssets(sha, dir)
      expect(readFileSync(join(out, 'meridian-release.txt'), 'utf8')).toBe(`${sha}\n`)
      const version = JSON.parse(readFileSync('package.json', 'utf8')).version
      for (const file of ['marketing.js', 'theme.js', 'theme-init.js', 'hashes.json']) {
        expect(readFileSync(join(out, 'browser', version, file), 'utf8'), file).toBe(readFileSync(join(out, 'browser', file), 'utf8'))
      }
      for (const path of ['index.html', '404.html', '_headers', '_redirects', 'site/DsSite.dc.html']) {
        expect(existsSync(join(out, path)), path).toBe(true)
      }
      for (const path of FORBIDDEN_PATHS) expect(existsSync(join(out, path)), path).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('_headers is the one source of response headers', () => {
  it('sends the security headers and the environment header on every path', () => {
    for (const path of ['/', '/site/DsSite.dc.html', '/assets/fonts/x.woff2', '/README.md']) {
      const h = headersFor(path)
      expect(h['x-content-type-options'], path).toEqual(['nosniff'])
      expect(h['strict-transport-security'], path).toEqual(['max-age=15552000; includeSubDomains'])
      expect(h['referrer-policy'], path).toEqual(['strict-origin-when-cross-origin'])
      expect(h['x-frame-options'], path).toEqual(['SAMEORIGIN'])
      expect(h['content-security-policy'], path).toEqual(["frame-ancestors 'self'"])
      expect(h['x-meridian-environment'], path).toEqual(['production'])
    }
  })

  it('never sets one header twice on a path, because Cloudflare would join the values', () => {
    const paths = ['/assets/favicon.svg', '/assets/icons/x.svg', '/assets/fonts/x.woff2', '/_ds_bundle.js', '/styles.css',
      '/landing.css', '/tokens/colors.css', '/site/DsSite.dc.html', '/site/registry/button.json', '/site/registry.json',
      '/registry.json', '/LICENSE', '/README.md', '/meridian-release.txt', '/index.html', '/browser/marketing.js', '/browser/1.27.0/marketing.js']
    for (const path of paths) {
      for (const [name, values] of Object.entries(headersFor(path))) expect(values, `${path} ${name}`).toHaveLength(1)
    }
  })

  it('keeps the cache policy: a week for assets, a year for fonts, no-cache for the runtime, no-store for the marker', () => {
    expect(headersFor('/assets/favicon.svg')['cache-control']).toEqual(['public, max-age=604800'])
    expect(headersFor('/assets/icons/x.svg')['cache-control']).toEqual(['public, max-age=604800'])
    expect(headersFor('/assets/fonts/x.woff2')['cache-control']).toEqual(['public, max-age=31536000'])
    for (const path of ['/_ds_bundle.js', '/styles.css', '/landing.css', '/tokens/colors.css', '/site/DsSite.dc.html', '/browser/marketing.js']) {
      expect(headersFor(path)['cache-control'], path).toEqual(['no-cache'])
    }
    expect(headersFor('/meridian-release.txt')['cache-control']).toEqual(['no-store, max-age=0'])
  })

  it('serves versioned plain scripts as immutable, and the unversioned ones for this site only', () => {
    for (const path of ['/browser/1.27.0/marketing.js', '/browser/1.27.0/theme-init.js', '/browser/1.27.0/hashes.json']) {
      expect(headersFor(path)['cache-control'], path).toEqual(['public, max-age=31536000, immutable'])
      expect(headersFor(path)['access-control-allow-origin'], path).toEqual(['*'])
    }
    expect(headersFor('/browser/marketing.js')['cache-control']).toEqual(['no-cache'])
    expect(headersFor('/browser/marketing.js')['access-control-allow-origin']).toBeUndefined()
  })

  it('lets any origin load the registry, the fonts and the versioned plain scripts, and nothing else', () => {
    for (const path of ['/registry.json', '/site/registry.json', '/site/registry/button.json', '/assets/fonts/x.woff2', '/browser/1.27.0/marketing.js']) {
      expect(headersFor(path)['access-control-allow-origin'], path).toEqual(['*'])
    }
    for (const path of ['/site/DsSite.dc.html', '/_ds_bundle.js', '/assets/favicon.svg']) {
      expect(headersFor(path)['access-control-allow-origin'], path).toBeUndefined()
    }
  })

  it('serves every published root doc as UTF-8 plain text', () => {
    const rootDocs = PUBLIC_PATHS.filter((p) => p === 'LICENSE' || /^[A-Z]+\.md$/.test(p))
    expect(rootDocs.sort()).toEqual(['ARCHITECTURE.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'LICENSE', 'README.md', 'SECURITY.md'])
    for (const doc of rootDocs) expect(headersFor(`/${doc}`)['content-type'], doc).toEqual(['text/plain; charset=utf-8'])
  })
})
