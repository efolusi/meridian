'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';
// Chrome glass that content scrolls under (design-tokens docs/glass.md). Floating by default: a pill
// inset from the edges; floating={false} keeps a full-width bar with a bottom edge.
const CSS = `
.ef-topnav{display:flex;align-items:center;gap:var(--space-3);height:60px;padding:0 var(--space-6);position:sticky;top:0;z-index:20}
.ef-topnav:not(.ef-topnav--floating){border-width:0 0 1px;border-radius:0}
.ef-topnav--floating{top:var(--space-3);height:56px;margin:var(--space-3) var(--space-3) 0;padding:0 var(--space-2) 0 var(--space-5);border-radius:var(--radius-full)}
.ef-topnav__title{font-size:var(--text-xl);font-weight:var(--weight-display);font-family:var(--font-display);letter-spacing:var(--tracking-display);color:var(--text-primary);margin:0}
.ef-topnav__spacer{margin-inline-start:auto}
`;
export function TopNav({ title, leading, children, floating = true, style, className, ...rest }) {
  injectEfCss('ef-css-topnav', CSS);
  return (
    <header {...rest} className={`ef-topnav ef-glass ef-glass--chrome ef-glass--blur${floating ? ' ef-topnav--floating' : ''}${className ? ' ' + className : ''}`} style={style}>
      {leading}
      {title ? <h1 className="ef-topnav__title">{title}</h1> : null}
      <span className="ef-topnav__spacer"></span>
      {children}
    </header>
  );
}
