import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';

const CSS = `
.ef-alert{position:relative;display:grid;grid-template-columns:0 1fr;align-items:start;gap:2px 10px;width:100%;padding:12px 14px;border:1px solid var(--border-strong);border-radius:var(--radius-md);background:var(--surface-card);color:var(--text-primary)}
.ef-alert:has(>svg){grid-template-columns:auto 1fr}
.ef-alert:has(>.ef-alert__action){padding-inline-end:96px}
.ef-alert>svg{grid-column:1;grid-row:1/3;margin-top:2px;color:currentColor}
.ef-alert>.ef-alert__title,.ef-alert>.ef-alert__description{grid-column:2}
.ef-alert--success{border-color:var(--success-300);color:var(--success-600)}
.ef-alert--warning{border-color:var(--warning-300);color:var(--warning-600)}
.ef-alert--danger,.ef-alert--destructive{border-color:var(--danger-300);color:var(--danger-700)}
.ef-alert__title{font-size:var(--text-md);font-weight:var(--weight-semibold);line-height:1.4;color:currentColor}
.ef-alert__description{font-size:var(--text-sm);line-height:1.5;color:var(--text-secondary)}
.ef-alert--danger>.ef-alert__description,.ef-alert--destructive>.ef-alert__description{color:var(--danger-700)}
.ef-alert__action{position:absolute;inset-block-start:10px;inset-inline-end:12px}
`;

export const Alert = React.forwardRef(function Alert({
  variant = 'default',
  children,
  className,
  ...rest
}, ref) {
  injectEfCss('ef-css-alert', CSS);
  const classes = ['ef-alert', `ef-alert--${variant}`, className || ''].filter(Boolean).join(' ');

  return (
    <div {...rest} ref={ref} data-slot="alert" role="alert" className={classes}>
      {children}
    </div>
  );
});

export const AlertTitle = React.forwardRef(function AlertTitle({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="alert-title" className={`ef-alert__title${className ? ' ' + className : ''}`} />;
});

export const AlertDescription = React.forwardRef(function AlertDescription({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="alert-description" className={`ef-alert__description${className ? ' ' + className : ''}`} />;
});

export const AlertAction = React.forwardRef(function AlertAction({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="alert-action" className={`ef-alert__action${className ? ' ' + className : ''}`} />;
});
