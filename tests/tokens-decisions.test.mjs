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

describe('color-scheme follows the theme', () => {
  it('declares light at :root and dark in the dark theme', () => {
    expect(lightBlock).toMatch(/color-scheme:\s*light/)
    expect(darkBlock).toMatch(/color-scheme:\s*dark/)
  })

  it('does not leak color-scheme into tokens.json or the preset', () => {
    expect(readFileSync('tokens.json', 'utf8')).not.toMatch(/color-scheme/)
    expect(readFileSync('tailwind.preset.js', 'utf8')).not.toMatch(/color-scheme/)
  })
})

describe('tokens.json is DTCG with aliases and modes', () => {
  const tokens = JSON.parse(readFileSync('tokens.json', 'utf8'))
  const leaves = []
  const walk = (node, path) => {
    if (node && typeof node === 'object' && '$value' in node) return leaves.push([path.join('.'), node])
    for (const [k, v] of Object.entries(node)) if (!k.startsWith('$')) walk(v, [...path, k])
  }
  walk(tokens, [])
  const byPath = new Map(leaves)
  const MODES = 'com.efolusi.meridian'

  it('never writes a CSS var() in a value or a mode value', () => {
    for (const [path, node] of leaves) {
      expect(JSON.stringify(node.$value), path).not.toMatch(/var\(/)
      for (const v of Object.values(node.$extensions?.[MODES]?.modes ?? {})) expect(JSON.stringify(v), path).not.toMatch(/var\(/)
    }
  })

  it('writes aliases as {group.leaf} that resolve to a real token', () => {
    expect(byPath.get('surface.page').$value).toBe('{sand.50}')
    expect(byPath.get('text.primary').$value).toBe('{sand.950}')
    for (const [path, node] of leaves) {
      const values = [node.$value, ...Object.values(node.$extensions?.[MODES]?.modes ?? {})]
      for (const value of values) {
        for (const [, ref] of String(value).matchAll(/\{([^}]+)\}/g)) expect(byPath.has(ref), `${path} -> ${ref}`).toBe(true)
      }
    }
  })

  it('carries dark, compact and coarse-pointer values as modes', () => {
    const mode = (path) => byPath.get(path).$extensions[MODES].modes
    expect(mode('surface.page').dark).toBe('#191512')
    expect(mode('text.link').dark).toBe('{brand.400}')
    expect(mode('border.control').dark).toBeDefined()
    expect(mode('control.h-md').compact).toBe('30px')
    expect(mode('control.h-md').coarse).toBe('{tap.min}')
    expect(mode('table.pad-y').compact).toBe('7px')
    // A token with no override in any mode carries no extension at all.
    expect(byPath.get('sand.50').$extensions).toBeUndefined()
  })

  it('documents the mode shape at the root', () => {
    expect(tokens.$extensions[MODES].modes).toEqual({
      dark: '[data-theme="dark"]',
      compact: '[data-density="compact"]',
      coarse: '@media (pointer: coarse)',
    })
  })
})
