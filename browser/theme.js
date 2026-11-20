// Generated from components/marketing/ThemeToggle.jsx by scripts/build_browser.mjs. Do not edit.
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

export function applyTheme(pref, doc = globalThis.document, matchMedia = globalThis.matchMedia) {
  const theme = resolveTheme(pref, matchMedia);
  // Meridian's light palette is bare :root; dark needs the dark data-theme value.
  if (theme === 'dark') doc?.documentElement?.setAttribute('data-theme', 'dark');
  else doc?.documentElement?.removeAttribute('data-theme');
  return theme;
}

/** Inline this in <head>, before any stylesheet paints, so the first frame has the right theme. */
export function themeInitScript() {
  return `(function(){try{var s=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light',c=null,t;try{c=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}if(c==='light'||c==='dark')t=c;else if(c==='system')t=s;else{var m=document.cookie.match(/(?:^|;\\s*)${THEME_COOKIE}=(dark|light)(?:;|$)/);t=m?m[1]:s}if(t==='dark')document.documentElement.setAttribute('data-theme','dark');else document.documentElement.removeAttribute('data-theme')}catch(e){}})();`;
}
export { THEME_PREFERENCES, THEME_STORAGE_KEY, THEME_CHANGE_EVENT, LABELS };
