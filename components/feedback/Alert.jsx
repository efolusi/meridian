import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-alert{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border:1px solid var(--border-strong);border-radius:var(--radius-md);background:var(--surface-card)}
.ef-alert__icon{display:inline-flex;margin-top:1px;flex:none}
.ef-alert--info .ef-alert__icon{color:var(--brand-700)}
.ef-alert--success .ef-alert__icon{color:var(--success-600)}
.ef-alert--warning .ef-alert__icon{color:var(--warning-600)}
.ef-alert--danger .ef-alert__icon{color:var(--danger-600)}
.ef-alert--danger{border-color:var(--danger-300)}
.ef-alert__title{font-size:var(--text-md);font-weight:var(--weight-semibold);color:var(--text-primary);line-height:1.4}
.ef-alert__desc{font-size:var(--text-sm);color:var(--text-secondary);line-height:1.5;margin-top:2px}
.ef-alert__action{margin-left:auto;flex:none}
`;
const ICONS = { info: 'info', success: 'circle-check', warning: 'triangle-alert', danger: 'circle-alert' };
export function Alert({ tone = 'info', icon, title, description, action, children, style, className, ...rest }) {
  injectEfCss('ef-css-alert', CSS);
  return (
    <div {...rest} role="status" className={`ef-alert ef-alert--${tone}${className ? ' ' + className : ''}`} style={style}>
      <span className="ef-alert__icon"><Icon name={icon || ICONS[tone]} size={16} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title ? <div className="ef-alert__title">{title}</div> : null}
        {description ? <div className="ef-alert__desc">{description}</div> : null}
        {children}
      </div>
      {action ? <div className="ef-alert__action">{action}</div> : null}
    </div>
  );
}
