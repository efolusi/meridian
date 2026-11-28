'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';

const CSS = `
.ef-site-footer{border-top:1px solid var(--border-default);background:var(--surface-subtle);color:var(--text-secondary)}
.ef-site-footer__inner{width:100%;max-width:var(--container-max);margin-inline:auto;padding:var(--space-16) var(--space-6) var(--space-8)}
.ef-site-footer__top{display:grid;grid-template-columns:minmax(0,2fr) repeat(auto-fit,minmax(10rem,1fr));gap:var(--space-10) var(--space-8)}
.ef-site-footer__brand{display:flex;flex-direction:column;gap:var(--space-3);max-width:var(--container-text)}
.ef-site-footer__brand-link{display:inline-flex;align-items:center;gap:var(--space-2);min-height:var(--tap-min);align-self:flex-start;color:var(--text-primary);font-family:var(--font-display);font-size:var(--text-lg);font-weight:var(--weight-bold);text-decoration:none}
.ef-site-footer__tagline{margin:0;font-size:var(--text-md);line-height:var(--leading-relaxed)}
.ef-site-footer__socials{display:flex;gap:var(--space-1);margin:0;padding:0;list-style:none}
.ef-site-footer__social{display:inline-flex;align-items:center;justify-content:center;width:var(--tap-min);height:var(--tap-min);border-radius:var(--radius-full);color:var(--text-secondary)}
@media (hover:hover){.ef-site-footer__social:hover{background:var(--surface-sunken);color:var(--text-primary)}}
.ef-site-footer__heading{margin:0 0 var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-site-footer__list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.ef-site-footer__link{display:inline-flex;align-items:center;min-height:var(--tap-min);color:var(--text-secondary);font-size:var(--text-md);text-decoration:none}
@media (hover:hover){.ef-site-footer__link:hover{color:var(--text-primary)}}
.ef-site-footer__brand-link:focus-visible,.ef-site-footer__social:focus-visible,.ef-site-footer__link:focus-visible,.ef-site-footer__legal-link:focus-visible{outline:none;border-radius:var(--radius-xs);box-shadow:var(--focus-ring)}
.ef-site-footer__bottom{display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--space-3);margin-top:var(--space-12);padding-top:var(--space-6);border-top:1px solid var(--border-default);font-size:var(--text-sm)}
.ef-site-footer__meta{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-1) var(--space-6)}
.ef-site-footer__copyright{margin:0}
.ef-site-footer__legal{display:flex;flex-wrap:wrap;margin:0;padding:0;list-style:none;gap:var(--space-1) var(--space-4)}
.ef-site-footer__legal-link{display:inline-flex;align-items:center;justify-content:center;min-width:var(--control-h-sm);min-height:var(--control-h-sm);color:var(--text-secondary);font-size:var(--text-sm);text-decoration:none}
@media (hover:hover){.ef-site-footer__legal-link:hover{color:var(--text-primary)}}
.ef-site-footer__sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
@media (max-width:640px){.ef-site-footer__top{grid-template-columns:1fr}}
`;

const LABELS = {
  en: { newTab: '(opens in a new tab)', to: 'to', legal: 'Legal' },
  id: { newTab: '(membuka tab baru)', to: 'sampai', legal: 'Informasi hukum' },
};

// The year is read from the clock at render, so nobody edits it every January. `year` wins over the clock (tests, and
// a server render that must match the browser across New Year); `since` makes a range when it is before the year.
function copyrightYears(year, since, to) {
  const current = year ?? new Date().getFullYear();
  return since != null && since < current ? `${since} ${to} ${current}` : `${current}`;
}

function FooterLink({ link, text, className }) {
  const external = link.external ?? /^https?:\/\//.test(link.href);
  return (
    <a className={className} href={link.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} aria-label={link.ariaLabel}>
      {link.icon ?? link.label}
      {external && !link.ariaLabel ? <span className="ef-site-footer__sr"> {text.newTab}</span> : null}
    </a>
  );
}

export const SiteFooter = React.forwardRef(function SiteFooter(
  { brand, brandHref = '/', tagline, columns = [], socials = [], bottom, name, year, since, legal = [], languageSwitch, lang = 'en', labels, className, children, ...rest },
  ref,
) {
  injectEfCss('ef-css-site-footer', CSS);
  const text = { ...(LABELS[lang] || LABELS.en), ...labels };
  const hasMeta = Boolean(name) || legal.length > 0;
  return (
    <footer {...rest} ref={ref} data-slot="site-footer" className={`ef-site-footer${className ? ` ${className}` : ''}`}>
      <div className="ef-site-footer__inner">
        <div className="ef-site-footer__top">
          <div className="ef-site-footer__brand">
            {brand ? <a className="ef-site-footer__brand-link" href={brandHref}>{brand}</a> : null}
            {tagline ? <p className="ef-site-footer__tagline">{tagline}</p> : null}
            {socials.length ? (
              <ul className="ef-site-footer__socials">
                {socials.map((s) => (
                  <li key={s.href}><FooterLink className="ef-site-footer__social" text={text} link={{ ...s, ariaLabel: s.ariaLabel || `${s.label} ${text.newTab}` }} /></li>
                ))}
              </ul>
            ) : null}
            {children}
          </div>
          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="ef-site-footer__heading">{col.heading}</h2>
              <ul className="ef-site-footer__list">
                {col.links.map((l) => <li key={l.href}><FooterLink className="ef-site-footer__link" text={text} link={l} /></li>)}
              </ul>
            </nav>
          ))}
        </div>
        {hasMeta || languageSwitch || bottom ? (
          <div className="ef-site-footer__bottom">
            {hasMeta ? (
              <div className="ef-site-footer__meta">
                {name ? <p className="ef-site-footer__copyright">© {copyrightYears(year, since, text.to)} {name}</p> : null}
                {legal.length ? (
                  <nav aria-label={text.legal}>
                    <ul className="ef-site-footer__legal">
                      {legal.map((l) => <li key={l.href}><FooterLink className="ef-site-footer__legal-link" text={text} link={l} /></li>)}
                    </ul>
                  </nav>
                ) : null}
              </div>
            ) : null}
            {languageSwitch}
            {bottom}
          </div>
        ) : null}
      </div>
    </footer>
  );
});
