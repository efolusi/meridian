'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';
const CSS = `
.ef-iconbtn{display:inline-flex;align-items:center;justify-content:center;flex:none;border:1px solid transparent;border-radius:var(--press-radius,var(--radius-sm));background:transparent;color:var(--text-secondary);cursor:pointer;transition:background var(--dur-fast) var(--ease-enter),color var(--dur-fast) var(--ease-enter),box-shadow var(--dur-fast) var(--ease-enter),transform var(--dur-fast) var(--ease-enter)}
.ef-iconbtn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-iconbtn:active:not(:is(:disabled,[aria-disabled="true"],[data-disabled])){transform:scale(var(--motion-press))}
.ef-iconbtn:is(:disabled,[aria-disabled="true"],[data-disabled]){opacity:.45;cursor:not-allowed}
.ef-iconbtn--solid:is(:disabled,[aria-disabled="true"],[data-disabled]){opacity:1;background:var(--surface-track);border-color:transparent;color:var(--text-muted)}
.ef-iconbtn--sm{width:var(--control-h-sm);height:var(--control-h-sm)}
.ef-iconbtn--md{width:var(--control-h-md);height:var(--control-h-md)}
.ef-iconbtn--lg{width:var(--control-h-lg);height:var(--control-h-lg)}
.ef-iconbtn--quiet:hover:not(:is(:disabled,[aria-disabled="true"],[data-disabled])){background:var(--surface-sunken);color:var(--text-primary)}
.ef-iconbtn--outline{border-color:var(--border-strong);background:transparent;color:var(--text-primary)}
.ef-iconbtn--outline:hover:not(:is(:disabled,[aria-disabled="true"],[data-disabled])){background:var(--surface-sunken)}
.ef-iconbtn--solid{background:var(--accent);border-color:var(--accent-edge);color:var(--accent-contrast)}
.ef-iconbtn--solid:hover:not(:is(:disabled,[aria-disabled="true"],[data-disabled])){background:var(--accent-hover)}
`;
export const IconButton = React.forwardRef(function IconButton({ icon, label, variant = 'quiet', size = 'md', disabled, style, className, ...rest }, ref) {
  injectEfCss('ef-css-iconbtn', CSS);
  const isz = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;
  return (
    <button ref={ref} aria-label={label} title={label} className={`ef-iconbtn ef-iconbtn--${variant} ef-iconbtn--${size}${className ? ' ' + className : ''}`} disabled={disabled} style={style} {...rest}>
      <Icon name={icon} size={isz} />
    </button>
  );
});
