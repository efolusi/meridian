import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-badge{display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);line-height:1;white-space:nowrap}
.ef-badge--md{height:24px;padding:0 10px;font-size:var(--text-sm)}
.ef-badge__dot{width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}
.ef-badge--neutral{background:var(--surface-sunken);color:var(--sand-700)}
.ef-badge--accent{background:var(--accent-subtle);color:var(--brand-700)}
.ef-badge--success{background:var(--success-100);color:var(--success-600)}
.ef-badge--warning{background:var(--warning-100);color:var(--warning-600)}
.ef-badge--danger{background:var(--danger-100);color:var(--danger-600)}
.ef-badge--brand{background:var(--cream-50);color:var(--cocoa-700)}
[data-theme="dark"] .ef-badge--neutral{background:var(--surface-sunken);color:var(--text-secondary)}
[data-theme="dark"] .ef-badge--accent{color:var(--brand-300)}
[data-theme="dark"] .ef-badge--brand{background:var(--accent-subtle);color:var(--brand-300)}
`;
export function Badge({ tone = 'neutral', size = 'sm', dot, children, style, className, ...rest }) {
  injectEfCss('ef-css-badge', CSS);
  return (
    <span className={`ef-badge ef-badge--${tone}${size === 'md' ? ' ef-badge--md' : ''}${className ? ' ' + className : ''}`} style={style} {...rest}>
      {dot ? <span className="ef-badge__dot"></span> : null}
      {children}
    </span>
  );
}
