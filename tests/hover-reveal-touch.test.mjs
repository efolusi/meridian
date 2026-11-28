import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { componentFiles, rulesOf } from './helpers/component-css.mjs'

// An action that is revealed only by :hover is out of reach of a touch user: nothing on a phone ever hovers. The five
// reveals below (ChatMessage and GeneratedImage actions, the EnvList row buttons, the Table sort arrow, the Sidebar
// menu action) are shown at rest where the pointer cannot hover or is coarse, and revealed on hover and on
// :focus-within where it can:
//   @media (hover:hover)                    hidden at rest; revealed by :hover and by :focus-within
//   @media (hover:none),(pointer:coarse)    visible at rest (written after, so it wins on a hybrid device)
const flat = (s) => s.replace(/\s/g, '')
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '')

/** Split a CSS text into what is outside the @media block(s) with this query and the text of each block. */
function split(text, query) {
  const inside = []
  let outside = ''
  let cursor = 0
  const re = new RegExp(`@media\\s*${query}\\s*\\{`, 'g')
  for (let m = re.exec(text); m; m = re.exec(text)) {
    let depth = 0
    let i = m.index + m[0].length - 1
    for (; i < text.length; i += 1) {
      if (text[i] === '{') depth += 1
      else if (text[i] === '}') { depth -= 1; if (depth === 0) break }
    }
    outside += text.slice(cursor, m.index)
    inside.push({ at: m.index, body: text.slice(m.index + m[0].length, i) })
    cursor = i + 1
    re.lastIndex = cursor
  }
  return { outside: outside + text.slice(cursor), inside }
}

const REVEALS = [
  { name: 'ChatMessage actions', file: 'components/ai/ChatMessage.jsx', target: '.ef-msg__actions', reveal: ['.ef-msg:hover .ef-msg__actions', '.ef-msg:focus-within .ef-msg__actions'] },
  { name: 'GeneratedImage actions', file: 'components/ai/GeneratedImage.jsx', target: '.ef-genimg__actions', reveal: ['.ef-genimg--complete:hover .ef-genimg__actions', '.ef-genimg--complete:focus-within .ef-genimg__actions'] },
  { name: 'EnvList row buttons', file: 'components/code/EnvList.jsx', target: '.ef-env__row .ef-env__btn', reveal: ['.ef-env__row:hover .ef-env__btn', '.ef-env__row:focus-within .ef-env__btn'], always: ['.ef-env__row .ef-env__btn--done'] },
  { name: 'Table sort arrow', file: 'components/data/Table.jsx', target: '.ef-table__sort__i', reveal: ['.ef-table__sort:hover .ef-table__sort__i', '.ef-table__sort:focus-within .ef-table__sort__i'], always: ['.ef-table__sort--on .ef-table__sort__i'] },
  { name: 'Sidebar menu action', file: 'components/navigation/Sidebar.jsx', target: '.ef-sidebar-menu-action[data-show-on-hover=true]', reveal: ['.ef-sidebar-menu-item:hover>.ef-sidebar-menu-action[data-show-on-hover=true]', '.ef-sidebar-menu-item:focus-within>.ef-sidebar-menu-action[data-show-on-hover=true]'] },
]

describe('the five hover reveals are reachable by touch', () => {
  for (const r of REVEALS) {
    describe(r.name, () => {
      const text = strip(readFileSync(r.file, 'utf8'))
      const hover = split(text, '\\(hover:\\s*hover\\)')
      const none = split(text, '\\(hover:\\s*none\\),\\s*\\(pointer:\\s*coarse\\)')
      const hoverBlock = flat(hover.inside.map((b) => b.body).join('\n'))
      const noneBlock = flat(none.inside.map((b) => b.body).join('\n'))

      it('is hidden at rest only inside @media (hover: hover)', () => {
        expect(flat(hover.outside), 'no opacity:0 on the target outside the query').not.toMatch(new RegExp(`${r.target.replace(/[.[\]$^()|*+?{}\\]/g, '\\$&').replace(/ /g, '')}\\{[^}]*opacity:0`))
        expect(hoverBlock).toMatch(new RegExp(`${flat(r.target).replace(/[.[\]$^()|*+?{}\\]/g, '\\$&')}\\{[^}]*opacity:0`))
      })

      it('is revealed by :hover and by :focus-within inside @media (hover: hover)', () => {
        for (const selector of r.reveal) expect(hoverBlock, selector).toMatch(new RegExp(`${flat(selector).replace(/[.[\]$^()|*+?{}\\]/g, '\\$&')}[^{}]*\\{[^}]*opacity:1`))
      })

      it('is visible at rest inside @media (hover: none), (pointer: coarse), written after the hover block', () => {
        expect(noneBlock).toMatch(new RegExp(`${flat(r.target).replace(/[.[\]$^()|*+?{}\\]/g, '\\$&')}\\{opacity:1\\}`))
        // the hover block that hides the target comes first, so the touch block wins on a device that is both
        const hides = hover.inside.find((b) => flat(b.body).includes(`${flat(r.target)}{opacity:0}`))
        expect(hides, 'the hover block that hides the target').toBeDefined()
        const shows = none.inside.find((b) => flat(b.body).includes(`${flat(r.target)}{opacity:1}`))
        expect(shows.at).toBeGreaterThan(hides.at)
      })

      if (r.always) {
        it('what marks a state (sorted, copied) stays visible everywhere', () => {
          for (const selector of r.always) expect(flat(hover.outside), selector).toMatch(new RegExp(`${flat(selector).replace(/[.[\]$^()|*+?{}\\]/g, '\\$&')}[^{}]*\\{[^}]*opacity:1`))
        })
      }
    })
  }

  it('no other component reveals something with :hover and opacity outside @media (hover: hover)', () => {
    const left = []
    for (const file of componentFiles()) {
      const { outside } = split(strip(readFileSync(file, 'utf8')), '\\(hover:\\s*hover\\)')
      for (const rule of rulesOf(outside, file)) {
        if (/:hover/.test(rule.selector) && /(?:^|;)opacity:\s*1|visibility:\s*visible/.test(rule.body.replace(/\s/g, ''))) left.push(`${file}: ${rule.selector}`)
      }
    }
    expect(left).toEqual([])
  })
})
