import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { componentFiles, rulesOf } from './helpers/component-css.mjs'

// MD129: one spinner, one duration. .ef-spinner and .ef-btn__spin wrote a literal .7s, the glyph spinners of
// AgentRun, Sandbox, Todo and ToolCall .9s and 1s, while --dur-loop is 1400 ms and Glamor's durLoop is 1.4 s. Every
// rotating spinner reads --dur-loop and turns on a linear curve: a loop has no ease.
const turning = []
for (const file of componentFiles()) {
  for (const r of rulesOf(readFileSync(file, 'utf8'), file)) {
    const m = /(?<![\w-])animation\s*:\s*([^;}]*)/.exec(r.body)
    if (m && /ef-[\w-]*spin[\w-]*\s/.test(`${m[1]} `)) turning.push({ file, selector: r.selector, value: m[1].trim() })
  }
}

describe('every rotating spinner', () => {
  it('finds the spinners', () => {
    expect(turning.map((t) => t.selector).sort()).toEqual([
      '.ef-agentrun__spin', '.ef-btn__spin', '.ef-sandbox__spin', '.ef-spinner', '.ef-todo__spin', '.ef-toolcall__spin',
    ])
  })

  for (const t of turning) {
    it(`${t.selector} turns over --dur-loop on linear, forever`, () => {
      expect(t.value.replace(/^ef-[\w-]+\s+/, '')).toBe('var(--dur-loop) linear infinite')
    })
  }

  it('Spinner and the Button spinner are one number', () => {
    const of = (selector) => turning.find((t) => t.selector === selector).value.replace(/^ef-[\w-]+\s+/, '')
    expect(of('.ef-spinner')).toBe(of('.ef-btn__spin'))
  })

  it('--dur-loop is the 1400 ms of the tokens, so Glamor durLoop (1.4 s) is the same number', () => {
    expect(readFileSync('tokens/effects.css', 'utf8')).toMatch(/--dur-loop:\s*1400ms/)
  })

  it('the motion allowlist no longer excuses a literal period for a spinner', () => {
    const list = JSON.parse(readFileSync('scripts/motion_allowlist.json', 'utf8'))
    for (const file of ['components/feedback/Spinner.jsx', 'components/forms/Button.jsx', 'components/ai/AgentRun.jsx', 'components/ai/Sandbox.jsx', 'components/ai/Todo.jsx']) {
      expect(list[file], file).toBeUndefined()
    }
    expect(list['components/ai/ToolCall.jsx'].count).toBe(2)
  })
})
