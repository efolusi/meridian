'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';

const CSS = `
.ef-alert{position:relative;display:grid;grid-template-columns:0 1fr;align-items:start;gap:var(--space-0-5) var(--space-3);width:100%;padding:var(--space-3) var(--space-4);border:1px solid var(--border-strong);border-radius:var(--radius-md);background:var(--surface-card);color:var(--text-primary)}
.ef-alert:has(>[data-slot=icon]){grid-template-columns:auto 1fr}
.ef-alert:has(>.ef-alert__action){grid-template-columns:0 1fr auto;column-gap:var(--space-4)}
.ef-alert:has(>[data-slot=icon]):has(>.ef-alert__action){grid-template-columns:auto 1fr auto}
.ef-alert>[data-slot=icon]{grid-column:1;grid-row:1/3;margin-top:var(--space-0-5);color:currentColor}
.ef-alert>.ef-alert__title,.ef-alert>.ef-alert__description{grid-column:2}
.ef-alert--success{border-color:var(--status-success-border);color:var(--status-success-text)}
.ef-alert--warning{border-color:var(--status-warning-border);color:var(--status-warning-text)}
.ef-alert--danger{border-color:var(--status-danger-border);color:var(--status-danger-text)}
.ef-alert__title{font-size:var(--text-md);font-weight:var(--weight-semibold);line-height:1.4;color:currentColor}
.ef-alert__description{font-size:var(--text-sm);line-height:1.5;color:var(--text-secondary)}
.ef-alert--danger>.ef-alert__description{color:var(--status-danger-text)}
.ef-alert>.ef-alert__action{grid-column:3;grid-row:1/3;align-self:start;margin-top:calc(-1 * var(--space-0-5))}
@media (max-width:559px){.ef-alert:has(>.ef-alert__action){grid-template-columns:0 1fr}.ef-alert:has(>[data-slot=icon]):has(>.ef-alert__action){grid-template-columns:auto 1fr}.ef-alert>.ef-alert__action{grid-column:2;grid-row:auto;margin-top:var(--space-2)}}
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
