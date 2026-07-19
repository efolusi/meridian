import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-toast{display:flex;align-items:flex-start;gap:10px;width:360px;max-width:100%;padding:12px 14px;background:var(--surface-inverse);color:var(--text-inverse);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);animation:ef-toast-in var(--dur-slow) var(--ease-spring)}
.ef-toast__icon{display:inline-flex;margin-top:1px}
.ef-toast--success .ef-toast__icon{color:#7FD08D}
.ef-toast--danger .ef-toast__icon{color:#F49B93}
.ef-toast--warning .ef-toast__icon{color:#F2C078}
.ef-toast--info .ef-toast__icon{color:#EFCFAC}
.ef-toast__title{font-size:var(--text-md);font-weight:var(--weight-semibold);line-height:1.35}
.ef-toast__desc{font-size:var(--text-sm);color:var(--text-inverse);opacity:.75;margin-top:2px;line-height:1.4}
.ef-toast__action{margin-top:8px;background:none;border:none;padding:0;color:var(--peach-200);font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--weight-semibold);cursor:pointer}
.ef-toast__action:hover{color:var(--cream-50);text-decoration:underline}
.ef-toast .ef-iconbtn{color:rgba(250,249,246,.6)}
.ef-toast .ef-iconbtn:hover:not(:disabled){background:color-mix(in srgb,var(--text-inverse) 12%,transparent);color:var(--text-inverse)}
.ef-toast-stack{position:fixed;bottom:24px;right:24px;display:flex;flex-direction:column;gap:10px;z-index:var(--z-toast)}
[data-theme="dark"] .ef-toast--success .ef-toast__icon{color:var(--success-600)}
[data-theme="dark"] .ef-toast--danger .ef-toast__icon{color:var(--danger-600)}
[data-theme="dark"] .ef-toast--warning .ef-toast__icon{color:var(--warning-600)}
[data-theme="dark"] .ef-toast--info .ef-toast__icon{color:var(--brand-600)}
[data-theme="dark"] .ef-toast__action{color:var(--brand-700)}
[data-theme="dark"] .ef-toast .ef-iconbtn{color:rgba(30,26,20,.55)}
@keyframes ef-toast-in{from{opacity:0;transform:translateY(12px) scale(.96)}}
`;
const ICONS = { success: 'circle-check', danger: 'circle-alert', warning: 'triangle-alert', info: 'info' };
export function Toast({ tone = 'info', title, description, actionLabel, onAction, onClose, style, className, ...rest }) {
  injectEfCss('ef-css-toast', CSS);
  return (
    <div {...rest} className={`ef-toast ef-toast--${tone}${className ? ' ' + className : ''}`} role="status" style={style}>
      <span className="ef-toast__icon"><Icon name={ICONS[tone] || 'info'} size={18} /></span>
      <div style={{ flex: 1 }}>
        <div className="ef-toast__title">{title}</div>
        {description ? <div className="ef-toast__desc">{description}</div> : null}
        {actionLabel ? <button className="ef-toast__action" onClick={onAction}>{actionLabel}</button> : null}
      </div>
      {onClose ? <IconButton icon="x" label="Dismiss" size="sm" onClick={onClose} /> : null}
    </div>
  );
}
export function ToastStack({ children, style, className, ...rest }) {
  injectEfCss('ef-css-toast', CSS);
  return <div {...rest} className={`ef-toast-stack${className ? ' ' + className : ''}`} style={style}>{children}</div>;
}
