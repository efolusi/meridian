import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// MD144 and MD145: ContextMenu had the mark-over-text fault MD96 found in DropdownMenu. The browser check
// (scripts/check_menu_focus.mjs, in the smoke job) measures it in Chromium; this holds the three rules in the source,
// so a rename of the selectors cannot go unnoticed between smoke runs. Menubar draws its panel and items through
// DropdownMenu (MD145), so the same three rules for it live in DropdownMenu.jsx and tests/md96-sidenav-foot.test.jsx.
const css = /const CSS = `([\s\S]*?)`;/.exec(readFileSync('components/overlay/ContextMenu.jsx', 'utf8'))[1]
const menubar = readFileSync('components/navigation/Menubar.jsx', 'utf8')
const workflow = readFileSync('.github/workflows/checks.yml', 'utf8')

describe('ContextMenu checkbox and radio items', () => {
  it('keep their text clear of the mark with the --space-8 start gutter', () => {
    expect(css).toMatch(/\.ef-context-menu__item\[role=menuitemcheckbox\],\.ef-context-menu__item\[role=menuitemradio\]\{padding-inline-start:var\(--space-8\)\}/)
  })

  it('fill the mark of the selected radio', () => {
    expect(css).toMatch(/\.ef-context-menu__item\[role=menuitemradio\] \.ef-context-menu__indicator svg\{fill:currentColor\}/)
  })

  it('make a checked item semibold, so selected and highlighted differ by more than the mark', () => {
    expect(css).toMatch(/\.ef-context-menu__item\[aria-checked=true\]\{font-weight:var\(--weight-semibold\)\}/)
  })
})

describe('the browser check for the menus', () => {
  it('runs in the smoke job of checks.yml', () => {
    expect(workflow).toContain('scripts/check_menu_focus.mjs')
  })
})

describe('Menubar (MD145)', () => {
  it('draws its panel and items through DropdownMenu, so the DropdownMenu fix is its fix', () => {
    expect(menubar).toMatch(/<DropdownMenuContent /)
    expect(menubar).toMatch(/<DropdownMenuCheckboxItem /)
    expect(menubar).toMatch(/<DropdownMenuRadioItem /)
    expect(menubar).not.toMatch(/ef-menubar__item|ef-menubar__indicator/)
  })
})
