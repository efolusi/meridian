import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { init } from '../browser/marketing.js';
import { themeInitScript } from '../components/marketing/ThemeToggle.jsx';
import { buildBrowserFiles } from '../scripts/build_browser.mjs';

// MD14 (#175): plain scripts for sites without React. The interface is the markup the
// React components render; init() wires it.
const cookie = () => (document.cookie.match(/(?:^|;\s*)efolusi_theme=([^;]*)/) || [])[1];
const attr = () => document.documentElement.getAttribute('data-theme');
function fakeMedia(dark) {
  const state = { dark };
  const listeners = new Set();
  window.matchMedia = () => ({ get matches() { return state.dark; }, addEventListener: (_, f) => listeners.add(f), removeEventListener: (_, f) => listeners.delete(f) });
  return { set(v) { state.dark = v; listeners.forEach((f) => f()); }, listeners };
}
const toggle = (lang = '') => `<button type="button" data-slot="theme-toggle" class="ef-theme-toggle"${lang ? ` lang="${lang}"` : ''}></button>`;
let cleanup = () => {};

beforeEach(() => {
  document.cookie = 'efolusi_theme=; Path=/; Max-Age=0';
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.body.innerHTML = '';
});
afterEach(() => { cleanup(); cleanup = () => {}; delete window.matchMedia; });

describe('theme toggle', () => {
  it('shows the theme in use and flips between light and dark with the contract storage and labels', () => {
    fakeMedia(false);
    document.body.innerHTML = toggle();
    cleanup = init();
    const b = document.querySelector('[data-slot="theme-toggle"]');
    expect(b.dataset.themeShown).toBe('light');
    expect(b.getAttribute('aria-label')).toBe('Switch to dark theme');
    expect([cookie(), localStorage.getItem('efolusi-theme')]).toEqual([undefined, null]);
    b.click();
    expect([b.dataset.themeShown, attr(), cookie(), localStorage.getItem('efolusi-theme')]).toEqual(['dark', 'dark', 'dark', 'dark']);
    b.click();
    expect([b.dataset.themeShown, attr(), cookie()]).toEqual(['light', 'light', 'light']);
  });

  it('speaks Indonesian when the button or page is lang="id"', () => {
    fakeMedia(false);
    document.body.innerHTML = toggle('id');
    cleanup = init();
    expect(document.querySelector('button').getAttribute('aria-label')).toBe('Ganti ke tema gelap');
  });

  it('keeps every toggle on the page in step', () => {
    fakeMedia(false);
    document.body.innerHTML = toggle() + toggle();
    cleanup = init();
    const [a, b] = document.querySelectorAll('button');
    a.click();
    expect(b.dataset.themeShown).toBe('dark');
  });

  it('follows the device live while there is no choice, and stores nothing', () => {
    const media = fakeMedia(false);
    document.body.innerHTML = toggle();
    cleanup = init();
    media.set(true);
    expect([attr(), cookie(), localStorage.getItem('efolusi-theme')]).toEqual(['dark', undefined, null]);
  });

  it('reads a stored system value as no choice and removes it', () => {
    fakeMedia(true);
    localStorage.setItem('efolusi-theme', 'system');
    document.body.innerHTML = toggle();
    cleanup = init();
    expect([attr(), localStorage.getItem('efolusi-theme')]).toEqual(['dark', null]);
  });

  it('binds once when init runs twice, and cleanup unbinds', () => {
    fakeMedia(false);
    localStorage.setItem('efolusi-theme', 'light');
    document.body.innerHTML = toggle();
    const first = init();
    const second = init();
    const b = document.querySelector('button');
    b.click();
    expect(b.dataset.themeShown).toBe('dark');
    first(); second();
    b.click();
    expect(b.dataset.themeShown).toBe('dark');
  });
});

describe('site header menu', () => {
  const header = `<header data-slot="site-header"><button type="button" class="ef-site-header__menu" aria-expanded="false" aria-controls="p1"></button><div id="p1" class="ef-site-header__panel"></div></header>`;

  it('opens and closes the panel, and Escape returns focus to the button', () => {
    document.body.innerHTML = header;
    cleanup = init();
    const button = document.querySelector('.ef-site-header__menu');
    const panel = document.getElementById('p1');
    button.click();
    expect([button.getAttribute('aria-expanded'), panel.hasAttribute('data-open')]).toEqual(['true', true]);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect([button.getAttribute('aria-expanded'), panel.hasAttribute('data-open')]).toEqual(['false', false]);
    expect(document.activeElement).toBe(button);
  });
});

describe('marquee', () => {
  const marquee = (extra = '') => `<div data-slot="marquee" class="ef-marquee"${extra}><button type="button" class="ef-marquee__pause" aria-pressed="false"></button></div>`;

  it('pauses with its button and says so in the page language', () => {
    document.body.innerHTML = marquee(' lang="id"');
    cleanup = init();
    const root = document.querySelector('[data-slot="marquee"]');
    const button = root.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Jeda daftar berjalan');
    button.click();
    expect([root.hasAttribute('data-paused'), button.getAttribute('aria-pressed'), button.getAttribute('aria-label')]).toEqual([true, 'true', 'Putar daftar berjalan']);
  });

  it('sets the loop duration through the CSSOM, never a style attribute in the markup', () => {
    document.body.innerHTML = marquee(' data-duration="20"') + marquee(' data-duration="20s;color:red"');
    cleanup = init();
    const [ok, bad] = document.querySelectorAll('[data-slot="marquee"]');
    expect(ok.style.getPropertyValue('--ef-marquee-duration')).toBe('20s');
    expect(bad.style.getPropertyValue('--ef-marquee-duration')).toBe('');
  });
});

describe('the shipped files', () => {
  const files = buildBrowserFiles();

  it('theme-init.js is themeInitScript() exactly', () => {
    expect(readFileSync('browser/theme-init.js', 'utf8')).toBe(themeInitScript());
  });

  it('are generated, current and byte-stable', () => {
    expect(buildBrowserFiles()).toEqual(files);
    for (const [name, text] of Object.entries(files)) expect(readFileSync(`browser/${name}`, 'utf8'), name).toBe(text);
  });

  it('publish sha256 hashes that match the files', () => {
    const hashes = JSON.parse(files['hashes.json']);
    for (const name of ['theme-init.js', 'theme.js', 'marketing.js']) {
      const digest = createHash('sha256').update(readFileSync(`browser/${name}`)).digest('base64');
      expect(hashes[name], name).toBe(`sha256-${digest}`);
    }
  });

  it('hold no eval, new Function, innerHTML or style attribute', () => {
    for (const name of ['theme-init.js', 'theme.js', 'marketing.js']) {
      const src = readFileSync(`browser/${name}`, 'utf8');
      expect(src, name).not.toMatch(/\beval\(|new Function|innerHTML|outerHTML|insertAdjacentHTML|setAttribute\(['"]style|\.style\s*=|style=/);
    }
  });
});

describe('labels match the React components', () => {
  it('uses the same marquee pause labels as Marquee, in both languages', async () => {
    const { render } = await import('@testing-library/react');
    const { Marquee } = await import('../components/marketing/Marquee.jsx');
    for (const lang of ['en', 'id']) {
      const { container, unmount } = render(<Marquee lang={lang} items={['a']} />);
      const reactLabel = container.querySelector('.ef-marquee__pause').getAttribute('aria-label');
      unmount();
      document.body.innerHTML = `<div data-slot="marquee" lang="${lang}"><button class="ef-marquee__pause" aria-pressed="false"></button></div>`;
      const undo = init();
      expect(document.querySelector('.ef-marquee__pause').getAttribute('aria-label'), lang).toBe(reactLabel);
      undo();
    }
  });
});

describe('content rendered after init', () => {
  it('wires a toggle and a marquee that appear later, like a re-rendered page', async () => {
    fakeMedia(false);
    localStorage.setItem('efolusi-theme', 'light');
    cleanup = init();
    document.body.innerHTML = toggle() + '<div data-slot="marquee"><button class="ef-marquee__pause" aria-pressed="false"></button></div>';
    await new Promise((r) => setTimeout(r, 0));
    const b = document.querySelector('[data-slot="theme-toggle"]');
    expect(b.getAttribute('aria-label')).toBe('Switch to dark theme');
    expect(document.querySelector('.ef-marquee__pause').getAttribute('aria-label')).toBe('Pause the moving list');
    b.click();
    expect(b.dataset.themeShown).toBe('dark');
  });
});

describe('Marquee without a style attribute (part of MD18)', () => {
  it('server-renders the duration as data, not a style attribute', async () => {
    const { renderToString } = await import('react-dom/server');
    const { Marquee } = await import('../components/marketing/Marquee.jsx');
    const html = renderToString(<Marquee items={['a']} duration={20} />);
    const rootTag = html.match(/^<div[^>]*>/)[0];
    expect(rootTag).not.toMatch(/style="/);
    expect(rootTag).toMatch(/data-duration="20"/);
  });

  it('applies the duration through the CSSOM after mount', async () => {
    const { render } = await import('@testing-library/react');
    const { Marquee } = await import('../components/marketing/Marquee.jsx');
    const { container } = render(<Marquee items={['a']} duration={20} />);
    expect(container.firstChild.style.getPropertyValue('--ef-marquee-duration')).toBe('20s');
  });
});

describe('a React ThemeToggle and marketing.js on one page', () => {
  it('moves one step per click: the plain script leaves the React button to React', async () => {
    const { render } = await import('@testing-library/react');
    const { ThemeToggle } = await import('../components/marketing/ThemeToggle.jsx');
    fakeMedia(false);
    localStorage.setItem('efolusi-theme', 'light');
    cleanup = init();
    const { getByRole } = render(<ThemeToggle />);
    const button = getByRole('button');
    expect(button.hasAttribute('data-ef-react')).toBe(true);
    button.click();
    expect(localStorage.getItem('efolusi-theme')).toBe('dark');
  });
});

describe('browser/theme.d.ts matches browser/theme.js', () => {
  it('declares every runtime export, and nothing else', async () => {
    const runtime = Object.keys(await import('../browser/theme.js')).sort();
    const dts = readFileSync('browser/theme.d.ts', 'utf8');
    const declared = [...dts.matchAll(/^export declare (?:function|const) (\w+)/gm)].map((m) => m[1]).sort();
    expect(declared).toEqual(runtime);
  });

  it('types the constants with their real values', async () => {
    const theme = await import('../browser/theme.js');
    const dts = readFileSync('browser/theme.d.ts', 'utf8');
    expect(dts).toContain(`THEME_STORAGE_KEY: '${theme.THEME_STORAGE_KEY}'`);
    expect(dts).toContain(`THEME_CHANGE_EVENT: '${theme.THEME_CHANGE_EVENT}'`);
    for (const pref of theme.THEME_PREFERENCES) expect(dts).toContain(`'${pref}'`);
    expect(Object.keys(theme.LABELS).sort()).toEqual(['en', 'id']);
    for (const lang of Object.keys(theme.LABELS)) {
      expect(Object.keys(theme.LABELS[lang]).sort()).toEqual([...theme.THEME_PREFERENCES, 'next'].sort());
    }
  });
});
