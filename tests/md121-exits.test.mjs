import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { componentFiles, componentKeyframes, keyframesOf } from './helpers/component-css.mjs'

// MD121: every overlay that animates in animates out. An exit is one step shorter than its enter
// (fast 120 -> fast, base 200 -> fast, slow 250 -> base, modal 400 -> slow) and runs on --ease-exit. It is written
// for no-preference only. Three kinds:
//   fade   goes to opacity 0 and back to the value the enter started from (scale, shift); under reduce the closed
//          state is the 120 ms opacity fade, ef-reduce-fade-out, never movement.
//   glass  a panel on thick glass (MD54, tests/overlay-no-opacity-entrance.test.mjs) never animates opacity: its
//          exit is the enter's transform backwards, and under reduce it goes at once (the component's animation:none).
//   slide  a glass sheet or drawer slides fully out, the one exit where the destination carries meaning.
const EXIT_OF = { fast: 'fast', base: 'fast', slow: 'base', modal: 'slow' }

// [component file, enter keyframe, exit keyframe, property the exit takes to its end value, kind]
const PAIRS = [
  ['components/overlay/Popover.jsx', 'ef-pop-in', 'ef-popover-out', 'transform', 'glass'],
  ['components/overlay/DropdownMenu.jsx', 'ef-dropdown-menu-in', 'ef-dropdown-menu-out', 'transform', 'glass'],
  ['components/overlay/ContextMenu.jsx', 'ef-context-menu-in', 'ef-context-menu-out', 'transform', 'glass'],
  ['components/overlay/HoverCard.jsx', 'ef-hovercard-in', 'ef-hovercard-out', 'transform', 'glass'],
  ['components/forms/Select.jsx', 'ef-select-in', 'ef-select-out'],
  ['components/forms/Combobox.jsx', 'ef-combobox-in', 'ef-combobox-out'],
  ['components/dates/TimePicker.jsx', 'ef-tp-in', 'ef-tp-out'],
  ['components/ai/ModelSelector.jsx', 'ef-modelsel-in', 'ef-modelsel-out'],
  ['components/feedback/Tooltip.jsx', 'ef-tooltip-in', 'ef-tooltip-out'],
  ['components/feedback/Toast.jsx', 'ef-toast-in', 'ef-toast-out'],
  ['components/ai/Citation.jsx', 'ef-citation-in', 'ef-citation-out'],
  ['components/ai/Conversation.jsx', 'ef-conversation-in', 'ef-conversation-out'],
  ['components/feedback/Dialog.jsx', 'ef-pop', 'ef-pop-out'],
  ['components/feedback/Dialog.jsx', 'ef-fade', 'ef-fade-out', 'background-color'],
  ['components/feedback/AlertDialog.jsx', 'ef-alertdialog-pop', 'ef-alertdialog-pop-out'],
  ['components/feedback/AlertDialog.jsx', 'ef-alertdialog-fade', 'ef-alertdialog-fade-out', 'background-color'],
  ...['right', 'left', 'top', 'bottom'].map((side) => ['components/overlay/Drawer.jsx', `ef-drawer-${side}`, `ef-drawer-${side}-out`, 'transform', 'slide']),
  ...['right', 'left', 'top', 'bottom'].map((side) => ['components/overlay/Sheet.jsx', `ef-sheet-${side}`, `ef-sheet-${side}-out`, 'transform', 'slide']),
]

// Enters that have no exit, and why. Anything else that enters on a duration token and --ease-enter needs a pair above.
const NO_EXIT = {
  'ef-hero-draw': 'a line drawn once on first load, not something that leaves',
  'ef-navigation-menu-in': 'the panel stays mounted and hidden; moving between two panels is a transition, not an exit',
  'ef-navigation-menu-viewport': 'the viewport stays mounted and hidden, as the panel does',
}

const text = (file) => readFileSync(file, 'utf8')
const flat = (s) => s.replace(/\s/g, '')

/** The body of the braces that open at `open` (the index of the `{`), nested braces matched. */
function block(source, open) {
  let depth = 0
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1
    else if (source[i] === '}') { depth -= 1; if (depth === 0) return source.slice(open + 1, i) }
  }
  return ''
}
function mediaBlocks(source, query) {
  const out = []
  for (const m of source.matchAll(new RegExp(`@media\\s*\\(${query.replace(/[()]/g, '\\$&')}\\)\\s*\\{`, 'g'))) out.push(block(source, m.index + m[0].length - 1))
  return out
}
const enterRule = (source, name) => new RegExp(`animation:\\s*${name}\\s+var\\(--dur-(fast|base|slow|modal)\\)\\s+var\\(--ease-enter\\)`).exec(source)?.[1]

describe('every overlay enter has an exit', () => {
  for (const [file, enter, exit, property = 'opacity', kind = 'fade'] of PAIRS) {
    describe(`${enter} -> ${exit}`, () => {
      const source = text(file)
      const keyframes = keyframesOf(source, file)
      const enterKf = keyframes.find((k) => k.name === enter)
      const exitKf = keyframes.find((k) => k.name === exit)

      it('has the exit keyframe beside its enter', () => {
        expect(enterKf, `@keyframes ${enter}`).toBeDefined()
        expect(exitKf, `@keyframes ${exit}`).toBeDefined()
      })

      it('ends where its kind says and starts from nothing', () => {
        const body = flat(exitKf?.body ?? '')
        expect(body).not.toContain('from{')
        if (kind === 'fade') expect(body).toMatch(new RegExp(`^to\\{[^}]*${property}:${property === 'opacity' ? '0' : 'transparent'}`))
        if (kind === 'glass') expect(body).toMatch(/^to\{transform:[^;}]+\}$/)
        if (kind === 'slide') expect(body).toMatch(/^to\{transform:translate[XY]\(-?100%\)\}$/)
        if (kind !== 'fade') expect(body, 'a glass panel never animates opacity').not.toContain('opacity')
      })

      it('returns to the transform the enter started from (a slide goes all the way out)', () => {
        if (kind === 'slide') return
        const from = /transform:([^;}]+)/.exec(flat(enterKf?.body ?? ''))?.[1]
        if (!from) return
        expect(flat(exitKf?.body ?? '')).toContain(`transform:${from}`)
      })

      it('is one step shorter than the enter, on --ease-exit, held at its end, for no-preference only', () => {
        const enterDur = enterRule(source, enter)
        expect(enterDur, `the enter rule of ${enter}`).toBeDefined()
        const want = `animation:${exit}var(--dur-${EXIT_OF[enterDur]})var(--ease-exit)forwards`
        const media = mediaBlocks(flat(source).replace(/\(prefers-reduced-motion:no-preference\)/g, '(prefers-reduced-motion:no-preference)'), 'prefers-reduced-motion:no-preference').join('\n')
        expect(media, `exit rule for ${exit} inside @media (prefers-reduced-motion:no-preference)`).toContain(want)
        // the rule applies to the closed state only
        const at = media.indexOf(want)
        const selector = media.slice(media.lastIndexOf('}', at) + 1, media.lastIndexOf('{', at))
        expect(selector, `selector of the ${exit} rule`).toContain('[data-state="closed"]')
      })
    })
  }
})

describe('the closed state', () => {
  const files = [...new Set(PAIRS.map((p) => p[0]))]
  for (const file of files) {
    const fades = PAIRS.some((p) => p[0] === file && (p[4] ?? 'fade') === 'fade')
    it(`${file} takes no pointer when closed${fades ? ' and fades out over --dur-fast outside no-preference' : ', and on glass never fades'}`, () => {
      const source = flat(text(file))
      expect(source).toMatch(/\[data-state="closed"\][^{}]*\{[^}]*pointer-events:none/)
      const fade = /\[data-state="closed"\][^{}]*\{[^}]*animation:ef-reduce-fade-outvar\(--dur-fast\)var\(--ease-exit\)forwards/
      if (fades) expect(source).toMatch(fade)
      else expect(source).not.toMatch(fade)
    })
  }

  it('tokens/base.css owns the ef-reduce-fade-out keyframe and gives a closed element the fade duration under reduce', () => {
    const base = flat(text('tokens/base.css').replace(/\/\*[\s\S]*?\*\//g, ''))
    expect(base).toContain('@keyframesef-reduce-fade-out{to{opacity:0}}')
    expect(base).toMatch(/@media\(prefers-reduced-motion:reduce\)\{\[data-state="closed"\]\{--ef-motion-guard:var\(--dur-fast\)\}\}/)
  })
})

describe('no enter is left without a decision', () => {
  it('every enter on a duration token and --ease-enter has an exit above or a reason here', () => {
    const paired = new Set(PAIRS.map((p) => p[1]))
    const missing = []
    for (const file of componentFiles()) {
      for (const m of text(file).matchAll(/animation:\s*(ef-[\w-]+)\s+var\(--dur-(?:fast|base|slow|modal)\)\s+var\(--ease-enter\)/g)) {
        if (!paired.has(m[1]) && !NO_EXIT[m[1]]) missing.push(`${file}: ${m[1]}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('the reasons name enters that still exist', () => {
    const names = new Set(componentKeyframes().map((k) => k.name))
    expect(Object.keys(NO_EXIT).filter((n) => !names.has(n))).toEqual([])
  })
})
