'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';
import { Icon } from '../icons/Icon.jsx';

// One theme control for every Efolusi site; the contract is guidelines/theming.md (Theme contract).
// localStorage holds this origin's choice (light, dark or system). The cookie on
// .efolusi.com holds only the resolved light or dark, so a first visit to another
// Efolusi site inherits it; every product parses that cookie as dark|light.
// theme-contract:start (scripts/build_browser.mjs copies this block to browser/theme.js)
const THEME_COOKIE = 'efolusi_theme';
const THEME_STORAGE_KEY = 'efolusi-theme';
const THEME_CHANGE_EVENT = 'efolusi-theme-change';
// Cycle order of the single button.
const THEME_PREFERENCES = ['light', 'dark', 'system'];
const YEAR = 60 * 60 * 24 * 365;

const LABELS = {
  en: { system: 'System theme', light: 'Light theme', dark: 'Dark theme', next: 'switch to' },
  id: { system: 'Tema sistem', light: 'Tema terang', dark: 'Tema gelap', next: 'ganti ke' },
};

const valid = (v) => (THEME_PREFERENCES.includes(v) ? v : null);

/** The localStorage choice, then the cookie (dark|light), else `system`. */
export function readThemePreference(doc = globalThis.document, storage = globalThis.localStorage) {
  try {
    const choice = valid(storage?.getItem(THEME_STORAGE_KEY));
    if (choice) return choice;
  } catch {
    /* storage blocked: fall back to the cookie */
  }
  const m = doc?.cookie?.match(/(?:^|;\s*)efolusi_theme=(dark|light)(?:;|$)/);
  return m ? m[1] : 'system';
}

export function resolveTheme(pref, matchMedia = globalThis.matchMedia) {
  if (pref === 'light' || pref === 'dark') return pref;
  return matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Writes the resolved light|dark to the cookie; never `system`. */
export function writeThemeCookie(theme, doc = globalThis.document) {
  if (!doc) return;
  const host = doc.location?.hostname || '';
  const domain = host === 'efolusi.com' || host.endsWith('.efolusi.com') ? '; Domain=.efolusi.com' : '';
  const secure = doc.location?.protocol === 'https:' ? '; Secure' : '';
  doc.cookie = `${THEME_COOKIE}=${theme === 'dark' ? 'dark' : 'light'}${domain}; Path=/; Max-Age=${YEAR}; SameSite=Lax${secure}`;
}

/** Saves the choice in localStorage and its resolved theme in the cookie. */
export function writeThemePreference(value, doc = globalThis.document, storage = globalThis.localStorage, matchMedia = globalThis.matchMedia) {
  const pref = valid(value) || 'system';
  try {
    storage?.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    /* storage blocked: the cookie still carries the resolved theme */
  }
  writeThemeCookie(resolveTheme(pref, matchMedia), doc);
  // Every ThemeToggle on the page re-reads the choice (a header renders its actions twice).
  doc?.defaultView?.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: pref }));
  return pref;
}

/** With the choice on System here, rewrite the cookie to the theme shown now, so other sites inherit a current value. */
export function refreshSystemCookie(doc = globalThis.document, storage = globalThis.localStorage, matchMedia = globalThis.matchMedia) {
  let choice = null;
  try {
    choice = storage?.getItem(THEME_STORAGE_KEY);
  } catch {
    return;
  }
  if (choice === 'system') writeThemeCookie(resolveTheme('system', matchMedia), doc);
}

export function applyTheme(pref, doc = globalThis.document, matchMedia = globalThis.matchMedia) {
  const theme = resolveTheme(pref, matchMedia);
  // data-theme is always the resolved theme, so a dark OS cannot turn a Light choice dark;
  // the media rule in tokens/colors.css stays as the no-JS fallback only.
  doc?.documentElement?.setAttribute('data-theme', theme);
  return theme;
}

/** Inline this in <head>, before any stylesheet paints, so the first frame has the right theme. */
export function themeInitScript() {
  return `(function(){try{var s=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light',c=null,t;try{c=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}if(c==='light'||c==='dark')t=c;else if(c==='system')t=s;else{var m=document.cookie.match(/(?:^|;\\s*)${THEME_COOKIE}=(dark|light)(?:;|$)/);t=m?m[1]:s}document.documentElement.setAttribute('data-theme',t);if(c==='system'){var h=location.hostname,d=h==='efolusi.com'||h.slice(-12)==='.efolusi.com'?'; Domain=.efolusi.com':'';document.cookie='${THEME_COOKIE}='+t+d+'; Path=/; Max-Age=${YEAR}; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'')}}catch(e){}})();`;
}
// theme-contract:end

const ICONS = { system: 'monitor', light: 'sun', dark: 'moon' };

const CSS = `
.ef-theme-toggle{display:inline-flex;align-items:center;justify-content:center;flex:none;width:var(--tap-min);height:var(--tap-min);padding:0;border:1px solid transparent;border-radius:var(--radius-full);background:transparent;color:var(--text-secondary);cursor:pointer;transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.ef-theme-toggle:hover{background:var(--surface-sunken);color:var(--text-primary)}
.ef-theme-toggle:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-theme-toggle [data-theme-icon]{display:none}
.ef-theme-toggle[data-preference="light"] [data-theme-icon="light"],.ef-theme-toggle[data-preference="dark"] [data-theme-icon="dark"],.ef-theme-toggle[data-preference="system"] [data-theme-icon="system"]{display:inline-flex}
@media (prefers-reduced-motion:reduce){.ef-theme-toggle{transition:none}}
`;

export const ThemeToggle = React.forwardRef(function ThemeToggle({ lang = 'en', labels, className, onChange, ...rest }, ref) {
  injectEfCss('ef-css-theme-toggle', CSS);
  const text = { ...(LABELS[lang] || LABELS.en), ...labels };
  const [pref, setPref] = React.useState('system');

  React.useEffect(() => {
    refreshSystemCookie();
    const sync = () => setPref(readThemePreference());
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
    applyTheme(pref);
    if (pref !== 'system' || !globalThis.matchMedia) return undefined;
    const mq = globalThis.matchMedia('(prefers-color-scheme: dark)');
    // Re-resolve and keep the cookie on the new resolved theme.
    const follow = () => writeThemeCookie(applyTheme('system'));
    mq.addEventListener('change', follow);
    return () => mq.removeEventListener('change', follow);
  }, [pref]);

  const next = THEME_PREFERENCES[(THEME_PREFERENCES.indexOf(pref) + 1) % THEME_PREFERENCES.length];
  const choose = () => {
    setPref(writeThemePreference(next));
    onChange?.(next);
  };

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      data-slot="theme-toggle"
      data-ef-react=""
      data-preference={pref}
      className={`ef-theme-toggle${className ? ` ${className}` : ''}`}
      aria-label={`${text[pref]}, ${text.next} ${text[next].toLowerCase()}`}
      title={text[pref]}
      onClick={choose}
    >
      <Icon name={ICONS[pref]} size={20} aria-hidden="true" />
    </button>
  );
});
