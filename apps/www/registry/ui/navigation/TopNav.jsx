import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-topnav{display:flex;align-items:center;gap:12px;height:60px;padding:0 24px;border-bottom:1px solid var(--border-default);background:color-mix(in srgb,var(--surface-page) 85%,transparent);backdrop-filter:blur(12px);position:sticky;top:0;z-index:20}
.ef-topnav__title{font-size:18px;font-weight:700;font-family:var(--font-display);letter-spacing:-0.02em;color:var(--text-primary);margin:0}
.ef-topnav__spacer{margin-left:auto}
`;
export function TopNav({ title, leading, children, style, className }) {
  injectEfCss('ef-css-topnav', CSS);
  return (
    <header className={`ef-topnav${className ? ' ' + className : ''}`} style={style}>
      {leading}
      {title ? <h1 className="ef-topnav__title">{title}</h1> : null}
      <span className="ef-topnav__spacer"></span>
      {children}
    </header>
  );
}
