import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { badgeVariants } from '../components/display/Badge.jsx'

// MD114: Badge has typed `success` and `brand` variants. sso web wrote the shipped classes by hand on a
// default Badge; `variant="success"` and `variant="brand"` give the same look with no class by hand. The classes
// already existed, so the contract is the type, the docs and the contrast gate: the pairs the two variants paint
// are measured in four modes (light, dark and both prefers-contrast: more tables) by scripts/check_contrast.py.
const read = (file) => readFileSync(join(process.cwd(), file), 'utf8')
const types = read('components/display/Badge.d.ts')
const prompt = read('components/display/Badge.prompt.md')
const css = /const CSS = `([\s\S]*?)`;/.exec(read('components/display/Badge.jsx'))[1]
const MODES = ['light', 'dark', 'increased', 'increased-dark']

describe('Badge success and brand variants (MD114)', () => {
  it('are in the BadgeVariant type, beside the variants it had', () => {
    const union = /export type BadgeVariant = ([^;]+);/.exec(types)[1]
    for (const name of ['default', 'secondary', 'danger', 'outline', 'ghost', 'link', 'solid', 'success', 'brand']) {
      expect(union, name).toContain(`'${name}'`)
    }
  })

  it('render the class of the variant and no default class beside it', () => {
    expect(badgeVariants({ variant: 'success' })).toBe('ef-badge ef-badge--success')
    expect(badgeVariants({ variant: 'brand' })).toBe('ef-badge ef-badge--brand')
    expect(badgeVariants()).toBe('ef-badge ef-badge--default')
  })

  it('keep the rules they shipped with', () => {
    expect(css).toContain('\n.ef-badge--success{background:var(--status-success-bg);border-color:transparent;color:var(--status-success-text)}')
    expect(css).toContain('\n.ef-badge--brand{background:var(--cream-50);border-color:transparent;color:var(--cocoa-700)}')
    expect(css).toContain('[data-theme="dark"] .ef-badge--brand{background:var(--accent-subtle);color:var(--accent-subtle-fg)}')
  })

  it('are in the prompt file as variants, and the by-hand class is gone from it', () => {
    expect(prompt).toContain('<Badge variant="success">')
    expect(prompt).toContain('<Badge variant="brand">')
    expect(prompt).not.toContain('className="ef-badge--success"')
  })

  describe('contrast gate', () => {
    const run = spawnSync('python3', ['scripts/check_contrast.py'], { encoding: 'utf8' })
    const out = run.stdout + run.stderr
    it('passes', () => expect(run.status, out).toBe(0))
    for (const mode of MODES) {
      it(`measures Badge success text on its fill in ${mode}`, () => {
        expect(out).toMatch(new RegExp(`ok\\s+${mode}\\s+--status-success-text\\s+on --status-success-bg\\s+\\d+\\.\\d+:1`))
      })
      it(`measures the Badge brand pair that paints in ${mode}`, () => {
        const pair = mode === 'light' || mode === 'increased' ? ['--cocoa-700', '--cream-50'] : ['--accent-subtle-fg', '--accent-subtle']
        expect(out).toMatch(new RegExp(`ok\\s+${mode}\\s+${pair[0]}\\s+on ${pair[1]}\\s+\\d+\\.\\d+:1`))
      })
    }
  })
})
