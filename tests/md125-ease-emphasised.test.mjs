import { describe, expect, it } from 'vitest'
import { componentRules } from './helpers/component-css.mjs'

// MD125: --ease-emphasised overshoots 4 percent (.3,1.04,.35,1). No bounce is the standard, so it stays on the
// one thing that has weight and travels, the Switch thumb. Every other state change (press, tick, dot, lift,
// reveal, ink, dialog, toast) runs on --ease-enter.
const rules = componentRules()
const users = rules.filter((r) => r.body.includes('--ease-emphasised'))

describe('--ease-emphasised', () => {
  it('is written only by the Switch thumb', () => {
    expect([...new Set(users.map((r) => r.file))]).toEqual(['components/forms/Switch.jsx'])
    expect(users.map((r) => r.selector)).toEqual(['.ef-switch__track::after'])
  })

  it('drives the thumb on transform', () => {
    expect(users[0].body).toContain('transition:transform var(--dur-base) var(--ease-emphasised)')
  })

  it('does not drive the Checkbox tick: the tick scales on --ease-enter', () => {
    const tick = rules.find((r) => r.selector === '.ef-check__box svg')
    expect(tick?.body).toContain('transform var(--dur-base) var(--ease-enter)')
    expect(tick?.body).not.toContain('--ease-emphasised')
  })
})
