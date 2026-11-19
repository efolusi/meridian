import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// A variant's rule is written once per component. A second top-level rule for the
// same variant (left behind by a rename) silently overrides the first.
// Rules inside @media blocks are separate on purpose and not counted.
const files = execFileSync('git', ['ls-files', 'components/*.jsx'], { encoding: 'utf8' }).split('\n').filter(Boolean)

const withoutMedia = (css) => css.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')

describe('component variant rules', () => {
  it('appear once per selector outside @media', () => {
    const repeated = []
    for (const file of files) {
      const source = withoutMedia(readFileSync(file, 'utf8'))
      const seen = new Map()
      for (const [, selector] of source.matchAll(/(?:^|[}\n])(\.ef-[a-z0-9-]+--[a-z0-9-]+(?::[a-z-]+)?)\{/g)) {
        seen.set(selector, (seen.get(selector) ?? 0) + 1)
      }
      for (const [selector, count] of seen) if (count > 1) repeated.push(`${file}: ${selector} ×${count}`)
    }
    expect(repeated).toEqual([])
  })
})
