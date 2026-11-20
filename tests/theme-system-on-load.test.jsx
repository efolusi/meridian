import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeToggle, themeInitScript } from '../components/marketing/ThemeToggle.jsx';
import { init } from '../browser/marketing.js';

// MD22 (#188): with the choice on System, a page load re-resolves the theme and rewrites
// the efolusi_theme cookie, so other subdomains do not inherit a stale value.
const cookie = () => (document.cookie.match(/(?:^|;\s*)efolusi_theme=([^;]*)/) || [])[1];
const media = (dark) => { window.matchMedia = () => ({ matches: dark, addEventListener() {}, removeEventListener() {} }); };

beforeEach(() => {
  document.cookie = 'efolusi_theme=; Path=/; Max-Age=0';
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});
afterEach(() => { delete window.matchMedia; });

describe('System on page load', () => {
  it('the pre-paint script rewrites a stale cookie', () => {
    media(false);
    localStorage.setItem('efolusi-theme', 'system');
    document.cookie = 'efolusi_theme=dark; Path=/';
    new Function(themeInitScript())();
    expect(cookie()).toBe('light');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('the pre-paint script leaves an inherited cookie alone when there is no choice here', () => {
    media(false);
    document.cookie = 'efolusi_theme=dark; Path=/';
    new Function(themeInitScript())();
    expect(cookie()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('the plain script rewrites it on init', () => {
    media(true);
    localStorage.setItem('efolusi-theme', 'system');
    document.cookie = 'efolusi_theme=light; Path=/';
    const undo = init();
    expect(cookie()).toBe('dark');
    undo();
  });

  it('the React toggle rewrites it on mount', () => {
    media(true);
    localStorage.setItem('efolusi-theme', 'system');
    document.cookie = 'efolusi_theme=light; Path=/';
    render(<ThemeToggle />);
    expect(cookie()).toBe('dark');
  });
});
