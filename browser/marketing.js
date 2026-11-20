// Meridian's marketing behaviour for sites without React: the theme toggle, the site
// header menu and the marquee pause. It reads the markup the React components render
// (data-slot attributes), so a server-rendered page needs only this module.
// Listeners sit on the root and new markup is labelled as it appears, so pages that
// re-render or route on the client keep working.
// CSP: no eval, no HTML strings, no style attributes; values go through the CSSOM.
import {
  LABELS, THEME_CHANGE_EVENT, THEME_PREFERENCES, THEME_STORAGE_KEY,
  applyTheme, readThemePreference, writeThemeCookie, writeThemePreference,
} from './theme.js';

const MARQUEE_LABELS = {
  en: { pause: 'Pause the moving list', play: 'Play the moving list' },
  id: { pause: 'Jeda daftar berjalan', play: 'Putar daftar berjalan' },
};
// A toggle React renders (data-ef-react) is React's; this script leaves it alone.
const TOGGLE = '[data-slot="theme-toggle"]:not([data-ef-react])';
const MENU = '[data-slot="site-header"] .ef-site-header__menu';
const MARQUEE = '[data-slot="marquee"]';
const active = new WeakMap();

const langOf = (el) => ((el.closest('[lang]')?.getAttribute('lang') || '').toLowerCase().startsWith('id') ? 'id' : 'en');
const nextOf = (pref) => THEME_PREFERENCES[(THEME_PREFERENCES.indexOf(pref) + 1) % THEME_PREFERENCES.length];

function labelToggles(root) {
  const pref = readThemePreference();
  for (const b of root.querySelectorAll(TOGGLE)) {
    const text = LABELS[langOf(b)];
    const label = `${text[pref]}, ${text.next} ${text[nextOf(pref)].toLowerCase()}`;
    if (b.dataset.preference !== pref) b.dataset.preference = pref;
    if (b.getAttribute('aria-label') !== label) b.setAttribute('aria-label', label);
    if (b.getAttribute('title') !== text[pref]) b.setAttribute('title', text[pref]);
  }
}

function setPaused(marquee, button, paused) {
  const text = MARQUEE_LABELS[langOf(marquee)];
  marquee.toggleAttribute('data-paused', paused);
  button.setAttribute('aria-pressed', String(paused));
  button.setAttribute('aria-label', paused ? text.play : text.pause);
}

function prepareMarquees(root) {
  for (const marquee of root.querySelectorAll(MARQUEE)) {
    const seconds = Number(marquee.dataset.duration);
    const duration = marquee.dataset.duration && Number.isFinite(seconds) && seconds > 0 ? `${seconds}s` : '';
    if (duration && marquee.style.getPropertyValue('--ef-marquee-duration') !== duration) {
      marquee.style.setProperty('--ef-marquee-duration', duration);
    }
    const button = marquee.querySelector('.ef-marquee__pause');
    if (button && !button.hasAttribute('aria-label')) setPaused(marquee, button, button.getAttribute('aria-pressed') === 'true');
  }
}

function setMenu(button, open) {
  const panel = button.ownerDocument.getElementById(button.getAttribute('aria-controls') || '');
  button.setAttribute('aria-expanded', String(open));
  panel?.toggleAttribute('data-open', open);
}

/** Wire every theme toggle, site header and marquee under root. Returns a function that unwires them. */
export function init(root = document) {
  const doc = root.ownerDocument || root;
  const win = doc.defaultView || window;
  const refresh = () => {
    labelToggles(root);
    prepareMarquees(root);
    for (const header of root.querySelectorAll('[data-slot="site-header"]')) header.toggleAttribute('data-scrolled', win.scrollY > 4);
  };
  const sync = () => { applyTheme(readThemePreference()); labelToggles(root); };
  if (active.has(root)) {
    sync();
    refresh();
    return active.get(root);
  }

  const onClick = (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;
    if (target.closest(TOGGLE)) {
      writeThemePreference(nextOf(readThemePreference()));
      return;
    }
    const menu = target.closest(MENU);
    if (menu) {
      setMenu(menu, menu.getAttribute('aria-expanded') !== 'true');
      return;
    }
    const pause = target.closest('.ef-marquee__pause');
    const marquee = pause?.closest(MARQUEE);
    if (marquee) setPaused(marquee, pause, pause.getAttribute('aria-pressed') !== 'true');
  };
  const onKey = (e) => {
    if (e.key !== 'Escape') return;
    const open = root.querySelector(`${MENU}[aria-expanded="true"]`);
    if (!open) return;
    setMenu(open, false);
    open.focus();
  };
  const onStorage = (e) => { if (e.key === null || e.key === THEME_STORAGE_KEY) sync(); };
  const onScroll = () => { for (const h of root.querySelectorAll('[data-slot="site-header"]')) h.toggleAttribute('data-scrolled', win.scrollY > 4); };
  // On System, follow the operating system and keep the cookie on the resolved theme.
  const media = win.matchMedia?.('(prefers-color-scheme: dark)');
  const onMedia = () => { if (readThemePreference() === 'system') writeThemeCookie(applyTheme('system')); };
  const observer = new win.MutationObserver(refresh);

  root.addEventListener('click', onClick);
  doc.addEventListener('keydown', onKey);
  win.addEventListener(THEME_CHANGE_EVENT, sync);
  win.addEventListener('storage', onStorage);
  win.addEventListener('scroll', onScroll, { passive: true });
  media?.addEventListener('change', onMedia);
  observer.observe(root, { childList: true, subtree: true });
  sync();
  refresh();

  const cleanup = () => {
    root.removeEventListener('click', onClick);
    doc.removeEventListener('keydown', onKey);
    win.removeEventListener(THEME_CHANGE_EVENT, sync);
    win.removeEventListener('storage', onStorage);
    win.removeEventListener('scroll', onScroll);
    media?.removeEventListener('change', onMedia);
    observer.disconnect();
    active.delete(root);
  };
  active.set(root, cleanup);
  return cleanup;
}

// Loading the module wires the page; React apps use the components instead of this file.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(), { once: true });
  else init();
}
