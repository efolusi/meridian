'use client';
import React from 'react';
import { injectEfCss, useIsoLayoutEffect } from '../runtime/runtime.jsx';
import { Icon } from '../icons/Icon.jsx';

// One theme control for every Efolusi site; the contract is guidelines/theming.md (Theme contract).
// The switch offers light and dark only. localStorage holds this origin's choice, written
// only when the person switches; until then the page shows the device's theme. The cookie on
// .efolusi.com holds that choice too, so a first visit to another Efolusi site inherits it;
// every product parses that cookie as dark|light.
// theme-contract:start (scripts/build_browser.mjs copies this block to browser/theme.js)
const THEME_COOKIE = 'efolusi_theme';
const THEME_STORAGE_KEY = 'efolusi-theme';
const THEME_CHANGE_EVENT = 'efolusi-theme-change';
const THEME_SWITCHING_ATTRIBUTE = 'data-theme-switching';
const THEME_PREFERENCES = ['light', 'dark'];
const YEAR = 60 * 60 * 24 * 365;

const LABELS = {
  en: { light: 'Light theme', dark: 'Dark theme', next: 'Switch to' },
  id: { light: 'Tema terang', dark: 'Tema gelap', next: 'Ganti ke' },
};

const valid = (v) => (THEME_PREFERENCES.includes(v) ? v : null);

/** The localStorage choice, then the cookie (dark|light), else null: no choice, so the device decides. */
export function readThemePreference(doc = globalThis.document, storage = globalThis.localStorage) {
  try {
    const stored = storage?.getItem(THEME_STORAGE_KEY);
    const choice = valid(stored);
    if (choice) return choice;
    // An earlier release stored `system`. That is no choice now: drop it once.
    if (stored === 'system') storage.removeItem(THEME_STORAGE_KEY);
  } catch {
    /* storage blocked: fall back to the cookie */
  }
  const m = doc?.cookie?.match(/(?:^|;\s*)efolusi_theme=(dark|light)(?:;|$)/);
  return m ? m[1] : null;
}

/** `light` or `dark` for a choice; with no choice, the device's theme. */
export function resolveTheme(pref, matchMedia = globalThis.matchMedia) {
  if (pref === 'light' || pref === 'dark') return pref;
  return matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Writes light|dark to the cookie. */
export function writeThemeCookie(theme, doc = globalThis.document) {
  if (!doc) return;
  const host = doc.location?.hostname || '';
  const domain = host === 'efolusi.com' || host.endsWith('.efolusi.com') ? '; Domain=.efolusi.com' : '';
  const secure = doc.location?.protocol === 'https:' ? '; Secure' : '';
  doc.cookie = `${THEME_COOKIE}=${theme === 'dark' ? 'dark' : 'light'}${domain}; Path=/; Max-Age=${YEAR}; SameSite=Lax${secure}`;
}

/** Saves the person's choice (light or dark) in localStorage and the cookie. Anything else is refused and returns null. */
export function writeThemePreference(value, doc = globalThis.document, storage = globalThis.localStorage) {
  const pref = valid(value);
  if (!pref) return null;
  try {
    storage?.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    /* storage blocked: the cookie still carries the choice */
  }
  writeThemeCookie(pref, doc);
  // Every ThemeToggle on the page re-reads the choice (a header renders its actions twice).
  doc?.defaultView?.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: pref }));
  return pref;
}

export function applyTheme(pref, doc = globalThis.document, matchMedia = globalThis.matchMedia) {
  const theme = resolveTheme(pref, matchMedia);
  // data-theme is always light or dark, so a dark device cannot turn a Light choice dark;
  // the media rule in tokens/colors.css stays as the no-JS fallback only.
  doc?.documentElement?.setAttribute('data-theme', theme);
  return theme;
}

/**
 * Runs a theme swap with every transition off. A swap changes every colour at once, and each element with a colour
 * transition would start one (46 on the docs Components page): the page smears. tokens/base.css turns transitions
 * off while <html> carries data-theme-switching; this sets it, runs the swap, flushes the style so the new colours
 * land with transitions off, and removes it after two animation frames. Returns what the swap returns.
 */
export function swapTheme(swap, doc = globalThis.document) {
  const root = doc?.documentElement;
  if (!root) return swap();
  root.setAttribute(THEME_SWITCHING_ATTRIBUTE, '');
  try {
    return swap();
  } finally {
    void root.offsetHeight;
    const win = doc.defaultView;
    const frame = (cb) => (win?.requestAnimationFrame ? win.requestAnimationFrame(cb) : setTimeout(cb, 16));
    frame(() => frame(() => root.removeAttribute(THEME_SWITCHING_ATTRIBUTE)));
  }
}

/** Inline this in <head>, before any stylesheet paints, so the first frame has the right theme. It stores nothing. */
export function themeInitScript() {
  return `(function(){try{var s=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light',c=null,t;try{c=localStorage.getItem('${THEME_STORAGE_KEY}');if(c==='system'){localStorage.removeItem('${THEME_STORAGE_KEY}');c=null}}catch(e){}if(c==='light'||c==='dark')t=c;else{var m=document.cookie.match(/(?:^|;\\s*)${THEME_COOKIE}=(dark|light)(?:;|$)/);t=m?m[1]:s}document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;
}
// theme-contract:end

const ICONS = { light: 'sun', dark: 'moon' };

const CSS = `
.ef-theme-toggle{display:inline-flex;align-items:center;justify-content:center;flex:none;width:var(--tap-min);height:var(--tap-min);padding:0;border-radius:var(--radius-full);color:var(--text-secondary);cursor:pointer;transition:background var(--dur-fast) var(--ease-enter),color var(--dur-fast) var(--ease-enter)}
.ef-theme-toggle:hover{background:var(--surface-sunken);color:var(--text-primary)}
.ef-theme-toggle:focus-visible{outline:2px solid transparent;box-shadow:var(--focus-ring)}
.ef-theme-toggle [data-theme-icon]{display:none}
.ef-theme-toggle[data-theme-shown="light"] [data-theme-icon="light"],.ef-theme-toggle[data-theme-shown="dark"] [data-theme-icon="dark"]{display:inline-flex}
@media (prefers-reduced-motion:reduce){.ef-theme-toggle{transition:none}}
`;

export const ThemeToggle = React.forwardRef(function ThemeToggle({ lang = 'en', labels, className, onChange, ...rest }, ref) {
  injectEfCss('ef-css-theme-toggle', CSS);
  const text = { ...(LABELS[lang] || LABELS.en), ...labels };
  // pref is the person's choice (null until they switch); shown is the theme in use.
  const [pref, setPref] = React.useState(null);
  const [shown, setShown] = React.useState('light');

  // A layout effect, so the stored choice is read and applied before the first paint: a passive
  // effect runs after it and shows the device's theme for one frame when the choice differs.
  useIsoLayoutEffect(() => {
    const sync = () => {
      const choice = readThemePreference();
      setPref(choice);
      setShown(applyTheme(choice));
    };
    // Another toggle on this page, or the same choice made in another tab.
    const onStorage = (e) => { if (e.key === null || e.key === THEME_STORAGE_KEY) sync(); };
    sync();
    window.addEventListener(THEME_CHANGE_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  React.useEffect(() => {
    if (pref || !globalThis.matchMedia) return undefined;
    const mq = globalThis.matchMedia('(prefers-color-scheme: dark)');
    // No choice yet: follow the device, and store nothing.
    const follow = () => setShown(swapTheme(() => applyTheme(null)));
    mq.addEventListener('change', follow);
    return () => mq.removeEventListener('change', follow);
  }, [pref]);

  const other = THEME_PREFERENCES.find((t) => t !== shown);
  const choose = () => {
    swapTheme(() => {
      setPref(writeThemePreference(other));
      setShown(applyTheme(other));
    });
    onChange?.(other);
  };

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      data-slot="theme-toggle"
      data-ef-react=""
      data-theme-shown={shown}
      className={`ef-theme-toggle ef-glass ef-glass--clear${className ? ` ${className}` : ''}`}
      aria-label={`${text.next} ${text[other].toLowerCase()}`}
      title={text[shown]}
      onClick={choose}
    >
      <Icon name={ICONS[shown]} size={20} aria-hidden="true" />
    </button>
  );
});
