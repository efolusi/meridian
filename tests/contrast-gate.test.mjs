import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync('tokens/colors.css', 'utf8')

function gate(css) {
  const env = { ...process.env }
  if (css !== undefined) {
    const file = join(mkdtempSync(join(tmpdir(), 'contrast-')), 'colors.css')
    writeFileSync(file, css)
    env.CONTRAST_CSS = file
  }
  const run = spawnSync('python3', ['scripts/check_contrast.py'], { env, encoding: 'utf8' })
  return { code: run.status, out: run.stdout + run.stderr }
}

describe('contrast gate', () => {
  it('passes the real tokens and still reports the known failures', () => {
    const { code, out } = gate()
    expect(code, out).toBe(0)
    expect(out).toMatch(/KNOWN light --code-ink-faint/)
  })

  it('measures links, which it used to skip', () => {
    // --brand-500 links on white are 2.9:1.
    const { code, out } = gate(source.replace('--text-link:var(--brand-700)', '--text-link:var(--brand-500)'))
    expect(code).toBe(1)
    expect(out).toMatch(/FAIL\s+light --text-link/)
  })

  it('measures the brand button label on its hover fill', () => {
    const { code, out } = gate(source.replace('--brand-800:#5C3A1F', '--brand-800:#C08A5A'))
    expect(code).toBe(1)
    expect(out).toMatch(/FAIL\s+\w+\s+--text-on-brand\s+on --brand-800/)
  })

  it('fails when a known failure is fixed but still listed, so the list only shrinks', () => {
    const { code, out } = gate(source.replace('--code-ink-faint:rgba(250,249,246,.35)', '--code-ink-faint:rgba(250,249,246,.6)'))
    expect(code).toBe(1)
    expect(out).toMatch(/now passing, remove from KNOWN_FAILURES/)
  })
})
