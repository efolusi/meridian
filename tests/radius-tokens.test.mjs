import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Every corner in a component comes from a --radius-* token, so a radius change in
// design-tokens reaches every component.
const files = execFileSync('git', ['ls-files', 'components/*.jsx'], { encoding: 'utf8' }).split('\n').filter(Boolean)

describe('component radii', () => {
  it('use --radius-* tokens, never a raw px value', () => {
    const raw = []
    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      for (const [decl] of source.matchAll(/border-radius:[^;}`]*/g)) if (/\d+px/.test(decl)) raw.push(`${file}: ${decl}`)
      for (const [decl] of source.matchAll(/borderRadius: ?\d+/g)) raw.push(`${file}: ${decl}`)
    }
    expect(raw).toEqual([])
  })
})
