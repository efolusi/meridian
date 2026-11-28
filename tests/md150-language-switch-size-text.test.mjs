import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// MD150: LanguageSwitch size md renders --control-h-md, the size of the ThemeToggle and the burger: 36px at a fine pointer,
// 30px in compact density, 44px (--tap-min) at a coarse pointer (MD132, measured on the komando site: 36 x 36 and 44 x 44).
// The d.ts, the prompt and the docs said "44px at every pointer". The render is the intended value (the header controls are
// one size), so the words follow it. This test reads the render from the tokens and the words from the files.
const tokens = readFileSync('tokens/spacing.css', 'utf8')
const jsx = readFileSync('components/marketing/LanguageSwitch.jsx', 'utf8')
const files = {
  'LanguageSwitch.d.ts': readFileSync('components/marketing/LanguageSwitch.d.ts', 'utf8'),
  'LanguageSwitch.prompt.md': readFileSync('components/marketing/LanguageSwitch.prompt.md', 'utf8'),
  'ThemeToggle.prompt.md': readFileSync('components/marketing/ThemeToggle.prompt.md', 'utf8'),
  'Docs.dc.html': readFileSync('site/Docs.dc.html', 'utf8'),
}

describe('LanguageSwitch size text says what the render does (MD150)', () => {
  it('the render is --control-h-md: 36px fine, 30px compact, --tap-min coarse', () => {
    expect(jsx).toContain('.ef-language-switch__item{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:var(--control-h-md);min-height:var(--control-h-md)')
    expect(tokens).toMatch(/:root[^}]*--control-h-md:\s*36px/)
    expect(tokens).toMatch(/\[data-density="compact"\][^}]*--control-h-md:\s*30px/)
    expect(tokens).toMatch(/@media \(pointer: coarse\)\s*\{[^}]*--control-h-md:\s*var\(--tap-min\)/)
  })

  it('no file says md is 44px at every pointer', () => {
    for (const [name, text] of Object.entries(files)) {
      expect(text, name).not.toMatch(/44\s?px (target )?at every pointer/)
      expect(text, name).not.toMatch(/`ThemeToggle` is a single 44px button/)
    }
  })

  it('the d.ts, the prompt and the docs say 36px at a fine pointer and 44px at a coarse pointer', () => {
    expect(files['LanguageSwitch.d.ts']).toMatch(/`md` is 36px at a fine pointer \(30px in compact density\) and 44px at a coarse pointer/)
    expect(files['LanguageSwitch.prompt.md']).toMatch(/`size="md"` \(default\) is 36px \(30px in compact density\), as the `ThemeToggle`/)
    expect(files['Docs.dc.html']).toContain('md is 36px at a fine pointer (30px in compact density) and 44px at a coarse pointer')
    expect(files['Docs.dc.html']).toContain('md adalah 36px pada penunjuk halus (30px pada kepadatan ringkas) dan 44px pada penunjuk kasar')
  })

  it('the ThemeToggle prompt says the same about its own size', () => {
    expect(files['ThemeToggle.prompt.md']).toMatch(/a single button, 36px at a fine pointer \(30px in compact density\) and 44px at a coarse pointer/)
  })
})
