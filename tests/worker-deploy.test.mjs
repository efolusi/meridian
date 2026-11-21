import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
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

function headersFor(path, src = headers) {
  const out = {}
  for (const { path: pattern, set } of parseHeaders(src)) {
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

  it('checks live that a published version is immutable and a missing one is a 404 without immutable', () => {
    const live = workflow.slice(workflow.indexOf('Check the live release'))
    // Both requests carry the probe query, so an older cached answer cannot hide the new headers.
    expect(live).toContain('/browser/$version/marketing.js?probe=$MERIDIAN_RELEASE_SHA')
    expect(live).toContain('/browser/0.0.0/marketing.js?probe=$MERIDIAN_RELEASE_SHA')
    expect(live).toMatch(/HTTP\/\[0-9\.\]\+ 200/)
    expect(live).toContain('cache-control: public, max-age=31536000, immutable')
    expect(live).toMatch(/HTTP\/\[0-9\.\]\+ 404/)
    expect(live).toContain("! grep -qi 'immutable' <<<\"$missing\"")
  })

  it('retries the versioned header probe, so a propagation delay does not fail a good deploy, but still fails a bad one', () => {
    const live = workflow.slice(workflow.indexOf('versioned_ok()'))
    expect(live).toMatch(/for attempt in 1 2 3 4 5 6; do\n\s+versioned_ok && break/)
    expect(live).toContain('[[ "$attempt" == 6 ]] && {')
    expect(live).toContain('exit 1')
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
      execFileSync('git', ['tag', 'v0.0.1'], { cwd: dir })
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

  it('serves the unversioned plain scripts for this site only, and sets no rule for versioned paths in _headers', () => {
    expect(headersFor('/browser/marketing.js')['cache-control']).toEqual(['no-cache'])
    expect(headersFor('/browser/marketing.js')['access-control-allow-origin']).toBeUndefined()
  })

  it('lets any origin load the registry and the fonts, and nothing else here', () => {
    for (const path of ['/registry.json', '/site/registry.json', '/site/registry/button.json', '/assets/fonts/x.woff2']) {
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

  // A throwaway clone with three releases: one before browser/ existed and two after.
  function cloneWithReleases() {
    const dir = mkdtempSync(join(tmpdir(), 'meridian-worker-tags-'))
    const run = (...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.invalid', ...args], { cwd: dir, encoding: 'utf8' })
    execFileSync('git', ['clone', '--quiet', '--no-hardlinks', '--depth', '1', `file://${process.cwd()}`, dir])
    run('rm', '-rq', 'browser')
    run('commit', '-qm', 'before browser')
    run('tag', 'v0.1.0')
    run('checkout', '-q', 'HEAD~1', '--', 'browser')
    writeFileSync(join(dir, 'browser', 'marketing.js'), '// release one\n')
    run('commit', '-qam', 'one')
    run('tag', 'v0.2.0')
    writeFileSync(join(dir, 'browser', 'marketing.js'), '// release two\n')
    run('commit', '-qam', 'two')
    run('tag', 'v0.3.0')
    return { dir, run }
  }

  // The immutable rule belongs to files that exist. _headers matches the request path, even
  // when Workers answers it with the 404 page, so a wildcard rule would send a year-long
  // immutable 404 for a version that was never published. The build writes exact-file rules.
  // One build serves both header tests: each build archives the whole repository.
  let builtOnce
  function builtHeaders() {
    if (!builtOnce) {
      const { dir, run } = cloneWithReleases()
      const out = buildWorkerAssets(run('rev-parse', 'HEAD').trim(), dir)
      builtOnce = { dir, out, text: readFileSync(join(out, '_headers'), 'utf8') }
    }
    return builtOnce
  }
  afterAll(() => { if (builtOnce) rmSync(builtOnce.dir, { recursive: true, force: true }) })

  it('gives immutable cache and CORS to published versioned files, and to nothing else under /browser/', () => {
    const { out, text: built } = builtHeaders()
    for (const version of ['0.2.0', '0.3.0']) {
      for (const file of readdirSync(join(out, 'browser', version))) {
        const h = headersFor(`/browser/${version}/${file}`, built)
        expect(h['cache-control'], `${version}/${file}`).toEqual(['public, max-age=31536000, immutable'])
        expect(h['access-control-allow-origin'], `${version}/${file}`).toEqual(['*'])
      }
    }
    for (const missing of ['/browser/0.1.0/marketing.js', '/browser/9.9.9/marketing.js', '/browser/0.2.0/nope.js', '/browser/0.2.0/', '/browser/0.2.0']) {
      const h = headersFor(missing, built)
      expect(h['cache-control'], missing).not.toEqual(expect.arrayContaining([expect.stringContaining('immutable')]))
      expect(h['access-control-allow-origin'], missing).toBeUndefined()
    }
    expect(headersFor('/browser/marketing.js', built)['cache-control']).toEqual(['no-cache'])
  })

  it('never sets one header twice on a built versioned path', () => {
    const { out, text: built } = builtHeaders()
    for (const version of readdirSync(join(out, 'browser')).filter((v) => /^\d/.test(v))) {
      for (const file of readdirSync(join(out, 'browser', version))) {
        for (const [name, values] of Object.entries(headersFor(`/browser/${version}/${file}`, built))) expect(values, `${version}/${file} ${name}`).toHaveLength(1)
      }
    }
  })

  it('fails the build before _headers passes the 100 rules Workers read', () => {
    const { dir, run } = cloneWithReleases()
    try {
      // Five browser files per release: twenty more releases push the file past the limit.
      for (let i = 0; i < 20; i += 1) run('tag', `v1.${i}.0`)
      expect(() => buildWorkerAssets(run('rev-parse', 'HEAD').trim(), dir)).toThrow(/100/)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('keeps browser/<version>/ of every release, byte for byte', () => {
    const { dir, run } = cloneWithReleases()
    try {
      const out = buildWorkerAssets(run('rev-parse', 'HEAD').trim(), dir)
      expect(existsSync(join(out, 'browser', '0.1.0'))).toBe(false)
      for (const tag of ['v0.2.0', 'v0.3.0']) {
        const files = run('ls-tree', '--name-only', tag, '--', 'browser/').split('\n').filter(Boolean)
        expect(files.length).toBeGreaterThan(0)
        for (const path of files) {
          const shipped = readFileSync(join(out, 'browser', tag.slice(1), path.slice('browser/'.length)))
          expect(shipped.equals(execFileSync('git', ['show', `${tag}:${path}`], { cwd: dir })), `${tag} ${path}`).toBe(true)
        }
      }
      expect(readFileSync(join(out, 'browser', '0.2.0', 'marketing.js'), 'utf8')).toBe('// release one\n')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('fails instead of dropping old versions when the checkout has no tags', () => {
    const dir = mkdtempSync(join(tmpdir(), 'meridian-worker-notags-'))
    try {
      execFileSync('git', ['clone', '--quiet', '--no-hardlinks', '--depth', '1', '--no-tags', `file://${process.cwd()}`, dir])
      const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim()
      expect(() => buildWorkerAssets(sha, dir)).toThrow(/no v\* tags/)
      expect(existsSync(join(dir, 'public'))).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('checks out every tag in the deploy workflow', () => {
    expect(workflow).toMatch(/fetch-depth: 0/)
    expect(workflow).toMatch(/fetch-tags: true/)
  })
})
