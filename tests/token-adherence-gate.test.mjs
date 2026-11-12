import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Run the ratchet against a scratch tree holding one probe component, so the
// test never writes into components/ while other suites read it.
function run(source) {
  const env = { ...process.env }
  if (source !== undefined) {
    const root = mkdtempSync(join(tmpdir(), 'adherence-'))
    mkdirSync(join(root, 'components', 'probe'), { recursive: true })
    writeFileSync(join(root, 'components', 'probe', 'Probe.jsx'), source)
    env.ADHERENCE_ROOT = root
  }
  const result = spawnSync('python3', ['scripts/check_token_adherence.py'], { env, encoding: 'utf8' })
  return { code: result.status, out: result.stdout + result.stderr }
}

describe('raw colour ratchet', () => {
  it('passes the real components', () => {
    expect(run().code).toBe(0)
  })

  const literals = ['#c08a5a', 'rgba(0,0,0,.5)', 'hsl(30 40% 50%)', 'hsla(30,40%,50%,.5)', 'oklch(70% 0.1 60)',
    'oklab(0.7 0.02 0.05)', 'lab(60% 20 30)', 'lch(60% 30 60)', 'hwb(30 20% 30%)']
  for (const literal of literals) {
    it(`catches ${literal}`, () => {
      const { code, out } = run(`const CSS = \`.x{color:${literal}}\`;\n`)
      expect(code, out).toBe(1)
      expect(out).toMatch(/REGRESSION components\/probe\/Probe\.jsx/)
    })
  }

  it('does not count var() or color-mix() over tokens', () => {
    const { code, out } = run('const CSS = `.x{color:var(--text-primary);background:color-mix(in srgb,var(--accent) 12%,transparent)}`;\n')
    expect(code, out).toBe(0)
  })

  it('leaves the baseline empty', () => {
    expect(readFileSync('scripts/token_adherence_baseline.json', 'utf8')).toBe('{}\n')
  })
})
