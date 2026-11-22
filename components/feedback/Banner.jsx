'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';
const CSS = `
.ef-banner{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-4);font-size:var(--text-sm);border-bottom:1px solid var(--border-default)}
.ef-banner--neutral{background:var(--surface-sunken);color:var(--text-primary)}
.ef-banner--brand{background:var(--cream-50);color:var(--cocoa-700)}
.ef-banner--warning{background:var(--status-warning-bg);color:var(--status-warning-text);border-color:var(--status-warning-border)}
.ef-banner--danger{background:var(--status-danger-bg);color:var(--status-danger-text);border-color:var(--status-danger-border)}
.ef-banner__icon{display:inline-flex;flex:none}
.ef-banner__text{flex:1;min-width:0}
.ef-banner__text strong{font-weight:var(--weight-semibold)}
.ef-banner__action{flex:none;display:inline-flex;min-height:var(--control-h-xs);align-items:center;font-weight:var(--weight-semibold);font-size:var(--text-sm);color:inherit;text-decoration:underline;text-underline-offset:3px;background:none;border:none;cursor:pointer;font-family:var(--font-sans);padding:var(--space-1) 0}
.ef-banner__action:focus-visible{outline:none;box-shadow:var(--focus-ring);border-radius:var(--radius-sm)}
/* coarse pointers get the 44px touch target, like form controls do through --control-h-* */
@media (pointer:coarse){.ef-banner__action{min-height:var(--tap-min)}}
`;
export function Banner({ tone = 'neutral', icon, action, onDismiss, children, style, className, ...rest }) {
  injectEfCss('ef-css-banner', CSS);
  return (
    <div {...rest} role="status" className={`ef-banner ef-banner--${tone}${className ? ' ' + className : ''}`} style={style}>
      {icon ? <span className="ef-banner__icon"><Icon name={icon} size={16} /></span> : null}
      <span className="ef-banner__text">{children}</span>
      {action || null}
      {onDismiss ? <IconButton icon="x" label="Dismiss" size="sm" onClick={onDismiss} /> : null}
    </div>
  );
}
