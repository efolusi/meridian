import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// MD120: guidelines/motion.md is the one page of the motion rule. The numbers on it are the numbers of the
// tokens: the page is read against tokens/effects.css, so a changed token fails here until the page says so.
const page = readFileSync('guidelines/motion.md', 'utf8')
const effects = readFileSync('tokens/effects.css', 'utf8')
const root = /:root[^{]*\{([\s\S]*?)\n\}/.exec(effects)[1]
const token = (name) => new RegExp(`${name}\\s*:\\s*([^;]+);`).exec(root)?.[1].trim()
const section = (title) => {
  const start = page.indexOf(`## ${title}`)
  expect(start, `section "${title}"`).toBeGreaterThan(-1)
  const next = page.indexOf('\n## ', start + 1)
  return page.slice(start, next === -1 ? undefined : next)
}

describe('guidelines/motion.md', () => {
  it('has the sections of the rule, in order', () => {
    const titles = [...page.matchAll(/^## (.+)$/gm)].map((m) => m[1])
    expect(titles).toEqual(['When to animate', 'Duration', 'Easing', 'Enter scale and travel', 'Exits', 'Press', 'Reduced motion', 'Theme switch'])
  })

  it('names every duration token with its value', () => {
    const text = section('Duration')
    for (const name of ['--dur-fast', '--dur-base', '--dur-slow', '--dur-modal', '--dur-progress', '--dur-loop', '--dur-loop-slow']) {
      expect(text, name).toContain(name)
    }
    for (const name of ['--dur-fast', '--dur-base', '--dur-slow', '--dur-modal']) {
      expect(text, `${name} value`).toContain(`${token(name).replace('ms', '')} ms`)
    }
  })

  it('says ease-out for enters, exits and state changes, and the emphasised curve only on the Switch thumb', () => {
    const text = section('Easing')
    expect(text).toContain('--ease-enter')
    expect(text).toContain('--ease-exit')
    expect(text).toContain('--ease-emphasised')
    expect(text).toMatch(/Switch thumb/)
    expect(text).toMatch(/no bounce/i)
  })

  it('names the enter scales and the shifts with their values', () => {
    const text = section('Enter scale and travel')
    expect(text).toContain(`${token('--motion-enter-scale-sm')}`)
    expect(text).toContain(`${token('--motion-enter-scale-lg')}`)
    for (const name of ['--motion-enter-scale-sm', '--motion-enter-scale-lg', '--shift-sm', '--shift-md', '--shift-lg', '--shift-xl']) {
      expect(text, name).toContain(name)
    }
    expect(text).toMatch(/trigger/)
  })

  it('writes the house press and fast values down: press 0.98, fast 120', () => {
    const text = section('Press')
    expect(token('--motion-press')).toBe('0.98')
    expect(token('--dur-fast')).toBe('120ms')
    expect(text).toContain('--motion-press')
    expect(text).toContain('press 0.98, fast 120: the house values')
    expect(text).toMatch(/disabled/)
  })

  it('pairs an exit with its enter', () => {
    const text = section('Exits')
    expect(text).toMatch(/one step shorter/)
    expect(text).toContain('--dur-fast')
    expect(text).toContain('--dur-base')
  })

  it('says movement is off under reduced motion, opacity stays, the press stays', () => {
    const text = section('Reduced motion')
    expect(text).toMatch(/opacity/)
    expect(text).toContain('--ef-motion-guard')
    expect(text).toMatch(/press stays/i)
  })

  it('points at the theme switch rule', () => {
    const text = section('Theme switch')
    expect(text).toContain('data-theme-switching')
    expect(text).toContain('theming.md')
  })

  it('is linked from the README next to the other guidelines', () => {
    expect(readFileSync('README.md', 'utf8')).toContain('guidelines/motion.md')
  })
})
