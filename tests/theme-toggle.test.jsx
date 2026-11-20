import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { ThemeToggle, themeInitScript, readThemePreference, writeThemePreference, writeThemeCookie } from '../components/marketing/ThemeToggle.jsx';

// The theme contract (guidelines/theming.md): localStorage efolusi-theme holds the choice,
// the efolusi_theme cookie holds only the resolved light|dark.
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

describe('precedence: localStorage choice, then the cookie, then the system', () => {
  it('holds before paint', () => {
    fakeMedia(false);
    document.cookie = 'efolusi_theme=dark; Path=/';
    localStorage.setItem('efolusi-theme', 'light');
    runInit();
    expect(attr()).toBeNull();
    localStorage.setItem('efolusi-theme', 'system');
    runInit();
    expect(attr()).toBeNull();
    localStorage.clear();
    runInit();
    expect(attr()).toBe('dark');
    clearCookie();
    fakeMedia(true);
    runInit();
    expect(attr()).toBe('dark');
  });

  it('holds at runtime', () => {
    document.cookie = 'efolusi_theme=dark; Path=/';
    expect(readThemePreference()).toBe('dark');
    localStorage.setItem('efolusi-theme', 'system');
    expect(readThemePreference()).toBe('system');
    localStorage.clear();
    clearCookie();
    expect(readThemePreference()).toBe('system');
  });

  it('ignores a cookie that is not dark or light', () => {
    fakeMedia(false);
    document.cookie = 'efolusi_theme=system; Path=/';
    expect(readThemePreference()).toBe('system');
    runInit();
    expect(attr()).toBeNull();
  });
});

describe('the cookie', () => {
  it('stores the choice in localStorage and only the resolved theme in the cookie, never system', () => {
    fakeMedia(true);
    expect(writeThemePreference('system')).toBe('system');
    expect(localStorage.getItem('efolusi-theme')).toBe('system');
    expect(cookie()).toBe('dark');
    writeThemePreference('light');
    expect(cookie()).toBe('light');
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
  it('cycles Light, Dark, System and back to Light; light removes the attribute', () => {
    fakeMedia(false);
    localStorage.setItem('efolusi-theme', 'light');
    const { getByRole } = render(<ThemeToggle />);
    const button = getByRole('button');
    const seen = [];
    for (let i = 0; i < 3; i += 1) { fireEvent.click(button); seen.push([readThemePreference(), attr()]); }
    expect(seen).toEqual([['dark', 'dark'], ['system', null], ['light', null]]);
  });

  it('in System, re-resolves on a system change and rewrites the cookie', () => {
    const media = fakeMedia(false);
    localStorage.setItem('efolusi-theme', 'system');
    const { getByRole } = render(<ThemeToggle />);
    expect(attr()).toBeNull();
    act(() => media.set(true));
    expect(attr()).toBe('dark');
    expect(cookie()).toBe('dark');
    fireEvent.click(getByRole('button'));
    expect(media.listeners.size).toBe(0);
  });

  it('labels the current and next state in English and Indonesian', () => {
    fakeMedia(false);
    const { getByRole, rerender } = render(<ThemeToggle lang="id" />);
    const button = getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('Tema sistem, ganti ke tema terang');
    fireEvent.click(button);
    fireEvent.click(button);
    rerender(<ThemeToggle lang="en" />);
    expect(button.getAttribute('aria-label')).toBe('Dark theme, switch to system theme');
  });

  it('is a 44px tap target', () => {
    fakeMedia(false);
    render(<ThemeToggle />);
    const css = document.getElementById('ef-css-theme-toggle').textContent;
    expect(css).toMatch(/\.ef-theme-toggle\{[^}]*width:var\(--tap-min\);height:var\(--tap-min\)/);
  });
});

describe('ThemeToggle instances stay in step (MD13)', () => {
  it('updates the other toggle on the page when one cycles', () => {
    fakeMedia(false);
    localStorage.setItem('efolusi-theme', 'light');
    const { getAllByRole } = render(<><ThemeToggle /><ThemeToggle lang="id" /></>);
    const [en, id] = getAllByRole('button');
    fireEvent.click(en);
    expect(en.dataset.preference).toBe('dark');
    expect(id.dataset.preference).toBe('dark');
    expect(id.getAttribute('aria-label')).toBe('Tema gelap, ganti ke tema sistem');
  });

  it('follows a choice made in another tab through the storage event', () => {
    fakeMedia(false);
    localStorage.setItem('efolusi-theme', 'light');
    const { getByRole } = render(<ThemeToggle />);
    localStorage.setItem('efolusi-theme', 'system');
    act(() => { window.dispatchEvent(new StorageEvent('storage', { key: 'efolusi-theme' })); });
    expect(getByRole('button').dataset.preference).toBe('system');
  });
});
