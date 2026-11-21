'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';
import { Icon } from '../icons/Icon.jsx';
import { SkipLink } from '../navigation/SkipLink.jsx';

// The header of a marketing site. Products put their own account entry, theme
// control and main call to action in `actions`; Meridian fetches nothing.
const CSS = `
.ef-site-header{position:sticky;inset-block-start:0;z-index:var(--z-sticky);background:var(--surface-page);border-bottom:1px solid transparent;transition:border-color var(--dur-fast) var(--ease-out)}
.ef-site-header[data-scrolled]{border-bottom-color:var(--border-default)}
.ef-site-header__inner{display:flex;align-items:center;gap:var(--space-6);width:100%;max-width:var(--container-max);min-height:calc(var(--control-h-lg) + var(--space-4));margin-inline:auto;padding-inline:var(--space-6)}
.ef-site-header__brand{display:inline-flex;align-items:center;gap:var(--space-2);min-height:var(--tap-min);color:var(--text-primary);font-family:var(--font-display);font-size:var(--text-lg);font-weight:var(--weight-bold);text-decoration:none}
.ef-site-header__nav{display:flex;align-items:center;gap:var(--space-1);margin-inline-end:auto}
.ef-site-header__link{display:inline-flex;align-items:center;min-height:var(--tap-min);padding-inline:var(--space-3);border-radius:var(--radius-full);color:var(--text-secondary);font-size:var(--text-md);font-weight:var(--weight-medium);text-decoration:none;transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.ef-site-header__link:hover{background:var(--surface-sunken);color:var(--text-primary)}
.ef-site-header__link[aria-current="page"]{color:var(--text-primary);background:var(--surface-sunken)}
.ef-site-header__brand:focus-visible,.ef-site-header__link:focus-visible,.ef-site-header__menu:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-site-header__actions{display:flex;align-items:center;gap:var(--space-2)}
.ef-site-header__menu{display:none;align-items:center;justify-content:center;width:var(--tap-min);height:var(--tap-min);padding:0;border:0;border-radius:var(--radius-full);background:transparent;color:var(--text-primary);cursor:pointer}
.ef-site-header__menu:hover{background:var(--surface-sunken)}
.ef-site-header__panel{display:none}
@media (max-width:860px){
  .ef-site-header__nav,.ef-site-header__actions{display:none}
  .ef-site-header__menu{display:inline-flex;margin-inline-start:auto}
  .ef-site-header__panel[data-open]{display:flex;flex-direction:column;gap:var(--space-1);padding:var(--space-3) var(--space-6) var(--space-6);border-top:1px solid var(--border-default)}
  .ef-site-header__panel .ef-site-header__link{min-height:var(--tap-min);padding-inline:var(--space-2);border-radius:var(--radius-sm)}
  .ef-site-header__panel-actions{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-3)}
}
@media (prefers-reduced-motion:reduce){.ef-site-header,.ef-site-header__link{transition:none}}
`;

const LABELS = { en: { menu: 'Menu', skip: 'Skip to content', nav: 'Main' }, id: { menu: 'Menu', skip: 'Lewati ke konten', nav: 'Utama' } };

export const SiteHeader = React.forwardRef(function SiteHeader(
  { brand, brandHref = '/', brandLabel, links = [], actions, languageSwitch, lang = 'en', labels, skipHref = '#main', className, ...rest },
  ref,
) {
  injectEfCss('ef-css-site-header', CSS);
  const text = { ...(LABELS[lang] || LABELS.en), ...labels };
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const panelId = React.useId();
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      menuRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);
  const navLinks = (onClick) => links.map((l) => (
    <a key={l.href} className="ef-site-header__link" href={l.href} aria-current={l.current ? 'page' : undefined} onClick={onClick}>{l.label}</a>
  ));
  const language = languageSwitch ? (
    <a className="ef-site-header__link" href={languageSwitch.href} hrefLang={languageSwitch.hrefLang} lang={languageSwitch.hrefLang} aria-label={languageSwitch.ariaLabel}>{languageSwitch.label}</a>
  ) : null;

  return (
    <>
      <SkipLink href={skipHref}>{text.skip}</SkipLink>
      <header {...rest} ref={ref} data-slot="site-header" data-scrolled={scrolled ? '' : undefined} className={`ef-site-header${className ? ` ${className}` : ''}`}>
        <div className="ef-site-header__inner">
          <a className="ef-site-header__brand" href={brandHref} aria-label={brandLabel}>{brand}</a>
          <nav className="ef-site-header__nav" aria-label={text.nav}>{navLinks()}</nav>
          <div className="ef-site-header__actions">{language}{actions}</div>
          <button ref={menuRef} type="button" className="ef-site-header__menu" aria-expanded={open} aria-controls={panelId} aria-label={text.menu} onClick={() => setOpen((v) => !v)}>
            <Icon name={open ? 'x' : 'menu'} size={20} aria-hidden="true" />
          </button>
        </div>
        <div id={panelId} className="ef-site-header__panel" data-open={open ? '' : undefined}>
          {navLinks(close)}
          {language}
          {actions ? <div className="ef-site-header__panel-actions">{actions}</div> : null}
        </div>
      </header>
    </>
  );
});
