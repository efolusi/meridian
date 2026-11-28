import { describe, expect, it } from 'vitest'
import { componentRules } from './helpers/component-css.mjs'

// MD123 and EF47: one press value, --motion-press (0.98), and one press timing, 120 ms on --ease-enter.
// Button wrote .985, IconButton .96, Checkbox, Radio and the composer send button .95. A control that scales
// down while it is pressed reads the token; a literal is a second house value.
const rules = componentRules()
const pressed = rules.filter((r) => /:active/.test(r.selector) && /scale\(/.test(r.body))
const scaleOf = (body) => [...body.matchAll(/(?<![\w-])scale\(((?:[^()]|\([^()]*\))*)\)/g)].map((m) => m[1].trim())

describe('press scale', () => {
  it('finds the pressables', () => {
    expect(pressed.length).toBeGreaterThanOrEqual(6)
  })

  it('no component writes its own press scale: every scale-down on :active is var(--motion-press)', () => {
    const own = []
    for (const r of pressed) {
      for (const value of scaleOf(r.body)) {
        if (value === 'var(--motion-press)') continue
        // A grab that grows (the slider thumb, 1.12) is not a press.
        if (/^[\d.]+$/.test(value) && Number(value) >= 1) continue
        own.push(`${r.file}: ${r.selector} { scale(${value}) }`)
      }
    }
    expect(own).toEqual([])
  })

  it('.ef-btn:active reads the token', () => {
    const r = rules.find((x) => x.selector === '.ef-btn:active')
    expect(r?.body.replace(/\s/g, '')).toBe('transform:scale(var(--motion-press))')
  })
})

describe('press timing', () => {
  const pressables = ['.ef-btn', '.ef-iconbtn', '.ef-file-input__button', '.ef-check__box', '.ef-radio__dot', '.ef-composer__send']
  for (const selector of pressables) {
    it(`${selector} presses over --dur-fast on --ease-enter`, () => {
      const r = rules.find((x) => x.selector === selector)
      expect(r, selector).toBeDefined()
      expect(r.body).toContain('transform var(--dur-fast) var(--ease-enter)')
    })
  }
})
