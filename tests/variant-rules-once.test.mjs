import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// A variant's rule is written once per component. A second top-level rule for the
// same variant (left behind by a rename) silently overrides the first.
// Comma lists are split. Rules inside @media blocks are separate on purpose and not
// counted; descendant and combined selectors are out of scope.
const files = execFileSync('git', ['ls-files', 'components/*.jsx'], { encoding: 'utf8' }).split('\n').filter(Boolean)

const withoutMedia = (css) => css.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')

describe('component variant rules', () => {
  it('appear once per selector outside @media', () => {
    const repeated = []
    for (const file of files) {
      const source = withoutMedia(readFileSync(file, 'utf8'))
      const seen = new Map()
      for (const [, list] of source.matchAll(/(?:^|[}\n])([^{}\n]+)\{/g)) {
        for (const part of list.split(',')) {
          const selector = part.trim()
          // One variant class, optionally followed by pseudo-classes, pseudo-elements or attributes.
          if (/^\.ef-[a-z0-9-]+--[a-z0-9-]+(?:(?::{1,2}[a-z-]+(?:\([^)]*\))?)|\[[^\]]*\])*$/.test(selector)) {
            seen.set(selector, (seen.get(selector) ?? 0) + 1)
          }
        }
      }
      for (const [selector, count] of seen) if (count > 1) repeated.push(`${file}: ${selector} ×${count}`)
    }
    expect(repeated).toEqual([])
  })
})
