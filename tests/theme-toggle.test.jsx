import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { ThemeToggle, themeInitScript, readThemePreference, writeThemePreference } from '../components/marketing/ThemeToggle.jsx';

function fakeMedia(dark) {
  const listeners = new Set();
  const mq = { get matches() { return state.dark; }, addEventListener: (_, f) => listeners.add(f), removeEventListener: (_, f) => listeners.delete(f) };
  const state = { dark };
  window.matchMedia = () => mq;
  return { set(v) { state.dark = v; listeners.forEach((f) => f()); }, listeners };
}
const clearCookie = () => { document.cookie = 'efolusi_theme=; Path=/; Max-Age=0'; };

beforeEach(() => { clearCookie(); localStorage.clear(); document.documentElement.removeAttribute('data-theme'); });
afterEach(() => { delete window.matchMedia; });

describe('themeInitScript', () => {
  it('reads the cookie first, then localStorage, then the system preference', () => {
    fakeMedia(true);
    localStorage.setItem('efolusi-theme', 'light');
    document.cookie = 'efolusi_theme=dark; Path=/';
    new Function(themeInitScript())();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    clearCookie();
    new Function(themeInitScript())();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    localStorage.clear();
    new Function(themeInitScript())();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

describe('theme preference storage', () => {
  it('round-trips through the cookie and mirrors to localStorage', () => {
    for (const v of ['light', 'dark', 'system']) {
      writeThemePreference(v);
      expect(document.cookie).toContain(`efolusi_theme=${v}`);
      expect(localStorage.getItem('efolusi-theme')).toBe(v);
      expect(readThemePreference()).toBe(v);
    }
  });

  it('ignores an unknown value', () => {
    document.cookie = 'efolusi_theme=purple; Path=/';
    expect(readThemePreference()).toBe('system');
  });
});

describe('ThemeToggle', () => {
  it('follows the system preference live while on System, and stops on Light', () => {
    const media = fakeMedia(false);
    const { getByRole } = render(<ThemeToggle />);
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    act(() => media.set(true));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    fireEvent.click(getByRole('button'));
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(media.listeners.size).toBe(0);
    expect(readThemePreference()).toBe('light');
  });

  it('cycles Light, Dark, System with a label that names the next state, in Indonesian too', () => {
    fakeMedia(false);
    const { getByRole, rerender } = render(<ThemeToggle lang="id" />);
    const button = getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('Tema sistem, ganti ke tema terang');
    fireEvent.click(button);
    fireEvent.click(button);
    expect(button.dataset.preference).toBe('dark');
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

describe('theme contract', () => {
  it('cycles Light -> Dark -> System and back, storing the choice in the cookie', () => {
    fakeMedia(false);
    writeThemePreference('light');
    const { getByRole } = render(<ThemeToggle />);
    const button = getByRole('button');
    const seen = [];
    for (let i = 0; i < 3; i += 1) { fireEvent.click(button); seen.push(readThemePreference()); }
    expect(seen).toEqual(['dark', 'system', 'light']);
    expect(document.cookie).toContain('efolusi_theme=light');
  });

  it('lets the cookie win over the localStorage mirror', () => {
    localStorage.setItem('efolusi-theme', 'dark');
    document.cookie = 'efolusi_theme=system; Path=/';
    expect(readThemePreference()).toBe('system');
  });
});
