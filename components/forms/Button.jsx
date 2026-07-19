import React from 'react';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid transparent;border-radius:var(--radius-sm);font-family:var(--font-sans);font-weight:var(--weight-semibold);cursor:pointer;white-space:nowrap;user-select:none;transition:background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out),transform var(--dur-med) var(--ease-spring)}
.ef-btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-btn:active:not(:disabled){transform:scale(.985)}
.ef-btn:disabled{opacity:.45;cursor:not-allowed}
.ef-btn--sm{height:var(--control-h-sm);padding:0 10px;font-size:var(--text-sm)}
.ef-btn--md{height:var(--control-h-md);padding:0 14px;font-size:var(--text-md)}
.ef-btn--lg{height:var(--control-h-lg);padding:0 20px;font-size:var(--text-lg)}
.ef-btn--primary{background:var(--accent);color:var(--accent-contrast)}
.ef-btn--primary:hover:not(:disabled){background:var(--accent-hover)}
.ef-btn--primary:active:not(:disabled){background:var(--accent-active)}
.ef-btn--secondary{background:transparent;color:var(--text-primary);border-color:var(--border-strong)}
.ef-btn--secondary:hover:not(:disabled){background:var(--surface-sunken)}
.ef-btn--ghost{background:transparent;color:var(--text-secondary)}
.ef-btn--ghost:hover:not(:disabled){background:var(--surface-sunken);color:var(--text-primary)}
.ef-btn--danger{background:var(--danger-600);color:var(--danger-contrast)}
.ef-btn--danger:hover:not(:disabled){background:var(--danger-700)}
.ef-btn--brand{background:var(--brand-700);color:#fff}
.ef-btn--brand:hover:not(:disabled){background:var(--brand-800)}
@keyframes ef-spin{to{transform:rotate(360deg)}}
.ef-btn__spin{display:inline-flex;animation:ef-spin .7s linear infinite}
`;
export function injectEfCss(id, text) {
  if (typeof document === 'undefined' || document.getElementById(id)) return;
  const s = document.createElement('style'); s.id = id; s.textContent = text; document.head.appendChild(s);
}
/**
 * Point several refs at one node.
 *
 * A component that forwards a ref usually needs the same node itself — to
 * anchor an overlay, trap focus, or measure. Lowercase, so it stays an internal
 * helper rather than part of the public namespace.
 */
export function mergeRefs(...refs) {
  return node => {
    for (const r of refs) {
      if (!r) continue;
      if (typeof r === 'function') r(node);
      else r.current = node;
    }
  };
}
export function Button({ variant = 'primary', size = 'md', iconLeft, iconRight, fullWidth, loading, disabled, children, style, className, ...rest }) {
  injectEfCss('ef-css-btn', CSS);
  const isz = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
  return (
    <button className={`ef-btn ef-btn--${variant} ef-btn--${size}${className ? ' ' + className : ''}`} disabled={disabled || loading} style={{ width: fullWidth ? '100%' : undefined, ...style }} {...rest}>
      {loading ? <span className="ef-btn__spin"><Icon name="loader-circle" size={isz} /></span> : iconLeft ? <Icon name={iconLeft} size={isz} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={isz} /> : null}
    </button>
  );
}
