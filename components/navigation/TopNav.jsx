'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';
// A full-width glass bar by default, where the page puts it (design-tokens docs/glass.md).
// `sticky` keeps it at the top while content scrolls under it, and only then does it blur;
// `floating` makes it a pill inset from the edges. The recommended look is both.
// While a sticky bar is on the page, the scroll port keeps --ef-topnav-space free at the top,
// so a focused element is never scrolled under it (WCAG 2.2 2.4.11).
const CSS = `
:root{--ef-topnav-space:calc(60px + var(--space-3))}
:root:has(.ef-topnav--sticky){scroll-padding-block-start:var(--ef-topnav-space)}
.ef-topnav{display:flex;align-items:center;gap:var(--space-3);height:60px;padding:0 var(--space-6);border-width:0 0 1px;border-radius:0}
.ef-topnav--sticky{position:sticky;top:0;z-index:20}
.ef-topnav--floating{height:56px;margin:var(--space-3) var(--space-3) 0;padding:0 var(--space-2) 0 var(--space-5);border-width:1px;border-radius:var(--radius-full)}
.ef-topnav--floating.ef-topnav--sticky{top:var(--space-3)}
.ef-topnav__title{font-size:var(--text-xl);font-weight:var(--weight-display);font-family:var(--font-display);letter-spacing:var(--tracking-display);color:var(--text-primary);margin:0}
.ef-topnav__spacer{margin-inline-start:auto}
`;
const LABELS = { en: { header: 'Top bar' }, id: { header: 'Bilah atas' } };
export function TopNav({ title, leading, children, floating = false, sticky = false, lang = 'en', labels, style, className, ...rest }) {
  injectEfCss('ef-css-topnav', CSS);
  const text = { ...(LABELS[lang] ?? LABELS.en), ...labels };
  const classes = ['ef-topnav', 'ef-glass', 'ef-glass--chrome', sticky && 'ef-topnav--sticky ef-glass--blur', floating && 'ef-topnav--floating', className].filter(Boolean).join(' ');
  return (
    <header aria-label={text.header} {...rest} className={classes} style={style}>
      {leading}
      {title ? <h1 className="ef-topnav__title">{title}</h1> : null}
      <span className="ef-topnav__spacer"></span>
      {children}
    </header>
  );
}
