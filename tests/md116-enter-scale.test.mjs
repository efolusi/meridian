import { describe, expect, it } from 'vitest'
import { componentKeyframes, componentRules } from './helpers/component-css.mjs'

// MD116 and MD119: the enter scale shrinks as the element grows, and comes from a token (design-tokens v0.9.0):
// --motion-enter-scale-sm .97 for a tooltip, a dropdown or a toast; --motion-enter-scale-lg .98 for a dialog or a
// panel. Modals, drawers and sheets arrive over --dur-modal. A popup scales from the side that faces its trigger,
// where the component already knows that side.
const keyframes = componentKeyframes()
const rules = componentRules()
const kf = (name) => keyframes.find((k) => k.name === name)?.body.replace(/\s/g, '')
const rule = (selector) => rules.find((r) => r.selector === selector)?.body

describe('the enter scale is a token', () => {
  it('no keyframe writes a literal scale below 1', () => {
    const literal = []
    for (const k of keyframes) {
      for (const m of k.body.matchAll(/(?<![\w-])scale\(((?:[^()]|\([^()]*\))*)\)/g)) {
        const value = m[1].trim()
        if (/^[\d.]+$/.test(value) && Number(value) >= 1) continue
        if (/^var\(--motion-enter-scale-(sm|lg)\)$/.test(value)) continue
        literal.push(`${k.file}: @keyframes ${k.name} scale(${value})`)
      }
    }
    expect(literal).toEqual([])
  })

  it('no component writes the .96 it used to', () => {
    const hits = rules.filter((r) => /scale\((0?\.96)\)/.test(r.body)).map((r) => `${r.file}: ${r.selector}`)
    expect(hits).toEqual([])
  })

  it('Dialog and AlertDialog enter from the large scale', () => {
    expect(kf('ef-pop')).toContain('scale(var(--motion-enter-scale-lg))')
    expect(kf('ef-alertdialog-pop')).toContain('scale(var(--motion-enter-scale-lg))')
  })

  it('tooltip, dropdown, context menu and toast enter from the small scale', () => {
    expect(kf('ef-tooltip-in')).toContain('scale(var(--motion-enter-scale-sm))')
    expect(kf('ef-dropdown-menu-in')).toContain('scale(var(--motion-enter-scale-sm))')
    expect(kf('ef-context-menu-in')).toContain('scale(var(--motion-enter-scale-sm))')
    expect(kf('ef-toast-in')).toContain('scale(var(--motion-enter-scale-sm))')
  })
})

describe('--dur-modal', () => {
  it('drawers, sheets, dialogs and alert dialogs arrive over it', () => {
    for (const side of ['right', 'left', 'top', 'bottom']) {
      expect(rule(`.ef-drawer[data-vaul-drawer-direction=${side}]`), `drawer ${side}`).toContain('var(--dur-modal) var(--ease-enter)')
      expect(rule(`.ef-sheet[data-side=${side}]`), `sheet ${side}`).toContain('var(--dur-modal) var(--ease-enter)')
    }
    expect(rule('.ef-dialog__content')).toContain('animation:ef-pop var(--dur-modal) var(--ease-enter)')
    expect(rule('.ef-alertdialog__content')).toContain('animation:ef-alertdialog-pop var(--dur-modal) var(--ease-enter)')
  })
})

describe('origin toward the trigger', () => {
  it('the tooltip scales from the edge that faces its trigger, at the arrow', () => {
    expect(rule('.ef-tooltip__bubble')).toContain('transform-origin:var(--ef-tt-arrow,50%) 100%')
    expect(rule('.ef-tooltip__bubble--bottom')).toContain('transform-origin:var(--ef-tt-arrow,50%) 0')
    expect(rule('.ef-tooltip__bubble--left')).toContain('transform-origin:100% var(--ef-tt-arrow,50%)')
    expect(rule('.ef-tooltip__bubble--right')).toContain('transform-origin:0 var(--ef-tt-arrow,50%)')
  })

  it('the dropdown menu scales from the side that faces its trigger', () => {
    expect(rule('.ef-dropdown-menu__content[data-side=bottom]')).toContain('transform-origin:top')
    expect(rule('.ef-dropdown-menu__content[data-side=top]')).toContain('transform-origin:bottom')
    expect(rule('.ef-dropdown-menu__content[data-side=left]')).toContain('transform-origin:right')
    expect(rule('.ef-dropdown-menu__content[data-side=right]')).toContain('transform-origin:left')
  })
})
