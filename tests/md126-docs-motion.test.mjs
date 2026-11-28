import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// MD126, MD128, MD130: the motion of the docs site (site/).
//   MD126  a page does not override the library's reduced-motion view transition (base.css keeps a 120 ms cross-fade
//          of old and new); the side drawer chevron turns only under no-preference.
//   MD128  the root cross-fade of a page change runs over --dur-fast on --ease-enter, not the UA 250 ms ease, because
//          a reader changes page many times a day; the Colors copy toast has an entrance.
//   MD130  the vendored runtime's placeholder shimmer is linear, as every loop is.
const flat = (s) => s.replace(/\s/g, '')
const pages = readdirSync('site').filter((f) => f.endsWith('.dc.html')).map((f) => `site/${f}`)
const withTransition = pages.filter((p) => readFileSync(p, 'utf8').includes('@view-transition'))
const styleOf = (file) => /<style>([^<]*)<\/style>/.exec(readFileSync(file, 'utf8'))?.[1] ?? ''

describe('view transitions of the docs pages', () => {
  it('finds the eight pages that opt in', () => {
    expect(withTransition.length).toBe(8)
  })

  for (const file of withTransition) {
    describe(file, () => {
      const style = flat(styleOf(file))

      it('has no page-level reduced-motion override of the view transition (the library rule is enough)', () => {
        expect(style).not.toMatch(/prefers-reduced-motion:reduce/)
        expect(style).not.toMatch(/::view-transition[^{}]*\{[^}]*animation:none/)
      })

      it('keeps the named header, side and footer on --dur-base', () => {
        expect(style).toContain('::view-transition-group(*){animation-duration:var(--dur-base)}')
      })

      it('cross-fades the root over --dur-fast on --ease-enter under no-preference', () => {
        expect(style).toContain('@media(prefers-reduced-motion:no-preference){::view-transition-old(root),::view-transition-new(root){animation-duration:var(--dur-fast);animation-timing-function:var(--ease-enter)}}')
      })
    })
  }

  it('the library rule the pages now rely on is still there: under reduce old and new cross-fade over --dur-fast', () => {
    const base = flat(readFileSync('tokens/base.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''))
    expect(base).toContain('::view-transition-old(*),::view-transition-new(*){animation-duration:var(--dur-fast)!important')
  })
})

describe('site.css', () => {
  const css = readFileSync('site/site.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const noPref = []
  for (const m of css.matchAll(/@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{/g)) {
    let depth = 0
    let i = m.index + m[0].length - 1
    for (; i < css.length; i += 1) {
      if (css[i] === '{') depth += 1
      else if (css[i] === '}') { depth -= 1; if (depth === 0) break }
    }
    noPref.push(css.slice(m.index + m[0].length, i))
  }
  const outside = flat(noPref.reduce((text, block) => text.replace(block, ''), css))
  const inside = flat(noPref.join('\n'))

  it('the side drawer chevron turns only under no-preference', () => {
    expect(outside).not.toMatch(/\.side-drawer__chev[^{}]*\{[^}]*(transform|transition)/)
    expect(outside).not.toMatch(/\.side-drawer\[open\][^{}]*\.side-drawer__chev[^{}]*\{[^}]*transform/)
    expect(inside).toContain('.side-drawer[open].side-drawer__chev{transform:rotate(180deg)}')
    expect(inside).toContain('.side-drawer__chev{transition:transformvar(--dur-base)var(--ease-enter)}')
  })

  it('the Colors copy toast enters over --dur-slow on --ease-enter, from the toast enter scale and 8 px', () => {
    expect(flat(css)).toMatch(/\.site-copied\{animation:site-copied-invar\(--dur-slow\)var\(--ease-enter\)\}/)
    const key = /@keyframes site-copied-in\{([^@]*?\}\})/.exec(css)?.[1] ?? ''
    expect(flat(key)).toContain('from{opacity:0;transform:translateX(-50%)translateY(var(--shift-md))scale(var(--motion-enter-scale-sm))}')
    // reduced motion: the 120 ms opacity fade of the library, no movement
    expect(flat(css)).toMatch(/@media\(prefers-reduced-motion:reduce\)\{\.site-copied\{--ef-motion-guard:var\(--dur-fast\);animation-name:ef-reduce-fade\}\}/)
  })

  it('the Colors page draws the toast with that class', () => {
    expect(readFileSync('site/Colors.dc.html', 'utf8')).toMatch(/<div class="site-copied" style="position:fixed;bottom:24px;left:50%;transform:translateX\(-50%\)/)
  })
})

describe('the vendored page runtime', () => {
  const copies = ['site/support.js', ...readdirSync('starters', { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(`starters/${d.name}/support.js`)).map((d) => `starters/${d.name}/support.js`)]

  it('finds the ten copies', () => {
    expect(copies.length).toBe(10)
  })

  for (const file of copies) {
    it(`${file}: the placeholder shimmer is linear`, () => {
      const text = readFileSync(file, 'utf8')
      expect(text).toContain('animation:sc-shine 1.4s linear infinite')
      expect(text).not.toMatch(/sc-shine[^;}]*\bease\b/)
    })
  }

  it('the patch is written down beside the vendored file', () => {
    const note = readFileSync('site/support-patches.md', 'utf8')
    expect(note).toContain('sc-shine')
    expect(note).toMatch(/linear/)
    expect(note).toMatch(/dc-runtime/)
    expect(note).toMatch(/scripts\/check_runtime_copies\.py/)
  })
})
