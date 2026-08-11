import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';

const CSS = `
.ef-alert{position:relative;display:grid;grid-template-columns:0 1fr;align-items:start;gap:2px 10px;width:100%;padding:12px 14px;border:1px solid var(--border-strong);border-radius:var(--radius-md);background:var(--surface-card);color:var(--text-primary)}
.ef-alert:has(>svg),.ef-alert:has(>span:first-child),.ef-alert:has(>.ef-alert__icon){grid-template-columns:auto 1fr}
.ef-alert>svg,.ef-alert>span:first-child,.ef-alert>.ef-alert__icon{grid-column:1;grid-row:1/3;margin-top:2px;color:currentColor}
.ef-alert>.ef-alert__title,.ef-alert>.ef-alert__description,.ef-alert>.ef-alert__body{grid-column:2}
.ef-alert--info>.ef-alert__icon{color:var(--brand-700)}
.ef-alert--success>.ef-alert__icon{color:var(--success-600)}
.ef-alert--warning>.ef-alert__icon{color:var(--warning-600)}
.ef-alert--danger,.ef-alert--destructive{border-color:var(--danger-300);color:var(--danger-700)}
.ef-alert__icon{display:inline-flex;flex:none}
.ef-alert__title{font-size:var(--text-md);font-weight:var(--weight-semibold);line-height:1.4;color:currentColor}
.ef-alert__description{font-size:var(--text-sm);line-height:1.5;color:var(--text-secondary)}
.ef-alert--danger>.ef-alert__description,.ef-alert--destructive>.ef-alert__description{color:var(--danger-700)}
.ef-alert__body{min-width:0}
.ef-alert__action{position:absolute;inset-block-start:10px;inset-inline-end:12px}
`;

const ICONS = { info: 'info', success: 'circle-check', warning: 'triangle-alert', danger: 'circle-alert' };

export const Alert = React.forwardRef(function Alert({
  variant = 'default',
  tone,
  icon,
  title,
  description,
  action,
  children,
  className,
  ...rest
}, ref) {
  injectEfCss('ef-css-alert', CSS);
  const semanticTone = tone || (variant === 'destructive' ? 'danger' : null);
  const shorthand = title !== undefined || description !== undefined || action !== undefined || icon !== undefined || tone !== undefined;
  const classes = ['ef-alert', `ef-alert--${variant}`, semanticTone ? `ef-alert--${semanticTone}` : '', className || ''].filter(Boolean).join(' ');

  return (
    <div {...rest} ref={ref} data-slot="alert" role="alert" className={classes}>
      {shorthand ? <span className="ef-alert__icon"><Icon name={icon || ICONS[semanticTone || 'info']} size={16} /></span> : null}
      {title !== undefined ? <AlertTitle>{title}</AlertTitle> : null}
      {description !== undefined ? <AlertDescription>{description}</AlertDescription> : null}
      {children ? (shorthand ? <div className="ef-alert__body">{children}</div> : children) : null}
      {action ? <div className="ef-alert__action">{action}</div> : null}
    </div>
  );
});

export const AlertTitle = React.forwardRef(function AlertTitle({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="alert-title" className={`ef-alert__title${className ? ' ' + className : ''}`} />;
});

export const AlertDescription = React.forwardRef(function AlertDescription({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="alert-description" className={`ef-alert__description${className ? ' ' + className : ''}`} />;
});
