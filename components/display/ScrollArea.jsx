import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-scrollarea{overflow:auto;scrollbar-width:thin;scrollbar-color:var(--border-strong) transparent}
.ef-scrollarea::-webkit-scrollbar{width:9px;height:9px}
.ef-scrollarea::-webkit-scrollbar-track{background:transparent}
.ef-scrollarea::-webkit-scrollbar-thumb{background:var(--border-strong);border-radius:var(--radius-full);border:2px solid transparent;background-clip:content-box}
.ef-scrollarea::-webkit-scrollbar-thumb:hover{background:var(--text-muted);border:2px solid transparent;background-clip:content-box}
`;
export function ScrollArea({ maxHeight, height, children, style, className, ...rest }) {
  injectEfCss('ef-css-scrollarea', CSS);
  return <div className={`ef-scrollarea${className ? ' ' + className : ''}`} style={{ maxHeight, height, ...style }} {...rest}>{children}</div>;
}
