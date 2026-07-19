import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-kbd{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:19px;padding:0 5px;border:1px solid var(--border-strong);border-bottom-width:2px;border-radius:var(--radius-sm);background:var(--surface-card);font-family:var(--font-mono);font-size:11px;color:var(--text-secondary);line-height:1}
`;
export function Kbd({ children, style, className, ...rest }) {
  injectEfCss('ef-css-kbd', CSS);
  return <kbd {...rest} className={`ef-kbd${className ? ' ' + className : ''}`} style={style}>{children}</kbd>;
}
