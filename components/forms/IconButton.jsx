import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from './Button.jsx';
const CSS = `
.ef-iconbtn{display:inline-flex;align-items:center;justify-content:center;flex:none;border:1px solid transparent;border-radius:var(--radius-sm);background:transparent;color:var(--text-secondary);cursor:pointer;transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out),transform var(--dur-med) var(--ease-spring)}
.ef-iconbtn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-iconbtn:active:not(:disabled){transform:scale(.96)}
.ef-iconbtn:disabled{opacity:.45;cursor:not-allowed}
.ef-iconbtn--sm{width:var(--control-h-sm);height:var(--control-h-sm)}
.ef-iconbtn--md{width:var(--control-h-md);height:var(--control-h-md)}
.ef-iconbtn--lg{width:var(--control-h-lg);height:var(--control-h-lg)}
.ef-iconbtn--quiet:hover:not(:disabled){background:var(--surface-sunken);color:var(--text-primary)}
.ef-iconbtn--outline{border-color:var(--border-strong);background:transparent;color:var(--text-primary)}
.ef-iconbtn--outline:hover:not(:disabled){background:var(--surface-sunken)}
.ef-iconbtn--solid{background:var(--accent);color:var(--accent-contrast)}
.ef-iconbtn--solid:hover:not(:disabled){background:var(--accent-hover)}
`;
export function IconButton({ icon, label, variant = 'quiet', size = 'md', disabled, style, className, ...rest }) {
  injectEfCss('ef-css-iconbtn', CSS);
  const isz = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;
  return (
    <button aria-label={label} title={label} className={`ef-iconbtn ef-iconbtn--${variant} ef-iconbtn--${size}${className ? ' ' + className : ''}`} disabled={disabled} style={style} {...rest}>
      <Icon name={icon} size={isz} />
    </button>
  );
}
