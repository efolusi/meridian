import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { ThemeToggle, themeInitScript, readThemePreference, writeThemePreference, writeThemeCookie } from '../components/marketing/ThemeToggle.jsx';

// The theme contract (guidelines/theming.md): the switch offers light and dark only.
// localStorage efolusi-theme holds the person's choice, written only when they switch;
// the efolusi_theme cookie holds that choice for other Efolusi sites.
function fakeMedia(dark) {
  const state = { dark };
  const listeners = new Set();
  const mq = { get matches() { return state.dark; }, addEventListener: (_, f) => listeners.add(f), removeEventListener: (_, f) => listeners.delete(f) };
  window.matchMedia = () => mq;
  return { set(v) { state.dark = v; listeners.forEach((f) => f()); }, listeners };
}
const clearCookie = () => { document.cookie = 'efolusi_theme=; Path=/; Max-Age=0'; };
const cookie = () => (document.cookie.match(/(?:^|;\s*)efolusi_theme=([^;]*)/) || [])[1];
const attr = () => document.documentElement.getAttribute('data-theme');
const runInit = () => new Function(themeInitScript())();

beforeEach(() => { clearCookie(); localStorage.clear(); document.documentElement.removeAttribute('data-theme'); });
afterEach(() => { delete window.matchMedia; });

describe('precedence: stored choice, then the cookie, then the device', () => {
  it('holds before paint, and the script stores nothing', () => {
    fakeMedia(false);
    document.cookie = 'efolusi_theme=dark; Path=/';
    localStorage.setItem('efolusi-theme', 'light');
    runInit();
    expect(attr()).toBe('light');
    localStorage.clear();
    runInit();
    expect(attr()).toBe('dark');
    clearCookie();
    fakeMedia(true);
    runInit();
    expect(attr()).toBe('dark');
    expect(cookie()).toBeUndefined();
    expect(localStorage.getItem('efolusi-theme')).toBeNull();
  });

  it('holds at runtime: no choice reads as null', () => {
    document.cookie = 'efolusi_theme=dark; Path=/';
    expect(readThemePreference()).toBe('dark');
    localStorage.setItem('efolusi-theme', 'light');
    expect(readThemePreference()).toBe('light');
    localStorage.clear();
    clearCookie();
    expect(readThemePreference()).toBeNull();
  });

  it('ignores a cookie that is not dark or light', () => {
    fakeMedia(false);
    document.cookie = 'efolusi_theme=system; Path=/';
    expect(readThemePreference()).toBeNull();
    runInit();
    expect(attr()).toBe('light');
  });
});

describe('a "system" value stored by an earlier release', () => {
  it('is read as no choice and removed once, by the reader', () => {
    localStorage.setItem('efolusi-theme', 'system');
    expect(readThemePreference()).toBeNull();
    expect(localStorage.getItem('efolusi-theme')).toBeNull();
  });

  it('is read as no choice and removed once, by the pre-paint script, which paints the device theme', () => {
    fakeMedia(true);
    localStorage.setItem('efolusi-theme', 'system');
    runInit();
    expect(attr()).toBe('dark');
    expect(localStorage.getItem('efolusi-theme')).toBeNull();
  });
});

describe('the cookie', () => {
  it('writeThemePreference stores light or dark in both places and refuses anything else', () => {
    expect(writeThemePreference('dark')).toBe('dark');
    expect(localStorage.getItem('efolusi-theme')).toBe('dark');
    expect(cookie()).toBe('dark');
    expect(writeThemePreference('system')).toBeNull();
    expect(localStorage.getItem('efolusi-theme')).toBe('dark');
    writeThemeCookie('system');
    expect(cookie()).toBe('light');
  });

  it('sets Domain=.efolusi.com only on efolusi.com hosts, with Path, a year, SameSite=Lax and Secure on https', () => {
    const fakeDoc = (hostname, protocol) => ({ location: { hostname, protocol }, cookie: '' });
    for (const [host, scoped] of [['efolusi.com', true], ['my.efolusi.com', true], ['notefolusi.com', false], ['localhost', false]]) {
      const d = fakeDoc(host, 'https:');
      writeThemeCookie('dark', d);
      expect(d.cookie.includes('Domain=.efolusi.com'), host).toBe(scoped);
      expect(d.cookie).toMatch(/^efolusi_theme=dark; .*Path=\/; Max-Age=31536000; SameSite=Lax; Secure$/);
    }
    const plain = fakeDoc('localhost', 'http:');
    writeThemeCookie('light', plain);
    expect(plain.cookie).not.toContain('Secure');
  });
});

describe('ThemeToggle', () => {
  it('shows the theme in use, says the action, and stores nothing until the person switches', () => {
    fakeMedia(true);
    const { getByRole } = render(<ThemeToggle />);
    const button = getByRole('button');
    expect(attr()).toBe('dark');
    expect(button.dataset.themeShown).toBe('dark');
    expect(button.getAttribute('aria-label')).toBe('Switch to light theme');
    expect(localStorage.getItem('efolusi-theme')).toBeNull();
    expect(cookie()).toBeUndefined();
  });

  it('flips between light and dark and keeps the choice', () => {
    fakeMedia(false);
    const { getByRole } = render(<ThemeToggle />);
    const button = getByRole('button');
    const seen = [];
    for (let i = 0; i < 3; i += 1) { fireEvent.click(button); seen.push([readThemePreference(), attr(), cookie()]); }
    expect(seen).toEqual([['dark', 'dark', 'dark'], ['light', 'light', 'light'], ['dark', 'dark', 'dark']]);
  });

  it('is operable from the keyboard: Enter and Space click a native button', () => {
    fakeMedia(false);
    const { getByRole } = render(<ThemeToggle />);
    const button = getByRole('button');
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('follows the device live while there is no choice, and writes no cookie', () => {
    const media = fakeMedia(false);
    const { getByRole } = render(<ThemeToggle />);
    expect(attr()).toBe('light');
    act(() => media.set(true));
    expect(attr()).toBe('dark');
    expect(getByRole('button').dataset.themeShown).toBe('dark');
    expect(cookie()).toBeUndefined();
  });

  it('stops following the device once the person has chosen', () => {
    const media = fakeMedia(false);
    const { getByRole } = render(<ThemeToggle />);
    fireEvent.click(getByRole('button'));
    expect(media.listeners.size).toBe(0);
    act(() => media.set(false));
    expect(attr()).toBe('dark');
  });

  it('labels the action in English and Indonesian', () => {
    fakeMedia(false);
    const { getByRole, rerender } = render(<ThemeToggle lang="id" />);
    const button = getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('Ganti ke tema gelap');
    fireEvent.click(button);
    rerender(<ThemeToggle lang="en" />);
    expect(button.getAttribute('aria-label')).toBe('Switch to light theme');
    rerender(<ThemeToggle lang="id" />);
    expect(button.getAttribute('aria-label')).toBe('Ganti ke tema terang');
  });

  it('has no system label, icon or type', () => {
    fakeMedia(false);
    const { getByRole } = render(<ThemeToggle />);
    expect(getByRole('button').outerHTML).not.toMatch(/system|monitor/i);
  });

  it('is a 44px tap target', () => {
    fakeMedia(false);
    render(<ThemeToggle />);
    const css = document.getElementById('ef-css-theme-toggle').textContent;
    expect(css).toMatch(/\.ef-theme-toggle\{[^}]*width:var\(--tap-min\);height:var\(--tap-min\)/);
  });
});

describe('ThemeToggle instances stay in step (MD13)', () => {
  it('updates the other toggle on the page when one flips', () => {
    fakeMedia(false);
    const { getAllByRole } = render(<><ThemeToggle /><ThemeToggle lang="id" /></>);
    const [en, id] = getAllByRole('button');
    fireEvent.click(en);
    expect(en.dataset.themeShown).toBe('dark');
    expect(id.dataset.themeShown).toBe('dark');
    expect(id.getAttribute('aria-label')).toBe('Ganti ke tema terang');
  });

  it('follows a choice made in another tab through the storage event', () => {
    fakeMedia(false);
    const { getByRole } = render(<ThemeToggle />);
    localStorage.setItem('efolusi-theme', 'dark');
    act(() => { window.dispatchEvent(new StorageEvent('storage', { key: 'efolusi-theme' })); });
    expect(getByRole('button').dataset.themeShown).toBe('dark');
  });
});

describe('first frame (MD25): the stored choice is applied before the first paint', () => {
  // A sibling declared after the toggle runs its layout effect in the same commit, before the
  // browser paints and before any passive effect. What it sees in data-theme is what the first
  // frame is painted with. The icon follows in the synchronous re-render that the toggle's own
  // state update triggers, still before paint, so it is checked after the render.
  function Probe({ seen }) {
    React.useLayoutEffect(() => { seen.push(attr()); }, [seen]);
    return null;
  }
  const icon = () => document.querySelector('[data-slot="theme-toggle"]').dataset.themeShown;

  it('paints the stored choice, not the device theme, on the first frame', () => {
    fakeMedia(false);
    localStorage.setItem('efolusi-theme', 'dark');
    const seen = [];
    render(<><ThemeToggle /><Probe seen={seen} /></>);
    expect(seen).toEqual(['dark']);
    expect(icon()).toBe('dark');
  });

  it('paints the cookie choice on the first frame when nothing is stored', () => {
    fakeMedia(true);
    document.cookie = 'efolusi_theme=light; Path=/';
    const seen = [];
    render(<><ThemeToggle /><Probe seen={seen} /></>);
    expect(seen).toEqual(['light']);
    expect(icon()).toBe('light');
  });

  it('applies the stored choice first and never the device theme, even for a frame', () => {
    fakeMedia(false);
    localStorage.setItem('efolusi-theme', 'dark');
    const set = vi.spyOn(document.documentElement, 'setAttribute');
    try {
      render(<ThemeToggle />);
      const applied = set.mock.calls.filter(([name]) => name === 'data-theme').map(([, value]) => value);
      expect(applied[0]).toBe('dark');
      expect(applied.every((v) => v === 'dark')).toBe(true);
    } finally {
      set.mockRestore();
    }
  });

  it('with no choice, paints the device theme on the first frame', () => {
    fakeMedia(true);
    const seen = [];
    render(<><ThemeToggle /><Probe seen={seen} /></>);
    expect(seen).toEqual(['dark']);
    expect(icon()).toBe('dark');
  });
});
