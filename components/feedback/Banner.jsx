import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-banner{display:flex;align-items:center;gap:10px;padding:9px 16px;font-size:var(--text-sm);border-bottom:1px solid var(--border-default)}
.ef-banner--neutral{background:var(--surface-sunken);color:var(--text-primary)}
.ef-banner--brand{background:var(--cream-50);color:var(--cocoa-700)}
.ef-banner--warning{background:var(--warning-100);color:var(--warning-600);border-color:var(--warning-300)}
.ef-banner--danger{background:var(--danger-100);color:var(--danger-600);border-color:var(--danger-300)}
.ef-banner__icon{display:inline-flex;flex:none}
.ef-banner__text{flex:1;min-width:0}
.ef-banner__text strong{font-weight:var(--weight-semibold)}
.ef-banner__action{flex:none;font-weight:var(--weight-semibold);font-size:var(--text-sm);color:inherit;text-decoration:underline;text-underline-offset:3px;background:none;border:none;cursor:pointer;font-family:var(--font-sans);padding:0}
`;
export function Banner({ tone = 'neutral', icon, action, onAction, onDismiss, children, style, className, ...rest }) {
  injectEfCss('ef-css-banner', CSS);
  return (
    <div {...rest} role="status" className={`ef-banner ef-banner--${tone}${className ? ' ' + className : ''}`} style={style}>
      {icon ? <span className="ef-banner__icon"><Icon name={icon} size={15} /></span> : null}
      <span className="ef-banner__text">{children}</span>
      {action ? <button className="ef-banner__action" onClick={onAction}>{action}</button> : null}
      {onDismiss ? <IconButton icon="x" label="Dismiss" size="sm" onClick={onDismiss} /> : null}
    </div>
  );
}
