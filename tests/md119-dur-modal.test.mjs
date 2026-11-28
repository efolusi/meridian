import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// design-tokens v0.9.0 (MD116, MD117, MD119): one long duration, --dur-modal 400 ms, for a modal, a drawer or a
// panel arriving; --dur-long (480 ms, web marketing only) is gone, with no alias. The enter scales, the 32 px
// travel and the ease-out exit curve come with the same release.
const effects = readFileSync('tokens/effects.css', 'utf8')
const lock = JSON.parse(readFileSync('tokens/design-tokens.lock.json', 'utf8'))
const rootBlock = (text) => /:root[^{]*\{([\s\S]*?)\n\}/.exec(text)[1]
const decl = (block, name) => new RegExp(`${name}\\s*:\\s*([^;]+);`).exec(block)?.[1].trim()

describe('vendored design-tokens (the motion tokens arrive with v0.9.0)', () => {
  it('is pinned to a tag at v0.9.0 or newer', () => {
    const [major, minor] = lock.ref.replace(/^v/, '').split('.').map(Number)
    expect(major > 0 || minor >= 9).toBe(true)
  })

  it('defines the new motion tokens', () => {
    const root = rootBlock(effects)
    expect(decl(root, '--dur-modal')).toBe('400ms')
    expect(decl(root, '--motion-enter-scale-sm')).toBe('0.97')
    expect(decl(root, '--motion-enter-scale-lg')).toBe('0.98')
    expect(decl(root, '--shift-xl')).toBe('var(--space-8)')
  })

  it('exits on the same ease-out curve as enters', () => {
    const root = rootBlock(effects)
    expect(decl(root, '--ease-exit')).toBe(decl(root, '--ease-enter'))
  })

  it('swaps the modal duration, the enter scales and the long shift under reduced motion', () => {
    const reduce = effects.slice(effects.indexOf('prefers-reduced-motion'))
    expect(reduce).toContain('--dur-modal: var(--dur-fast)')
    expect(reduce).toMatch(/--motion-enter-scale-sm:\s*1;/)
    expect(reduce).toMatch(/--motion-enter-scale-lg:\s*1;/)
    expect(reduce).toMatch(/--shift-xl:\s*0;/)
  })
})

describe('--dur-long is gone', () => {
  const retired = ['--dur', 'long'].join('-')
  it('appears nowhere in the repository except the history in CHANGELOG.md', () => {
    const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).split('\0')
      .filter((f) => f && !f.startsWith('tests/') && f !== 'CHANGELOG.md' && !/\.(png|woff2?|ico|jpg|svg)$/.test(f))
    const hits = files.filter((f) => readFileSync(f, 'utf8').includes(retired))
    expect(hits).toEqual([])
  })

  it('is no token of the motion check: the modal duration is', () => {
    const check = readFileSync('scripts/check_motion.mjs', 'utf8')
    expect(check).toContain('--dur-modal')
  })
})
