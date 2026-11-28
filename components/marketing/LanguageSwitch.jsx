'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';

// The language switch of every Efolusi site: one short code per language (ID, EN), each a link to the same page in
// that language. The language in use is not a link; it is marked aria-current. Meridian fetches and stores nothing:
// the product gives each language its own href.
const CSS = `
.ef-language-switch__list{display:flex;align-items:center;gap:var(--space-1);margin:0;padding:0;list-style:none}
.ef-language-switch__item{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:var(--control-h-md);min-height:var(--control-h-md);padding-inline:var(--space-2);border-radius:var(--radius-full);color:var(--text-secondary);font-size:var(--text-md);font-weight:var(--weight-medium);line-height:1;text-decoration:none;transition:background var(--dur-fast) var(--ease-enter),color var(--dur-fast) var(--ease-enter)}
.ef-language-switch[data-size="sm"] .ef-language-switch__item{min-width:var(--control-h-sm);min-height:var(--control-h-sm);font-size:var(--text-sm)}
@media (hover:hover){a.ef-language-switch__item:hover{background:var(--surface-sunken);color:var(--text-primary)}}
a.ef-language-switch__item:active{background:var(--state-pressed);color:var(--text-primary)}
.ef-language-switch__item[aria-current="true"]{background:var(--surface-sunken);color:var(--text-primary);font-weight:var(--weight-semibold)}
.ef-language-switch__item:focus-visible{outline:2px solid transparent;box-shadow:var(--focus-ring)}
@media (pointer:coarse){.ef-language-switch[data-size="sm"] .ef-language-switch__item{min-width:var(--tap-min);min-height:var(--tap-min)}}
@media (prefers-reduced-motion:reduce){.ef-language-switch__item{transition:none}}
`;

const LABELS = { en: { nav: 'Language' }, id: { nav: 'Bahasa' } };
// Each language spelled in its own language. Other codes fall back to Intl, then to the label.
const OWN_NAMES = { en: 'English', id: 'Bahasa Indonesia' };

function ownName({ code, label, name }) {
  if (name) return name;
  if (OWN_NAMES[code]) return OWN_NAMES[code];
  try {
    const spelled = new Intl.DisplayNames([code], { type: 'language' }).of(code);
    if (spelled && spelled !== code) return spelled.charAt(0).toLocaleUpperCase(code) + spelled.slice(1);
  } catch {
    /* an unknown code: the label stands in */
  }
  return label;
}

export const LanguageSwitch = React.forwardRef(function LanguageSwitch(
  { languages = [], current, size = 'md', lang = 'en', labels, className, ...rest },
  ref,
) {
  injectEfCss('ef-css-language-switch', CSS);
  const text = { ...(LABELS[lang] || LABELS.en), ...labels };
  return (
    <nav aria-label={text.nav} {...rest} ref={ref} data-slot="language-switch" data-size={size} className={`ef-language-switch${className ? ` ${className}` : ''}`}>
      <ul className="ef-language-switch__list">
        {languages.map((l) => {
          const name = `${ownName(l)} (${l.label})`;
          return (
            <li key={l.code}>
              {l.code === current ? (
                <span className="ef-language-switch__item" role="link" aria-disabled="true" aria-current="true" lang={l.code} aria-label={name}>{l.label}</span>
              ) : (
                <a className="ef-language-switch__item" href={l.href} hrefLang={l.code} lang={l.code} aria-label={name}>{l.label}</a>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
});
