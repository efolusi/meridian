import { readFileSync } from 'node:fs'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { SideNav } from '../components/navigation/SideNav.jsx'
import { AccountCard } from '../components/navigation/AccountCard.jsx'
import { ThemeToggle } from '../components/marketing/ThemeToggle.jsx'

// MD96 (owner, 2026-11-28): the rail's foot had two icon-only circles in two styles under the account card. The foot is
// now one thing on every front: a labelled theme row, a labelled sign-out row, both in the nav row style, then ONE
// bordered account card. The header ThemeToggle keeps no border at rest; the foot's theme row is a row, not a second toggle.
const cssOf = (file) => /const CSS = `([\s\S]*?)`;/.exec(readFileSync(file, 'utf8'))[1]
const sideCss = cssOf('components/navigation/SideNav.jsx')
const cardCss = cssOf('components/navigation/AccountCard.jsx')
const groups = [
  { items: [{ id: 'home', label: 'Overview', icon: 'house' }, { id: 'runs', label: 'Runs', icon: 'bot', badge: 3 }] },
  { label: 'Workspace', items: [{ id: 'settings', label: 'Settings', icon: 'settings' }] },
]
const account = { name: 'Ada Obi', email: 'ada@example.com' }
const rail = (props = {}) => render(<SideNav groups={groups} value="home" account={account} onSignOut={() => {}} {...props} />)
const rule = (css, selector) => new RegExp(`(?:^|\\n|,)${selector.replace(/[.[\]()]/g, '\\$&')}\\{([^}]*)\\}`).exec(css)?.[1] ?? ''

beforeEach(() => {
  localStorage.clear()
  document.cookie = 'efolusi_theme=; Path=/; Max-Age=0'
  document.documentElement.removeAttribute('data-theme')
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
})
afterEach(() => { delete window.matchMedia })

describe('the foot, from the top: theme row, sign-out row, one account card', () => {
  it('has the three parts in that order, below the nav', () => {
    const { container } = rail()
    const foot = container.querySelector('[data-slot="sidenav-foot"]')
    expect(foot).not.toBeNull()
    const order = [...foot.querySelectorAll('[data-slot="sidenav-theme"],[data-slot="sidenav-sign-out"],[data-slot="account-card"]')].map((n) => n.getAttribute('data-slot'))
    expect(order).toEqual(['sidenav-theme', 'sidenav-sign-out', 'account-card'])
    expect(container.querySelector('nav').compareDocumentPosition(foot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(foot.querySelectorAll('[data-slot="account-card"]')).toHaveLength(1)
  })

  it('shows nothing when neither an account nor a sign-out is given', () => {
    const { container } = render(<SideNav groups={groups} value="home" />)
    expect(container.querySelector('[data-slot="sidenav-foot"]')).toBeNull()
  })

  it('labels both rows with words, not icons alone, in the nav row style', () => {
    rail({ lang: 'id' })
    const theme = screen.getByRole('button', { name: 'Tema: Terang' })
    const out = screen.getByRole('button', { name: 'Keluar' })
    for (const row of [theme, out]) {
      expect(row.className).toBe('ef-sidenav__item')
      expect(row.querySelector('.ef-sidenav__label').textContent).toBeTruthy()
    }
    expect(theme.querySelector('.ef-sidenav__label').textContent).toBe('Tema')
    expect(theme.querySelector('.ef-sidenav__state').textContent).toBe('Terang')
  })

  it('speaks English by default and lets a product override a word', () => {
    rail({ labels: { signOut: 'Log out' } })
    expect(screen.getByRole('button', { name: 'Theme: Light' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Log out' })).toBeTruthy()
  })

  it('calls onSignOut from the sign-out row only', () => {
    const onSignOut = vi.fn()
    rail({ onSignOut })
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(onSignOut).toHaveBeenCalledTimes(1)
  })

  it('leaves the sign-out row out when there is no handler', () => {
    rail({ onSignOut: undefined })
    expect(screen.queryByRole('button', { name: 'Sign out' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Theme: Light' })).toBeTruthy()
  })
})

describe('the theme row is a labelled row on the one theme contract', () => {
  it('flips the theme, the state word and the icon, and announces it politely', () => {
    const { container } = rail({ lang: 'id' })
    fireEvent.click(screen.getByRole('button', { name: 'Tema: Terang' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('efolusi-theme')).toBe('dark')
    const row = screen.getByRole('button', { name: 'Tema: Gelap' })
    expect(row.querySelector('.ef-sidenav__state').textContent).toBe('Gelap')
    expect(row.title).toBe('Ganti ke terang')
    expect(container.querySelector('[role="status"]').textContent).toBe('Tema: Gelap')
  })

  it('stays in step with a header ThemeToggle on the same page', () => {
    render(<><ThemeToggle /><SideNav groups={groups} value="home" account={account} onSignOut={() => {}} /></>)
    fireEvent.click(screen.getByRole('button', { name: 'Theme: Light' }))
    expect(document.querySelector('[data-slot="theme-toggle"]').getAttribute('data-theme-shown')).toBe('dark')
    expect(screen.getByRole('button', { name: 'Theme: Dark' })).toBeTruthy()
  })

  it('is not a second toggle style: no ef-theme-toggle class, and the header toggle keeps no border', () => {
    const { container } = rail()
    expect(container.querySelector('.ef-theme-toggle')).toBeNull()
    const toggle = cssOf('components/marketing/ThemeToggle.jsx')
    expect(rule(toggle, '.ef-theme-toggle')).toMatch(/border:0/)
  })
})

describe('the account card', () => {
  it('is one bordered card on the card surface, static, not a control', () => {
    const { container } = rail()
    const card = container.querySelector('[data-slot="account-card"]')
    expect(card.tagName).toBe('DIV')
    expect(card.querySelector('button,a')).toBeNull()
    const css = rule(cardCss, '.ef-account-card')
    expect(css).toMatch(/border:1px solid var\(--border-default\)/)
    expect(css).toMatch(/background:var\(--surface-card\)/)
    expect(within(card).getByText('Ada Obi')).toBeTruthy()
    expect(within(card).getByText('ada@example.com')).toBeTruthy()
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
})

describe('the collapsed rail', () => {
  it('keeps every row named: nav items, theme, sign-out, and the card text', () => {
    const { container } = rail({ collapsed: true })
    expect(container.querySelector('aside').hasAttribute('data-collapsed')).toBe(true)
    for (const name of ['Overview', 'Runs 3', 'Settings', 'Theme: Light', 'Sign out']) {
      expect(screen.getByRole('button', { name })).toBeTruthy()
    }
    expect(container.querySelector('[data-slot="account-card"]').hasAttribute('data-compact')).toBe(true)
    expect(screen.getByText('Ada Obi')).toBeTruthy()
    expect(screen.getByText('ada@example.com')).toBeTruthy()
  })

  it('gives each icon-only row a tooltip and marks a row with a count', () => {
    rail({ collapsed: true })
    expect(screen.getByRole('button', { name: 'Overview' }).title).toBe('Overview')
    expect(screen.getByRole('button', { name: 'Sign out' }).title).toBe('Sign out')
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
    expect(container.querySelectorAll('button')).toHaveLength(5)
  })
})

describe('rows keep the touch target and the focus ring', () => {
  it('uses one row rule for nav and foot, 44px at a coarse pointer', () => {
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
