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
function evaluateRunsOn(expr, github) {
  const inner = expr.match(/^\$\{\{\s*([\s\S]*?)\s*\}\}$/)?.[1]
  if (!inner) return expr
  const js = inner
    .replace(/fromJSON\(/g, 'JSON.parse(')
    .replace(/\bgithub((?:\.[A-Za-z_]+)+)/g, (_, chain) => `ctx.github${chain.replace(/\./g, '?.')}`)
    .replace(/==/g, '===')
    .replace(/!===/g, '!==')
  return new Function('ctx', `return (${js}) ?? null`)({
    github: { repository: 'efolusi/meridian', ...github },
  })
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
          const runner = evaluateRunsOn(expr, PR_CONTEXTS[ctx])
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
        expect(evaluateRunsOn(expr, PR_CONTEXTS[ctx])).toEqual([
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
