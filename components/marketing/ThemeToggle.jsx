'use client';
import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';

// One theme control for every Efolusi site. The cookie on .efolusi.com carries the
// choice across subdomains; localStorage mirrors it for hosts outside that domain.
const THEME_COOKIE = 'efolusi_theme';
const THEME_PREFERENCES = ['system', 'light', 'dark'];
const YEAR = 60 * 60 * 24 * 365;

const LABELS = {
  en: { system: 'System theme', light: 'Light theme', dark: 'Dark theme', next: 'switch to' },
  id: { system: 'Tema sistem', light: 'Tema terang', dark: 'Tema gelap', next: 'ganti ke' },
};
const ICONS = { system: 'monitor', light: 'sun', dark: 'moon' };

const valid = (v) => (THEME_PREFERENCES.includes(v) ? v : null);

export function readThemePreference(doc = globalThis.document, storage = globalThis.localStorage) {
  const m = doc?.cookie?.match(/(?:^|;\s*)efolusi_theme=([^;]+)/);
  const fromCookie = valid(m && decodeURIComponent(m[1]));
  if (fromCookie) return fromCookie;
  try {
    return valid(storage?.getItem(THEME_COOKIE)) || 'system';
  } catch {
    return 'system';
  }
}

export function writeThemePreference(value, doc = globalThis.document, storage = globalThis.localStorage) {
  const pref = valid(value) || 'system';
  const host = doc?.location?.hostname || '';
  const domain = host === 'efolusi.com' || host.endsWith('.efolusi.com') ? '; Domain=.efolusi.com' : '';
  const secure = doc?.location?.protocol === 'https:' ? '; Secure' : '';
  if (doc) doc.cookie = `${THEME_COOKIE}=${pref}${domain}; Path=/; Max-Age=${YEAR}; SameSite=Lax${secure}`;
  try {
    storage?.setItem(THEME_COOKIE, pref);
  } catch {
    /* storage blocked: the cookie still holds the choice */
  }
  return pref;
}

export function resolveTheme(pref, matchMedia = globalThis.matchMedia) {
  if (pref === 'light' || pref === 'dark') return pref;
  return matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(pref, doc = globalThis.document, matchMedia = globalThis.matchMedia) {
  const theme = resolveTheme(pref, matchMedia);
  doc?.documentElement?.setAttribute('data-theme', theme);
  return theme;
}

/** Inline this in <head>, before any stylesheet paints, so the first frame has the right theme. */
export function themeInitScript() {
  return `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)${THEME_COOKIE}=([^;]+)/),p=m&&decodeURIComponent(m[1]);if(p!=='light'&&p!=='dark'&&p!=='system'){p=null;try{p=localStorage.getItem('${THEME_COOKIE}')}catch(e){}}if(p!=='light'&&p!=='dark')p=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',p)}catch(e){}})();`;
}

const CSS = `
.ef-theme-toggle{display:inline-flex;align-items:center;justify-content:center;flex:none;width:var(--tap-min);height:var(--tap-min);padding:0;border:1px solid transparent;border-radius:var(--radius-full);background:transparent;color:var(--text-secondary);cursor:pointer;transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.ef-theme-toggle:hover{background:var(--surface-sunken);color:var(--text-primary)}
.ef-theme-toggle:focus-visible{outline:none;box-shadow:var(--focus-ring)}
@media (prefers-reduced-motion:reduce){.ef-theme-toggle{transition:none}}
`;

export const ThemeToggle = React.forwardRef(function ThemeToggle({ lang = 'en', labels, className, onChange, ...rest }, ref) {
  injectEfCss('ef-css-theme-toggle', CSS);
  const text = { ...(LABELS[lang] || LABELS.en), ...labels };
  const [pref, setPref] = React.useState('system');

  React.useEffect(() => {
    setPref(readThemePreference());
  }, []);

  React.useEffect(() => {
    applyTheme(pref);
    if (pref !== 'system' || !globalThis.matchMedia) return undefined;
    const mq = globalThis.matchMedia('(prefers-color-scheme: dark)');
    const follow = () => applyTheme('system');
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
