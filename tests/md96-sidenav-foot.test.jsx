import { readFileSync } from 'node:fs'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within, act } from '@testing-library/react'
import { SideNav } from '../components/navigation/SideNav.jsx'
import { AccountCard } from '../components/navigation/AccountCard.jsx'
import { ThemeToggle } from '../components/marketing/ThemeToggle.jsx'

// MD96 (owner, 2026-11-28): the rail's foot had two icon-only circles in two styles under the account card. The foot is
// now ONE bordered account card and nothing else at rest. It is a button: pressing it opens the account menu above it
// (the DropdownMenu): Theme (with its value, then Light and Dark), the product's own items, Sign out last.
const cssOf = (file) => /const CSS = `([\s\S]*?)`;/.exec(readFileSync(file, 'utf8'))[1]
const sideCss = cssOf('components/navigation/SideNav.jsx')
const cardCss = cssOf('components/navigation/AccountCard.jsx')
const groups = [
  { items: [{ id: 'home', label: 'Overview', icon: 'house' }, { id: 'runs', label: 'Runs', icon: 'bot', badge: 3 }] },
  { label: 'Workspace', items: [{ id: 'settings', label: 'Settings', icon: 'settings' }] },
]
const account = { name: 'Ada Obi', email: 'ada@example.com' }
const rail = (props = {}) => render(<SideNav groups={groups} value="home" account={account} onSignOut={() => {}} {...props} />)
const card = () => screen.getByRole('button', { name: /Ada Obi/ })
const open = () => { fireEvent.click(card()); return screen.getByRole('menu') }
const rule = (css, selector) => new RegExp(`(?:^|\\n|,)${selector.replace(/[.[\]()]/g, '\\$&')}\\{([^}]*)\\}`).exec(css)?.[1] ?? ''

beforeEach(() => {
  localStorage.clear()
  document.cookie = 'efolusi_theme=; Path=/; Max-Age=0'
  document.documentElement.removeAttribute('data-theme')
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
})
afterEach(() => { delete window.matchMedia })

describe('the foot at rest: one account card and nothing else', () => {
  it('is one button, after the nav, with the name and email and a chevron', () => {
    const { container } = rail()
    const foot = container.querySelector('[data-slot="sidenav-foot"]')
    expect(foot).not.toBeNull()
    expect(foot.querySelectorAll('button')).toHaveLength(1)
    const trigger = foot.querySelector('button')
    expect(trigger.getAttribute('data-slot')).toBe('account-card')
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(within(trigger).getByText('Ada Obi')).toBeTruthy()
    expect(within(trigger).getByText('ada@example.com')).toBeTruthy()
    expect(trigger.querySelector('.ef-account-card__mark [data-slot="icon"]')).not.toBeNull()
    expect(container.querySelector('nav').compareDocumentPosition(foot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('menu')).toBeNull()
    expect(screen.queryByText('Sign out')).toBeNull()
    expect(screen.queryByText('Theme')).toBeNull()
  })

  it('shows nothing when no account is given', () => {
    const { container } = render(<SideNav groups={groups} value="home" onSignOut={() => {}} />)
    expect(container.querySelector('[data-slot="sidenav-foot"]')).toBeNull()
  })

  it('draws no labelled rows, state words or icon-only circles of the old foot', () => {
    const { container } = rail()
    expect(container.querySelector('[data-slot="sidenav-theme"],[data-slot="sidenav-sign-out"],.ef-sidenav__state,.ef-sidenav__actions')).toBeNull()
    expect(sideCss).not.toMatch(/ef-sidenav__(actions|state)/)
  })
})

describe('the account menu', () => {
  it('opens above the card on a press and marks the card expanded', () => {
    rail()
    const menu = open()
    expect(card().getAttribute('aria-expanded')).toBe('true')
    expect(menu.getAttribute('data-side')).toBe('top')
    expect(menu.className).toContain('ef-sidenav__menu')
  })

  it('lists a Theme group with Light and Dark (the current one checked), then a separator and Sign out last', () => {
    rail()
    const menu = open()
    expect(within(menu).getByText('Theme')).toBeTruthy()
    const radios = within(menu).getAllByRole('menuitemradio')
    expect(radios.map((r) => [r.textContent, r.getAttribute('aria-checked')])).toEqual([['Light', 'true'], ['Dark', 'false']])
    const out = within(menu).getByRole('menuitem', { name: 'Sign out' })
    const seps = menu.querySelectorAll('.ef-dropdown-menu__separator')
    expect(seps).toHaveLength(1)
    expect(seps[0].compareDocumentPosition(out) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(seps[0].compareDocumentPosition(radios[1]) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
    expect(menu.lastElementChild).toBe(out)
  })

  it('leaves the sign-out item and its separator out when there is no handler', () => {
    rail({ onSignOut: undefined })
    const menu = open()
    expect(within(menu).queryByText('Sign out')).toBeNull()
    expect(within(menu).getByText('Theme')).toBeTruthy()
  })

  it('calls onSignOut once and closes', () => {
    const onSignOut = vi.fn()
    rail({ onSignOut })
    fireEvent.click(within(open()).getByRole('menuitem', { name: 'Sign out' }))
    expect(onSignOut).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('puts the product items after the Theme group and before Sign out, and calls them', () => {
    const onSettings = vi.fn()
    rail({ menuItems: [{ id: 'lang', label: 'Language', icon: 'globe' }, { id: 'acct', label: 'Account settings', icon: 'settings', onSelect: onSettings }] })
    const menu = open()
    expect(within(menu).getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['Language', 'Account settings', 'Sign out'])
    expect(menu.querySelectorAll('.ef-dropdown-menu__separator')).toHaveLength(2)
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Account settings' }))
    expect(onSettings).toHaveBeenCalledTimes(1)
  })

  it('speaks Indonesian with lang="id"', () => {
    rail({ lang: 'id' })
    const menu = open()
    expect(within(menu).getByText('Tema')).toBeTruthy()
    expect(within(menu).getAllByRole('menuitemradio').map((r) => r.textContent)).toEqual(['Terang', 'Gelap'])
    expect(within(menu).getByRole('menuitem', { name: 'Keluar' })).toBeTruthy()
  })

  it('overrides any word through labels', () => {
    rail({ labels: { signOut: 'Log out', theme: 'Appearance' } })
    const menu = open()
    expect(within(menu).getByText('Appearance')).toBeTruthy()
    expect(within(menu).getByRole('menuitem', { name: 'Log out' })).toBeTruthy()
  })
})

describe('the keyboard', () => {
  it('opens with Enter, moves with the arrows and closes with Escape, returning focus to the card', () => {
    rail()
    card().focus()
    fireEvent.keyDown(card(), { key: 'Enter' })
    const menu = screen.getByRole('menu')
    const [light, dark] = within(menu).getAllByRole('menuitemradio')
    expect(document.activeElement).toBe(light)
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(dark)
    fireEvent.keyDown(menu, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(card())
  })

  it('closes on a press outside the menu and stays open on a press inside it', () => {
    rail()
    const menu = open()
    fireEvent.pointerDown(within(menu).getByText('Theme'))
    expect(screen.getByRole('menu')).toBeTruthy()
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('menu')).toBeNull()
    expect(card().getAttribute('aria-expanded')).toBe('false')
  })

  it('opens with Space too', () => {
    rail()
    card().focus()
    fireEvent.keyDown(card(), { key: ' ' })
    expect(screen.getByRole('menu')).toBeTruthy()
  })
})

describe('the theme choice is on the one theme contract', () => {
  const chooseTheme = (name) => fireEvent.click(within(open()).getByRole('menuitemradio', { name }))

  it('switches the page, the stored choice, the checked radio and announces it politely, then closes', () => {
    const { container } = rail({ lang: 'id' })
    chooseTheme('Gelap')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('efolusi-theme')).toBe('dark')
    expect(container.querySelector('[role="status"]').textContent).toBe('Tema: Gelap')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(within(open()).getByRole('menuitemradio', { name: 'Gelap' }).getAttribute('aria-checked')).toBe('true')
  })

  it('stays in step with a header ThemeToggle on the same page', () => {
    render(<><ThemeToggle /><SideNav groups={groups} value="home" account={account} onSignOut={() => {}} /></>)
    chooseTheme('Dark')
    expect(document.querySelector('[data-slot="theme-toggle"]').getAttribute('data-theme-shown')).toBe('dark')
    fireEvent.click(document.querySelector('[data-slot="theme-toggle"]'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(within(open()).getByRole('menuitemradio', { name: 'Light' }).getAttribute('aria-checked')).toBe('true')
  })

  it('does nothing when the checked theme is picked again', () => {
    rail()
    chooseTheme('Light')
    expect(localStorage.getItem('efolusi-theme')).toBeNull()
  })

  it('leaves the header ThemeToggle with no border at rest', () => {
    expect(rule(cssOf('components/marketing/ThemeToggle.jsx'), '.ef-theme-toggle')).toMatch(/border:0/)
  })
})

describe('the account card', () => {
  it('is static by default: one bordered card on the card surface, not a control', () => {
    const { container } = render(<AccountCard name="Ada Obi" email="ada@example.com" />)
    const el = container.querySelector('[data-slot="account-card"]')
    expect(el.tagName).toBe('DIV')
    expect(el.querySelector('button,a,.ef-account-card__mark')).toBeNull()
    const css = rule(cardCss, '.ef-account-card')
    expect(css).toMatch(/border:1px solid var\(--border-default\)/)
    expect(css).toMatch(/background:var\(--surface-card\)/)
  })

  it('is a button with a chevron when interactive', () => {
    const { container } = render(<AccountCard interactive name="Ada Obi" email="ada@example.com" />)
    const el = container.querySelector('[data-slot="account-card"]')
    expect(el.tagName).toBe('BUTTON')
    expect(el.getAttribute('type')).toBe('button')
    expect(el.querySelector('.ef-account-card__mark').getAttribute('aria-hidden')).toBe('true')
  })

  it('takes initials from the first and last word of the name, else the email', () => {
    const { container, rerender } = render(<AccountCard name="Ada Lovelace Obi" email="ada@example.com" />)
    expect(container.querySelector('.ef-avatar__fallback').textContent).toBe('AO')
    rerender(<AccountCard email="ada@example.com" />)
    expect(container.querySelector('.ef-avatar__fallback').textContent).toBe('AD')
    expect(container.querySelectorAll('.ef-account-card__name')).toHaveLength(1)
    expect(container.querySelector('.ef-account-card__email')).toBeNull()
  })

  it('draws the picture as decoration beside the name', () => {
    const { container } = render(<AccountCard name="Ada Obi" email="ada@example.com" image="/a.png" />)
    expect(container.querySelector('img').getAttribute('alt')).toBe('')
  })

  it('has a 44px target at a coarse pointer, a focus ring, hover only on hover-capable pointers, and stops its transition under reduced motion', () => {
    expect(cardCss).toMatch(/@media \(pointer:coarse\)\{\.ef-account-card--button\{min-height:var\(--tap-min\)\}\}/)
    expect(rule(cardCss, '.ef-account-card--button:focus-visible')).toMatch(/box-shadow:var\(--focus-ring\)/)
    expect(cardCss.replace(/@media \(hover:hover\)\{[^}]*\}\}?/g, '')).not.toMatch(/:hover/)
    expect(cardCss).toMatch(/@media \(prefers-reduced-motion:reduce\)\{\.ef-account-card--button\{transition:none\}\}/)
  })
})

describe('the collapsed rail', () => {
  it('keeps every nav row named and the card as the avatar alone with its name still in the DOM', () => {
    const { container } = rail({ collapsed: true })
    expect(container.querySelector('aside').hasAttribute('data-collapsed')).toBe(true)
    for (const name of ['Overview', 'Runs 3', 'Settings']) expect(screen.getByRole('button', { name })).toBeTruthy()
    expect(card().hasAttribute('data-compact')).toBe(true)
    expect(screen.getByText('Ada Obi')).toBeTruthy()
    expect(screen.getByText('ada@example.com')).toBeTruthy()
  })

  it('opens the same menu from the avatar', () => {
    rail({ collapsed: true })
    expect(within(open()).getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['Sign out'])
  })

  it('gives each icon-only nav row a tooltip and marks a row with a count', () => {
    rail({ collapsed: true })
    expect(screen.getByRole('button', { name: 'Overview' }).title).toBe('Overview')
    expect(screen.getByRole('button', { name: 'Runs 3' }).hasAttribute('data-has-count')).toBe(true)
  })

  it('hides labels visually, never with display:none, so the name survives', () => {
    const hidden = /\.ef-sidenav\[data-collapsed\] \.ef-sidenav__label[^{]*\{([^}]*)\}/.exec(sideCss)[1]
    expect(hidden).toMatch(/clip:rect\(0 0 0 0\)/)
    expect(hidden).not.toMatch(/display:none/)
    expect(rule(sideCss, '.ef-sidenav[data-collapsed]')).toMatch(/width:72px/)
    expect(rule(cardCss, '.ef-account-card[data-compact] .ef-account-card__text')).toMatch(/clip:rect\(0 0 0 0\)/)
  })

  it('draws no collapse control', () => {
    const { container } = rail({ collapsed: true })
    expect(container.querySelectorAll('button')).toHaveLength(4)
  })
})

describe('rows keep the touch target and the focus ring', () => {
  it('uses one row rule for nav, 44px at a coarse pointer', () => {
    expect(sideCss).toMatch(/@media \(pointer:coarse\)\{\.ef-sidenav__item\{height:var\(--tap-min\)\}\}/)
    expect(rule(sideCss, '.ef-sidenav__item:focus-visible')).toMatch(/box-shadow:var\(--focus-ring\)/)
  })

  it('has no hover rule outside @media (hover:hover)', () => {
    expect(sideCss.replace(/@media \(hover:hover\)\{[^}]*\}\}?/g, '')).not.toMatch(/:hover/)
  })

  it('has no literal colours or px font sizes', () => {
    expect(sideCss + cardCss).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })
})
