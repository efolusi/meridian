import { readFileSync } from 'node:fs'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { ThemeToggle, swapTheme } from '../components/marketing/ThemeToggle.jsx'

// MD118: a theme swap changes every colour at once. Without a guard, each element with a colour transition
// starts one (46 transitionrun events on the docs Components page, 22 on sso web), so the page smears. The rule
// in tokens/base.css turns every transition off while <html> carries data-theme-switching; ThemeToggle sets the
// attribute, swaps the theme and removes the attribute after two animation frames.
const base = readFileSync('tokens/base.css', 'utf8')
const theming = readFileSync('guidelines/theming.md', 'utf8')
const noComments = base.replace(/\/\*[\s\S]*?\*\//g, '')
const ATTR = 'data-theme-switching'
const root = () => document.documentElement

let frames
const original = {}
beforeEach(() => {
  frames = []
  original.raf = window.requestAnimationFrame
  window.requestAnimationFrame = (cb) => { frames.push(cb); return frames.length }
  localStorage.clear()
  document.cookie = 'efolusi_theme=; Path=/; Max-Age=0'
  root().removeAttribute('data-theme')
  root().removeAttribute(ATTR)
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
})
afterEach(() => {
  window.requestAnimationFrame = original.raf
  delete window.matchMedia
})
const runFrame = () => { const batch = frames.splice(0); batch.forEach((cb) => cb(0)) }

describe('the rule in tokens/base.css', () => {
  it('turns transitions off on every element, and the pseudo-elements, while the attribute is set', () => {
    const rule = /\[data-theme-switching\]\s*\*\s*,\s*\[data-theme-switching\]\s*\*::before\s*,\s*\[data-theme-switching\]\s*\*::after\s*\{([^}]*)\}/.exec(noComments)
    expect(rule, 'rule for [data-theme-switching] *, ::before, ::after').not.toBeNull()
    expect(rule[1].replace(/\s/g, '')).toBe('transition:none!important')
  })

  it('sits inside @layer meridian, so a layered !important outranks a product transition', () => {
    const layerStart = noComments.indexOf('@layer meridian{')
    const at = noComments.indexOf('[data-theme-switching]')
    expect(layerStart).toBeGreaterThan(-1)
    expect(at).toBeGreaterThan(layerStart)
  })

  it('is documented in guidelines/theming.md', () => {
    expect(theming).toContain('data-theme-switching')
    expect(theming).toMatch(/two animation frames/)
  })
})

describe('swapTheme', () => {
  it('sets the attribute while the swap runs, keeps it until two frames have passed, then removes it', () => {
    let during = null
    const result = swapTheme(() => { during = root().hasAttribute(ATTR); return 'done' })
    expect(result).toBe('done')
    expect(during).toBe(true)
    expect(root().hasAttribute(ATTR)).toBe(true)
    runFrame()
    expect(root().hasAttribute(ATTR)).toBe(true)
    runFrame()
    expect(root().hasAttribute(ATTR)).toBe(false)
  })

  it('removes the attribute even when the swap throws', () => {
    expect(() => swapTheme(() => { throw new Error('boom') })).toThrow('boom')
    runFrame()
    runFrame()
    expect(root().hasAttribute(ATTR)).toBe(false)
  })
})

describe('ThemeToggle', () => {
  it('changes data-theme with the attribute set, and removes it after two frames', () => {
    const { getByRole } = render(<ThemeToggle />)
    expect(root().getAttribute('data-theme')).toBe('light')
    fireEvent.click(getByRole('button'))
    expect(root().getAttribute('data-theme')).toBe('dark')
    expect(root().hasAttribute(ATTR)).toBe(true)
    runFrame()
    runFrame()
    expect(root().hasAttribute(ATTR)).toBe(false)
  })

  it('does not set the attribute on mount: the first paint is not a swap', () => {
    render(<ThemeToggle />)
    expect(root().hasAttribute(ATTR)).toBe(false)
  })
})
