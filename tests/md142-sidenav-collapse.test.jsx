import { readFileSync } from 'node:fs'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { SideNav } from '../components/navigation/SideNav.jsx'

// MD142 (owner, 2026-11-28): the rail head holds the brand and ONE icon button that collapses and expands the rail.
// Collapsed shows tooltips on hover and focus, the width animates by house tokens (not under reduced motion), the
// choice is stored per viewer and restored before the first paint, a phone never collapses, and the head has no tag.
const sideCss = /const CSS = `([\s\S]*?)`;/.exec(readFileSync('components/navigation/SideNav.jsx', 'utf8'))[1]
const rule = (css, selector) => new RegExp(`(?:^|\\n|,)${selector.replace(/[.[\]()]/g, '\\$&')}\\{([^}]*)\\}`).exec(css)?.[1] ?? ''
const groups = [{ items: [{ id: 'home', label: 'Overview', icon: 'house' }, { id: 'runs', label: 'Runs', icon: 'bot', badge: 3 }] }]
const account = { name: 'Ada Obi', email: 'ada@example.com' }
const KEY = 'efolusi-sidenav-collapsed'
const rail = (props = {}) => render(<SideNav groups={groups} value="home" account={account} {...props} />)
const toggle = () => screen.getByRole('button', { name: /sidebar$/i })
let phone = false

beforeEach(() => {
  localStorage.clear()
  phone = false
  window.matchMedia = (q) => ({ matches: q.includes('max-width:767px') ? phone : false, addEventListener() {}, removeEventListener() {} })
})
afterEach(() => { delete window.matchMedia })

describe('the head button', () => {
  it('is the one control in the head, a button that says what a press does and controls the rail', () => {
    const { container } = rail()
    const head = container.querySelector('.ef-sidenav__brand')
    expect(head.querySelectorAll('button')).toHaveLength(1)
    const t = within(head).getByRole('button')
    expect(t.getAttribute('aria-label')).toBe('Collapse sidebar')
    expect(t.getAttribute('aria-expanded')).toBe('true')
    expect(t.getAttribute('aria-controls')).toBe(container.querySelector('aside').id)
    expect(t.querySelector('[data-slot="icon"]')).not.toBeNull()
  })

  it('collapses and expands, flipping aria-expanded and the label, and keeps focus on the same button', () => {
    const { container } = rail()
    const aside = container.querySelector('aside')
    toggle().focus()
    const before = toggle()
    fireEvent.click(before)
    expect(aside.hasAttribute('data-collapsed')).toBe(true)
    expect(toggle()).toBe(before)
    expect(toggle().getAttribute('aria-expanded')).toBe('false')
    expect(toggle().getAttribute('aria-label')).toBe('Expand sidebar')
    expect(document.activeElement).toBe(before)
    fireEvent.click(toggle())
    expect(aside.hasAttribute('data-collapsed')).toBe(false)
    expect(toggle().getAttribute('aria-label')).toBe('Collapse sidebar')
  })

  it('is a native button, so Enter and Space press it', () => {
    rail()
    expect(toggle().tagName).toBe('BUTTON')
    expect(toggle().getAttribute('type')).toBe('button')
  })

  it('speaks Indonesian with lang="id" and takes labels', () => {
    const { unmount } = rail({ lang: 'id' })
    expect(screen.getByRole('button', { name: 'Ciutkan sidebar' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Ciutkan sidebar' }))
    expect(screen.getByRole('button', { name: 'Perluas sidebar' })).toBeTruthy()
    unmount()
    rail({ labels: { collapse: 'Fold' } })
    expect(screen.getByRole('button', { name: 'Fold' })).toBeTruthy()
  })

  it('has no section tag by default and hides one that is given while collapsed', () => {
    const { container, unmount } = rail()
    expect(container.querySelector('.ef-sidenav__badge')).toBeNull()
    unmount()
    const r = rail({ brandBadge: 'Console' })
    expect(r.container.querySelector('.ef-sidenav__brand .ef-sidenav__badge').textContent).toBe('Console')
    expect(sideCss).toMatch(/\.ef-sidenav\[data-collapsed\] \.ef-sidenav__brand \.ef-sidenav__badge/)
  })

  it('is left out with collapsible={false}, and when controlled without a handler', () => {
    const a = rail({ collapsible: false })
    expect(screen.queryByRole('button', { name: /sidebar$/i })).toBeNull()
    a.unmount()
    const b = rail({ collapsed: true })
    expect(screen.queryByRole('button', { name: /sidebar$/i })).toBeNull()
    expect(b.container.querySelectorAll('button')).toHaveLength(3)
  })

  it('has a 32px target, 44px at a coarse pointer, a focus ring and hover only where hover exists', () => {
    expect(rule(sideCss, '.ef-sidenav__toggle')).toMatch(/width:var\(--control-h-sm-plus\);height:var\(--control-h-sm-plus\)/)
    expect(sideCss).toMatch(/@media \(pointer:coarse\)\{[^@]*\.ef-sidenav__toggle\{width:var\(--tap-min\);height:var\(--tap-min\)\}/)
    expect(rule(sideCss, '.ef-sidenav__toggle:focus-visible')).toMatch(/box-shadow:var\(--focus-ring\)/)
    expect(sideCss.replace(/@media \(hover:hover\)\{[^}]*\}\}?/g, '')).not.toMatch(/\.ef-sidenav__toggle:hover/)
  })
})

describe('controlled', () => {
  it('follows collapsed and reports the request through onCollapsedChange without changing itself', () => {
    const onCollapsedChange = vi.fn()
    const { container, rerender } = rail({ collapsed: false, onCollapsedChange })
    fireEvent.click(toggle())
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
    expect(container.querySelector('aside').hasAttribute('data-collapsed')).toBe(false)
    rerender(<SideNav groups={groups} value="home" account={account} collapsed onCollapsedChange={onCollapsedChange} />)
    expect(container.querySelector('aside').hasAttribute('data-collapsed')).toBe(true)
    expect(localStorage.getItem(KEY)).toBeNull()
  })
})

describe('tooltips on the collapsed rail', () => {
  it('shows each row name on hover and on focus, and none while expanded', () => {
    rail({ collapsed: true, onCollapsedChange() {} })
    const row = screen.getByRole('button', { name: 'Overview' })
    fireEvent.mouseEnter(row)
    expect(screen.getByRole('tooltip').textContent).toBe('Overview')
    fireEvent.mouseLeave(row)
    expect(screen.queryByRole('tooltip')).toBeNull()
    fireEvent.focus(row)
    expect(screen.getByRole('tooltip').textContent).toBe('Overview')
    expect(row.getAttribute('aria-describedby')).toBe(screen.getByRole('tooltip').id)
    fireEvent.blur(row)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('does not tooltip while expanded', () => {
    rail()
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Overview' }))
    fireEvent.focus(screen.getByRole('button', { name: 'Runs 3' }))
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('tooltips the head button in both states with what a press does', () => {
    rail()
    fireEvent.focus(toggle())
    expect(screen.getByRole('tooltip').textContent).toBe('Collapse sidebar')
    fireEvent.blur(toggle())
    fireEvent.click(toggle())
    fireEvent.focus(toggle())
    expect(screen.getByRole('tooltip').textContent).toBe('Expand sidebar')
  })
})

describe('motion', () => {
  it('animates the width by house tokens, only once ready, and not under reduced motion', () => {
    expect(rule(sideCss, '.ef-sidenav[data-ready]')).toMatch(/transition:width var\(--dur-slow\) var\(--ease-standard\)/)
    expect(sideCss).toMatch(/@media \(prefers-reduced-motion:reduce\)\{\.ef-sidenav\[data-ready\],\.ef-sidenav__toggle\{transition:none\}\}/)
    expect(sideCss).not.toMatch(/transition:[^;}]*\ball\b/)
  })

  it('clips the rail while the width moves, so no label spills out', () => {
    expect(rule(sideCss, '.ef-sidenav')).toMatch(/overflow:hidden/)
  })

  it('turns ready only after the first frames, so a restored rail never animates into place', async () => {
    vi.useFakeTimers()
    const raf = globalThis.requestAnimationFrame
    globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 16)
    try {
      const { container } = rail()
      const aside = container.querySelector('aside')
      expect(aside.hasAttribute('data-ready')).toBe(false)
      await act(async () => { vi.advanceTimersByTime(40) })
      expect(aside.hasAttribute('data-ready')).toBe(true)
    } finally {
      globalThis.requestAnimationFrame = raf
      vi.useRealTimers()
    }
  })
})

describe('the stored choice', () => {
  it('stores each press per viewer under the default key', () => {
    rail()
    fireEvent.click(toggle())
    expect(localStorage.getItem(KEY)).toBe('1')
    fireEvent.click(toggle())
    expect(localStorage.getItem(KEY)).toBe('0')
  })

  it('restores a stored collapse in the first committed frame, with the width transition still off', () => {
    localStorage.setItem(KEY, '1')
    const seen = []
    const Probe = () => { React.useLayoutEffect(() => { seen.push(document.querySelector('aside').hasAttribute('data-collapsed')) }); return null }
    const { container } = render(<><SideNav groups={groups} value="home" account={account} /><Probe /></>)
    expect(container.querySelector('aside').hasAttribute('data-collapsed')).toBe(true)
    expect(seen.at(-1)).toBe(true)
    expect(container.querySelector('aside').hasAttribute('data-ready')).toBe(false)
  })

  it('lets a stored expand beat defaultCollapsed, and defaultCollapsed apply when nothing is stored', () => {
    localStorage.setItem(KEY, '0')
    const a = rail({ defaultCollapsed: true })
    expect(a.container.querySelector('aside').hasAttribute('data-collapsed')).toBe(false)
    a.unmount()
    localStorage.clear()
    const b = rail({ defaultCollapsed: true })
    expect(b.container.querySelector('aside').hasAttribute('data-collapsed')).toBe(true)
  })

  it('uses a storageKey of its own, and stores nothing with null', () => {
    const a = rail({ storageKey: 'my-rail' })
    fireEvent.click(toggle())
    expect(localStorage.getItem('my-rail')).toBe('1')
    expect(localStorage.getItem(KEY)).toBeNull()
    a.unmount()
    rail({ storageKey: null })
    fireEvent.click(toggle())
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('still works when storage is blocked', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    try {
      const { container } = rail()
      fireEvent.click(toggle())
      expect(container.querySelector('aside').hasAttribute('data-collapsed')).toBe(true)
    } finally { get.mockRestore(); set.mockRestore() }
  })
})

describe('a phone', () => {
  it('draws no button and never collapses an uncontrolled rail, even with a stored choice', () => {
    phone = true
    localStorage.setItem(KEY, '1')
    const { container } = rail()
    expect(screen.queryByRole('button', { name: /sidebar$/i })).toBeNull()
    expect(container.querySelector('aside').hasAttribute('data-collapsed')).toBe(false)
  })
})
