import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { componentFiles, rulesOf } from './helpers/component-css.mjs'

// MD122 and MD127: the reduced-motion guard (tokens/base.css).
//   Loops that signal LOADING keep running, at their own duration and curve: a spinner that freezes reads as a
//   hung page. Everything else is stilled: one iteration, no delay.
//   Movement is off and opacity stays: a transition that moves something (a chevron turning, a tick or a dot
//   scaling in) does not run under reduce; the press scale stays, because it is brief feedback and not travel.
const base = readFileSync('tokens/base.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const flat = (s) => s.replace(/\s/g, '')
const baseFlat = flat(base)

// The elements that carry a loading loop (a spinner, a skeleton, a shimmer, an indeterminate bar, a stream pulse).
const LOADING = [
  '.ef-spinner', '.ef-btn__spin', '.ef-agentrun__spin', '.ef-sandbox__spin', '.ef-todo__spin', '.ef-toolcall__spin',
  '.ef-skel', '.ef-table__skel', '.ef-progress[data-state="indeterminate"] .ef-progress__indicator',
  '.ef-loader--pulse', '.ef-loader--shimmer', '.ef-loader__dots span',
  '.ef-attachment[data-state="uploading"] .ef-attachment__title', '.ef-attachment[data-state="processing"] .ef-attachment__title',
  '.ef-genimg__backdrop', '.ef-genimg__status',
  '.ef-reasoning--streaming .ef-reasoning__glyph', '.ef-toolcall--pending .ef-toolcall__head',
  '.ef-toolcall--streaming .ef-toolcall__row:last-child .ef-toolcall__val', '.ef-task--streaming .ef-task__row:last-of-type',
]
// Infinite animations that are not loading, and why they stop under reduce.
const NOT_LOADING = {
  '.ef-otp__caret': 'a blinking caret: the caret stays, it stops blinking',
  '.ef-term__caret': 'a blinking caret',
  '.ef-msg__caret': 'a blinking caret',
  '.ef-marquee__track': 'content scrolling by: travel',
  '.ef-player__bar--loading': 'a bar that scales: no scale under reduce',
  '.ef-status--pulse .ef-status__dot::after': 'a ring that grows: scale and travel',
}

// A variant selector that the loop above already covers by its base class.
const COVERED_BY = { '.ef-skel[data-shimmer]': '.ef-skel' }

// the guard rule: the reduce block that carries --ef-motion-guard on every element
const guard = /@media\(prefers-reduced-motion:reduce\)\{([^{}]*)\{--ef-motion-guard:\.01ms;([^}]*)\}\}/.exec(baseFlat)

describe('the guard stills every element that is not a loading loop', () => {
  it('is one rule on every element and its pseudo-elements, minus the loading loops', () => {
    expect(guard, 'the --ef-motion-guard rule').not.toBeNull()
    // the exclusion is written once: no animation runs on a pseudo-element of a loader, so *::before and *::after need none
    expect(guard[1]).toMatch(/^\*:not\(:where\(.+\)\),\*::before,\*::after$/)
    expect(guard[2]).toMatch(/animation-duration:var\(--ef-motion-guard\)!important/)
    expect(guard[2]).toMatch(/animation-iteration-count:1!important/)
  })

  for (const selector of LOADING) {
    it(`${selector} is left running`, () => {
      expect(guard[1]).toContain(flat(selector))
    })
  }

  it('lists no selector that is not a loop: every excluded selector is one of the loading loops above', () => {
    const inner = /^\*:not\(:where\((.*)\)\),\*::before,\*::after$/.exec(guard[1])[1]
    const listed = inner.split(/,(?![^()[\]]*[)\]])/)
    expect(listed.sort()).toEqual(LOADING.map(flat).sort())
  })

  it('every infinite animation in a component is a loading loop above or a named non-loop', () => {
    const unknown = []
    for (const file of componentFiles()) {
      for (const r of rulesOf(readFileSync(file, 'utf8'), file)) {
        if (!/animation:[^;}]*infinite/.test(r.body)) continue
        for (const raw of r.selector.split(',')) {
          const selector = raw.trim()
          if (!LOADING.includes(selector) && !LOADING.includes(COVERED_BY[selector]) && !(selector in NOT_LOADING)) unknown.push(`${file}: ${selector}`)
        }
      }
    }
    expect(unknown).toEqual([])
  })

  it('no component stops a loading loop in its own reduce block (the guard leaves it running)', () => {
    const stopped = []
    for (const file of componentFiles()) {
      const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      for (const m of text.matchAll(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{((?:[^{}]*\{[^{}]*\})*)\}/g)) {
        for (const r of rulesOf(m[1], file)) {
          if (!/animation(-name)?:\s*none/.test(r.body)) continue
          for (const raw of r.selector.split(',')) {
            const selector = raw.trim()
            if (LOADING.includes(selector) || LOADING.includes(COVERED_BY[selector])) stopped.push(`${file}: ${selector}`)
          }
        }
      }
    }
    expect(stopped).toEqual([])
  })

  it('the loading loops that rotate are linear', () => {
    for (const file of componentFiles()) {
      for (const r of rulesOf(readFileSync(file, 'utf8'), file)) {
        if (!/animation:[^;}]*(spin|spinner)[^;}]*infinite/.test(r.body)) continue
        expect(r.body, `${file}: ${r.selector}`).toMatch(/linear/)
      }
    }
  })
})

describe('movement is off and opacity stays', () => {
  const reduceOf = (text) => {
    const out = []
    for (const m of text.matchAll(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{/g)) {
      let depth = 0
      let i = m.index + m[0].length - 1
      for (; i < text.length; i += 1) {
        if (text[i] === '{') depth += 1
        else if (text[i] === '}') { depth -= 1; if (depth === 0) break }
      }
      out.push(text.slice(m.index + m[0].length, i))
    }
    return out.join('\n')
  }
  const centralReduce = flat(reduceOf(base))

  // A transition that moves or scales something. The press scale and the grab of a slider thumb are feedback and stay.
  const PRESS = ['.ef-btn', '.ef-iconbtn', '.ef-composer__send', '.ef-file-input__button', '.ef-check__box', '.ef-radio__dot', '.ef-slider__input::-webkit-slider-thumb']
  // The transform of the carousel buttons places them (translateY(-50%)) and never changes on a state, so nothing moves.
  const PLACED = ['.ef-carousel__nav']
  const movers = []
  for (const file of componentFiles()) {
    const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    const own = flat(reduceOf(text))
    for (const r of rulesOf(text, file)) {
      const t = /(?<![\w-])transition\s*:([^;}]*)/.exec(r.body)
      if (!t || !/(?:^|[\s,])(transform|translate|rotate|scale)(?=[\s,]|$)/.test(t[1])) continue
      movers.push({ file, selector: r.selector, own })
    }
  }

  it('finds the transitions that move', () => {
    expect(movers.length).toBeGreaterThanOrEqual(25)
  })

  it('every one is a press, has its own reduce rule, or is in the central rule', () => {
    const missing = []
    for (const m of movers) {
      const sel = m.selector
      if (sel.split(',').every((s) => PRESS.includes(s.trim()) || PLACED.includes(s.trim()))) continue
      const first = flat(sel.split(',')[0])
      const bare = first.replace(/="[^"]*"/g, '')
      if (m.own.includes(first) || m.own.includes(bare) || m.own.includes(flat(sel))) continue
      if (centralReduce.includes(first)) continue
      missing.push(`${m.file}: ${sel}`)
    }
    expect(missing).toEqual([])
  })

  it('the central rule stills a turning chevron and keeps the opacity of a tick, a dot and a tile check', () => {
    expect(centralReduce).toMatch(/\.ef-reasoning__chev[^{}]*\{transition:none!important\}/)
    expect(centralReduce).toMatch(/\.ef-check__boxsvg[^{}]*\{transition-property:opacity!important\}/)
    expect(centralReduce).toContain('.ef-radio__dot::after')
    expect(centralReduce).toContain('.ef-tile__check')
  })
})
