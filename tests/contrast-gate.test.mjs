import { readTokenCss } from './helpers/token-css.mjs'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readTokenCss('colors.css')

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
  it('passes the real tokens with no known failures left', () => {
    const { code, out } = gate()
    expect(code, out).toBe(0)
    expect(out).toMatch(/0 known failure/)
  })

  it('measures links, which it used to skip', () => {
    // --brand-300 links on white are far under 4.5:1.
    const { code, out } = gate(source.replace('--text-link:var(--brand-700)', '--text-link:var(--brand-300)'))
    expect(code).toBe(1)
    expect(out).toMatch(/FAIL\s+light --text-link/)
  })

  it('measures the brand button label on its hover fill', () => {
    const { code, out } = gate(source.replace('--surface-brand-hover:var(--brand-200)', '--surface-brand-hover:var(--sand-950)'))
    expect(code).toBe(1)
    expect(out).toMatch(/FAIL\s+\w+\s+--text-on-brand\s+on --surface-brand-hover/)
  })

  // MD74: every shape the components draw with the accent paints --accent-edge, which must hold 3:1 in four modes.
  it('measures --accent-edge on the surfaces, the track and the border in light', () => {
    const { code, out } = gate(source.replace('--accent-edge:var(--brand-600)', '--accent-edge:var(--copper-300)'))
    expect(code).toBe(1)
    expect(out).toMatch(/FAIL\s+light --accent-edge\s+on --surface-page/)
    expect(out).toMatch(/FAIL\s+light --accent-edge\s+on --surface-track/)
  })

  it('measures --accent-edge in dark and in both prefers-contrast: more tables', () => {
    const real = gate().out
    for (const mode of ['dark', 'increased', 'increased-dark']) expect(real, mode).toMatch(new RegExp(`ok\\s+${mode}\\s+--accent-edge\\s+on --surface-track`))
    const { code, out } = gate(source.replace('--accent-edge:var(--sand-800)', '--accent-edge:var(--sand-100)'))
    expect(code).toBe(1)
    expect(out).toMatch(/FAIL\s+increased --accent-edge\s+on --surface-page/)
  })

  it('measures the label of a disabled primary Button on its track fill', () => {
    const { code, out } = gate(source.replace('--text-muted:#6B624E', '--text-muted:#B5AC98'))
    expect(code).toBe(1)
    expect(out).toMatch(/FAIL\s+light --text-muted\s+on --surface-track/)
  })

  it('measures the dark Toast icons as the color-mix they paint', () => {
    const { out } = gate()
    expect(out).toMatch(/ok\s+dark\s+mix\(--success-600 60%, --text-inverse\) on --surface-inverse\s+4\.88:1/)
    expect(out).toMatch(/ok\s+dark\s+mix\(--warning-600 60%, --text-inverse\) on --surface-inverse\s+5\.59:1/)
  })
})

// MD55: the gate also measures what Meridian paints on glass, over the worst backdrop.
function glassGate(effects) {
  const env = { ...process.env }
  const file = join(mkdtempSync(join(tmpdir(), 'contrast-')), 'effects.css')
  writeFileSync(file, effects)
  env.CONTRAST_EFFECTS = file
  const run = spawnSync('python3', ['scripts/check_contrast.py'], { env, encoding: 'utf8' })
  return { code: run.status, out: run.stdout + run.stderr }
}

describe('contrast gate on glass (MD55)', () => {
  it('measures bar, clear and thick glass over black and white content in both themes', () => {
    const { code, out } = gate()
    expect(code, out).toBe(0)
    for (const theme of ['light', 'dark']) {
      expect(out).toMatch(new RegExp(`ok\\s+${theme}\\s+glass --text-primary on chrome over black`))
      expect(out).toMatch(new RegExp(`ok\\s+${theme}\\s+glass --text-muted on clear in chrome over white`))
      expect(out).toMatch(new RegExp(`ok\\s+${theme}\\s+glass --text-secondary on thick over black`))
    }
  })

  it('fails when the bar is too thin for its text', () => {
    const effects = readFileSync('tokens/effects.css', 'utf8').replace('--material-chrome: calc(1 - var(--glass-strength) * 0.18);', '--material-chrome: 0.3;')
    const { code, out } = glassGate(effects)
    expect(code).toBe(1)
    expect(out).toMatch(/FAIL\s+light\s+glass --text-primary on chrome over/)
  })
})
