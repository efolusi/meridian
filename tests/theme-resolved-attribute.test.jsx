import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, render } from '@testing-library/react';
import { ThemeToggle, themeInitScript, applyTheme } from '../components/marketing/ThemeToggle.jsx';
import { init } from '../browser/marketing.js';

// MD23 (#192): data-theme is always light or dark. Light never removes the attribute,
// so a dark device cannot turn a Light choice dark.
const attr = () => document.documentElement.getAttribute('data-theme');
const cookie = () => (document.cookie.match(/(?:^|;\s*)efolusi_theme=([^;]*)/) || [])[1];
function fakeMedia(dark) {
  const state = { dark };
  const listeners = new Set();
  const mq = { get matches() { return state.dark; }, addEventListener: (_, f) => listeners.add(f), removeEventListener: (_, f) => listeners.delete(f) };
  window.matchMedia = () => mq;
  return { set(v) { state.dark = v; listeners.forEach((f) => f()); } };
}

beforeEach(() => {
  document.cookie = 'efolusi_theme=; Path=/; Max-Age=0';
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});
afterEach(() => { delete window.matchMedia; });

// The three runtimes share one contract: the pre-paint script, the plain browser script,
// and the React toggle.
const runtimes = {
  'pre-paint script': { start: () => { new Function(themeInitScript())(); return () => {}; }, follows: false },
  'plain browser script': { start: () => init(), follows: true },
  'React ThemeToggle': {
    start: () => { const view = render(<ThemeToggle />); return () => view.unmount(); },
    follows: true,
  },
};

describe.each(Object.entries(runtimes))('%s', (_name, { start, follows }) => {
  it('Light on a dark OS gives data-theme="light"', async () => {
    fakeMedia(true);
    localStorage.setItem('efolusi-theme', 'light');
    let stop;
    await act(async () => { stop = start(); });
    expect(attr()).toBe('light');
    stop();
  });

  it('Dark on a light OS gives data-theme="dark"', async () => {
    fakeMedia(false);
    localStorage.setItem('efolusi-theme', 'dark');
    let stop;
    await act(async () => { stop = start(); });
    expect(attr()).toBe('dark');
    stop();
  });

  it('with no choice and no cookie, the device decides and nothing is stored', async () => {
    const os = fakeMedia(true);
    let stop;
    await act(async () => { stop = start(); });
    expect(attr()).toBe('dark');
    expect(cookie()).toBeUndefined();
    if (follows) {
      await act(async () => { os.set(false); });
      expect(attr()).toBe('light');
      expect(cookie()).toBeUndefined();
    }
    stop();
  });

  it('with no saved choice, the inherited cookie decides, else the OS', async () => {
    fakeMedia(false);
    document.cookie = 'efolusi_theme=dark; Path=/';
    let stop;
    await act(async () => { stop = start(); });
    expect(attr()).toBe('dark');
    stop();

    document.cookie = 'efolusi_theme=; Path=/; Max-Age=0';
    document.documentElement.removeAttribute('data-theme');
    fakeMedia(true);
    await act(async () => { stop = start(); });
    expect(attr()).toBe('dark');
    stop();

    document.documentElement.removeAttribute('data-theme');
    fakeMedia(false);
    await act(async () => { stop = start(); });
    expect(attr()).toBe('light');
    stop();
  });
});

describe('applyTheme', () => {
  it('sets light and dark, and never removes the attribute', () => {
    fakeMedia(true);
    expect(applyTheme('light')).toBe('light');
    expect(attr()).toBe('light');
    expect(applyTheme('dark')).toBe('dark');
    expect(attr()).toBe('dark');
    expect(applyTheme(null)).toBe('dark');
    expect(attr()).toBe('dark');
  });
});
