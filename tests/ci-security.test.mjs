import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// CI security contract for .github/workflows. The repository is public and
// efolusi-dev / efolusi-prod are org-wide self-hosted hosts shared with other
// products, so what may run where is a security boundary, not a preference.

const WORKFLOW_DIR = '.github/workflows'
const workflows = Object.fromEntries(
  readdirSync(WORKFLOW_DIR)
    .filter((name) => name.endsWith('.yml'))
    .map((name) => [name, readFileSync(`${WORKFLOW_DIR}/${name}`, 'utf8')]),
)

// Top-level `on:` block triggers, by name.
function triggers(src) {
  const block = src.match(/^on:\n((?: {2}.*\n|\n)+)/m)?.[1] ?? ''
  return [...block.matchAll(/^ {2}([a-z_]+):/gm)].map(([, name]) => name)
}

// Every job's runs-on value, keyed by job id.
function runsOn(src) {
  const jobs = src.slice(src.search(/^jobs:\n/m))
  const out = {}
  let job = null
  for (const line of jobs.split('\n')) {
    const id = line.match(/^ {2}([A-Za-z0-9_-]+):\s*$/)
    if (id) job = id[1]
    const ro = line.match(/^ {4}runs-on:\s*(.+)$/)
    if (ro && job) out[job] = ro[1].trim()
  }
  return out
}

// Evaluate a GitHub Actions `${{ }}` runs-on expression for one event context.
// Covers the operators the workflow uses: && || == != fromJSON and string
// literals, with the Actions rule that a missing property is null.
function evaluate(expr, github) {
  const inner = expr.match(/^\$\{\{\s*([\s\S]*?)\s*\}\}$/)?.[1]
  if (!inner) {
    // A string with embedded expressions: interpolate each one.
    return expr.replace(/\$\{\{[\s\S]*?\}\}/g, (part) => String(evaluate(part, github)))
  }
  const js = inner
    .replace(/fromJSON\(/g, 'JSON.parse(')
    .replace(/\bgithub((?:\.[A-Za-z_]+)+)/g, (_, chain) => `ctx.github${chain.replace(/\./g, '?.')}`)
    .replace(/==/g, '===')
    .replace(/!===/g, '!==')
  const format = (template, ...args) => template.replace(/\{(\d+)\}/g, (_, n) => String(args[n] ?? ''))
  return new Function('ctx', 'format', `return (${js}) ?? null`)(
    { github: { repository: 'efolusi/meridian', run_id: 1, ...github } },
    format,
  )
}

const SELF_HOSTED = /self-hosted|efolusi-(dev|prod)/

function isSelfHosted(value) {
  return SELF_HOSTED.test(Array.isArray(value) ? value.join(',') : String(value))
}

const PR_CONTEXTS = {
  fork: {
    event_name: 'pull_request',
    event: { pull_request: { number: 1, head: { repo: { full_name: 'stranger/meridian', fork: true } } } },
  },
  deletedForkHead: {
    event_name: 'pull_request',
    event: { pull_request: { number: 2, head: { repo: null } } },
  },
  sameRepo: {
    event_name: 'pull_request',
    event: { pull_request: { number: 3, head: { repo: { full_name: 'efolusi/meridian', fork: false } } } },
  },
  push: { event_name: 'push', event: {} },
}

describe('CI runner isolation', () => {
  it('no workflow uses pull_request_target or workflow_run', () => {
    for (const [name, src] of Object.entries(workflows)) {
      expect(triggers(src), name).not.toContain('pull_request_target')
      expect(triggers(src), name).not.toContain('workflow_run')
    }
  })

  it('routes fork pull requests to GitHub-hosted runners, never a self-hosted host', () => {
    for (const [name, src] of Object.entries(workflows)) {
      if (!triggers(src).includes('pull_request')) continue
      const jobs = runsOn(src)
      expect(Object.keys(jobs).length, name).toBeGreaterThan(0)
      for (const [job, expr] of Object.entries(jobs)) {
        for (const ctx of ['fork', 'deletedForkHead']) {
          const runner = evaluate(expr, PR_CONTEXTS[ctx])
          expect(isSelfHosted(runner), `${name} ${job} on ${ctx}: ${runner}`).toBe(false)
          expect(runner, `${name} ${job} on ${ctx}`).toMatch(/^ubuntu-/)
        }
      }
    }
  })

  it('keeps pushes and same-repository branches on the efolusi-dev runner', () => {
    const jobs = runsOn(workflows['checks.yml'])
    expect(Object.keys(jobs).sort()).toEqual(['gates', 'smoke'])
    for (const expr of Object.values(jobs)) {
      for (const ctx of ['sameRepo', 'push']) {
        expect(evaluate(expr, PR_CONTEXTS[ctx])).toEqual([
          'self-hosted', 'Linux', 'X64', 'efolusi-dev',
        ])
      }
    }
  })

  it('does not leave a checkout token in .git/config for PR code to read', () => {
    const src = workflows['checks.yml']
    const checkouts = src.match(/uses: actions\/checkout@.*\n(?: {8}.*\n)*/g) ?? []
    expect(checkouts.length).toBe(2)
    for (const step of checkouts) expect(step).toContain('persist-credentials: false')
  })
})

describe('CI supply chain pinning', () => {
  it('pins every third-party action to a full commit SHA', () => {
    for (const [name, src] of Object.entries(workflows)) {
      for (const [, ref] of src.matchAll(/^\s*-?\s*uses:\s*(\S+)/gm)) {
        if (ref.startsWith('./')) continue
        expect(ref, `${name}: ${ref}`).toMatch(/^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/)
      }
    }
  })

  it('pins the Playwright container image by digest, matching the npm package', () => {
    const images = Object.entries(workflows).flatMap(([name, src]) =>
      [...src.matchAll(/PW_IMAGE:\s*(\S+)/g)].map(([, image]) => [name, image]),
    )
    expect(images.length).toBeGreaterThan(0)
    for (const [name, image] of images) {
      expect(image, name).toMatch(/^mcr\.microsoft\.com\/playwright:v([\d.]+)-noble@sha256:[0-9a-f]{64}$/)
      const version = image.match(/:v([\d.]+)-/)[1]
      expect(workflows[name], name).toContain(`playwright@${version}`)
    }
  })
})

// Every `run:` script body, with the workflow it came from.
function runScripts(src) {
  const out = []
  const lines = src.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)(?:- )?run:\s*(.*)$/)
    if (!m) continue
    if (m[2] && m[2] !== '|') { out.push(m[2]); continue }
    const body = []
    for (i++; i < lines.length && (lines[i].trim() === '' || lines[i].search(/\S/) > m[1].length); i++) {
      body.push(lines[i])
    }
    i--
    out.push(body.join('\n'))
  }
  return out
}

describe('publish workflow hardening', () => {
  const publish = workflows['publish.yml']

  it('never interpolates event or input data into shell scripts', () => {
    for (const [name, src] of Object.entries(workflows)) {
      for (const script of runScripts(src)) {
        expect(script, name).not.toMatch(/\$\{\{\s*(github\.event|inputs)\./)
        expect(script, name).not.toMatch(/\$\{\{\s*github\.(head_ref|event_name)/)
      }
    }
  })

  it('installs an exact npm, never a moving dist-tag', () => {
    const install = publish.match(/npm install -g npm@(\S+)/)
    expect(install).not.toBeNull()
    expect(install[1]).toMatch(/^\d+\.\d+\.\d+$/)
    const [major, minor, patch] = install[1].split('.').map(Number)
    // Trusted publishing (OIDC) needs npm 11.5.1 or newer.
    expect(major * 1e6 + minor * 1e3 + patch).toBeGreaterThanOrEqual(11_005_001)
  })
})

// Body of one job in a workflow, up to the next job.
function jobOf(src, job) {
  const jobs = src.slice(src.search(/^jobs:\n/m))
  const start = jobs.indexOf(`\n  ${job}:\n`)
  if (start === -1) return null
  const body = jobs.slice(start)
  const next = body.slice(1).search(/\n {2}[A-Za-z0-9_-]+:\n/)
  return next === -1 ? body : body.slice(0, next + 1)
}

// A job's `permissions:` map; null when the job declares none.
function jobPermissions(block) {
  const m = block?.match(/\n {4}permissions:\n((?: {6}[a-z-]+: [a-z]+.*\n)+)/)
  if (!m) return null
  return Object.fromEntries([...m[1].matchAll(/^ {6}([a-z-]+): ([a-z]+)/gm)].map(([, k, v]) => [k, v]))
}

const withoutComments = (block) => (block ?? '').replace(/^\s*#.*\n/gm, '')

describe('publish keeps third-party code and publish rights in separate jobs', () => {
  const publish = workflows['publish.yml']
  const build = jobOf(publish, 'build')
  const pub = jobOf(publish, 'publish')
  const release = jobOf(publish, 'release')

  it('has decide, build, publish and release jobs chained by needs', () => {
    expect(Object.keys(runsOn(publish))).toEqual(['decide', 'build', 'publish', 'release'])
    expect(build).toMatch(/\n {4}needs: decide\n/)
    expect(pub).toMatch(/\n {4}needs: build\n/)
    expect(release).toMatch(/\n {4}needs: \[build, publish\]\n/)
  })

  it('builds and verifies with read-only rights and no publish identity', () => {
    expect(jobPermissions(build)).toEqual({ contents: 'read', actions: 'read' })
    expect(build).not.toMatch(/\n {4}environment:/)
    const code = withoutComments(build)
    expect(code).toContain('npm ci --no-audit --no-fund')
    expect(code).toContain('npm run check')
    expect(code).toMatch(/npm pack "\.\/\$d" --pack-destination/)
    expect(code).toContain('sha256sum')
    expect(code).toMatch(/uses: actions\/upload-artifact@[0-9a-f]{40}/)
    expect(build.match(/uses: actions\/checkout@.*\n(?: {8}.*\n)*/)?.[0]).toContain('persist-credentials: false')
  })

  it('publishes only the verified tarballs, holding id-token and nothing else', () => {
    expect(jobPermissions(pub)).toEqual({ 'id-token': 'write' })
    expect(pub).toMatch(/\n {4}environment: npm-publish\n/)
    const code = withoutComments(pub)
    // No repository or dependency code runs where the OIDC token can be minted.
    expect(code).not.toMatch(/actions\/checkout@/)
    expect(code).not.toMatch(/\bnpm (ci|run)\b/)
    expect(code).not.toMatch(/\bnode scripts\//)
    expect(code).toMatch(/uses: actions\/download-artifact@[0-9a-f]{40}/)
    expect(code).toContain('sha256sum --check --strict')
    expect(code).toContain('npm publish "./$file" --access public --provenance')
    // A dry-run dispatch never enters the npm-publish environment.
    expect(pub).toContain("if: github.event_name != 'workflow_dispatch' || inputs.dry_run == false")
  })

  it('tags and cuts the Release in its own job, the only one with a write token', () => {
    expect(jobPermissions(release)).toEqual({ contents: 'write' })
    const code = withoutComments(release)
    expect(code).not.toMatch(/\bnpm (ci|run|publish)\b/)
    expect(code).not.toMatch(/\bgit push\b/)
    expect(code).toContain('gh release create "v$PKG" --target "$GITHUB_SHA"')
    expect(release.match(/uses: actions\/checkout@.*\n(?: {8}.*\n)*/)?.[0]).toContain('persist-credentials: false')
  })

  it('grants id-token: write to that one job only, never workflow-wide', () => {
    for (const [name, src] of Object.entries(workflows)) {
      for (const job of Object.keys(runsOn(src))) {
        if (jobPermissions(jobOf(src, job))?.['id-token'] === 'write') {
          expect(`${name} ${job}`).toBe('publish.yml publish')
        }
      }
      const top = src.match(/^permissions:\n((?: {2}.*\n)+)/m)?.[1] ?? ''
      expect(top, name).not.toMatch(/id-token|: write/)
    }
  })
})

describe('CI queue hygiene on the shared runner', () => {
  const checks = workflows['checks.yml']
  const group = checks.match(/^concurrency:\n {2}group: (.+)\n {2}cancel-in-progress: (.+)$/m)

  it('cancels superseded runs of the same pull request only', () => {
    expect(group).not.toBeNull()
    const [, groupExpr, cancelExpr] = group
    const g = (ctx) => evaluate(groupExpr, ctx)
    const pushA = { ...PR_CONTEXTS.push, run_id: 101 }
    const pushB = { ...PR_CONTEXTS.push, run_id: 102 }
    expect(g(PR_CONTEXTS.fork)).toBe('checks-pr-1')
    expect(g(PR_CONTEXTS.sameRepo)).toBe('checks-pr-3')
    // A queued push run must never be replaced: prod deploy and publish wait
    // for the checks run at their exact SHA.
    expect(g(pushA)).not.toBe(g(pushB))
    expect(evaluate(cancelExpr, PR_CONTEXTS.sameRepo)).toBe(true)
    expect(evaluate(cancelExpr, pushA)).toBe(false)
  })

  it('bounds every job with a timeout', () => {
    for (const [name, src] of Object.entries(workflows)) {
      for (const job of Object.keys(runsOn(src))) {
        expect(jobOf(src, job), `${name} ${job}`).toMatch(/\n {4}timeout-minutes: \d+\n/)
      }
    }
  })
})

describe('one gate list', () => {
  // Body of one job in a workflow, up to the next job.
  function jobBlock(src, job) {
    const body = src.slice(src.indexOf(`\n  ${job}:\n`))
    const next = body.slice(1).search(/\n {2}[A-Za-z0-9_-]+:\n/)
    return next === -1 ? body : body.slice(0, next + 1)
  }

  it('PR checks run the same npm run check that publish and the deploys run', () => {
    const gates = jobBlock(workflows['checks.yml'], 'gates')
    expect(gates).toMatch(/\n\s+run: npm run check\n/)
    expect(JSON.parse(readFileSync('package.json', 'utf8')).scripts.check).toBe('node scripts/check_all.mjs')
    for (const name of ['publish.yml', 'deploy-dev-static.yml', 'deploy-prod-static.yml']) {
      expect(workflows[name], name).toMatch(/\bnpm run check\b/)
    }
  })

  it('does not hand-pick gates beside it, where the two lists would drift', () => {
    const gates = jobBlock(workflows['checks.yml'], 'gates').replace(/^\s*#.*\n/gm, '')
    expect(gates).not.toMatch(/scripts\/(check_|build_|sync_)/)
    expect(gates).not.toMatch(/git diff --exit-code/)
  })
})
