import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Owner decisions of 2026-11-13 for the token layer.
const colors = readFileSync('tokens/colors.css', 'utf8')
const lightBlock = colors.match(/:root\{([\s\S]*?)\n\}/)[1]
const darkBlock = colors.match(/\[data-theme="dark"\]\{([\s\S]*?)\n\}/)[1]
const gate = spawnSync('python3', ['scripts/check_contrast.py'], { encoding: 'utf8' })

describe('form-control edge and accent-subtle ink', () => {
  it('defines both tokens in light and dark', () => {
    for (const block of [lightBlock, darkBlock]) {
      expect(block).toMatch(/--border-control:/)
      expect(block).toMatch(/--accent-subtle-fg:/)
    }
  })

  it('holds --border-control at 3:1 on every surface a field sits on, both themes', () => {
    expect(gate.status, gate.stdout).toBe(0)
    for (const theme of ['light', 'dark']) {
      for (const bg of ['--surface-page', '--surface-card', '--surface-sunken', '--surface-subtle']) {
        expect(gate.stdout).toMatch(new RegExp(`ok\\s+${theme}\\s+--border-control\\s+on ${bg}\\s.*min 3\\.0`))
      }
    }
  })

  it('holds --accent-subtle-fg at 4.5:1 on --accent-subtle, both themes', () => {
    for (const theme of ['light', 'dark']) {
      expect(gate.stdout).toMatch(new RegExp(`ok\\s+${theme}\\s+--accent-subtle-fg\\s+on --accent-subtle\\s.*min 4\\.5`))
    }
  })
})
