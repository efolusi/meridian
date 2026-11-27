'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';

// Colour alone must not carry the state (WCAG 1.4.1): each variant has a glyph. A caller icon replaces it.
const DEFAULT_ICON = { default: 'info', success: 'circle-check', warning: 'triangle-alert', danger: 'circle-alert' };
const isIcon = (child) => React.isValidElement(child) && (child.type === Icon || child.type === 'svg' || child.props['data-slot'] === 'icon');

const CSS = `
/* The parts are found by class and by descendant, not as direct children: a template runtime (the starters' DC runtime) wraps each
   part in a display:contents element, which a child combinator cannot see through and which left the title in a 0px column.
   The icon is any [data-slot=icon] that is not inside the title, description or action. */
.ef-alert{position:relative;display:grid;grid-template-columns:minmax(0,1fr);align-items:start;gap:var(--space-0-5) 0;width:100%;padding:var(--space-3) var(--space-4);border:1px solid var(--border-strong);border-radius:var(--radius-md);background:var(--surface-card);color:var(--text-primary)}
.ef-alert:has([data-slot=icon]:not(:is(.ef-alert__title,.ef-alert__description,.ef-alert__action) *)){grid-template-columns:auto minmax(0,1fr);column-gap:var(--space-3)}
.ef-alert:has(.ef-alert__action){grid-template-columns:minmax(0,1fr) auto;column-gap:var(--space-4)}
.ef-alert:has([data-slot=icon]:not(:is(.ef-alert__title,.ef-alert__description,.ef-alert__action) *)):has(.ef-alert__action){grid-template-columns:auto minmax(0,1fr) auto}
.ef-alert [data-slot=icon]:not(:is(.ef-alert__title,.ef-alert__description,.ef-alert__action) *){grid-column:1;grid-row:1/3;margin-top:var(--space-0-5);color:currentColor}
/* The default icon steps aside for any other icon, however it was built (a caller icon, a template runtime's element). */
.ef-alert:has([data-slot=icon]:not([data-alert-default]):not(:is(.ef-alert__title,.ef-alert__description,.ef-alert__action) *)) [data-alert-default]{display:none}
.ef-alert .ef-alert__title,.ef-alert .ef-alert__description{grid-column:1}
.ef-alert:has([data-slot=icon]:not(:is(.ef-alert__title,.ef-alert__description,.ef-alert__action) *)) .ef-alert__title,.ef-alert:has([data-slot=icon]:not(:is(.ef-alert__title,.ef-alert__description,.ef-alert__action) *)) .ef-alert__description{grid-column:2}
.ef-alert--success{border-color:var(--status-success-border);color:var(--status-success-text)}
.ef-alert--warning{border-color:var(--status-warning-border);color:var(--status-warning-text)}
.ef-alert--danger{border-color:var(--status-danger-border);color:var(--status-danger-text)}
.ef-alert__title{font-size:var(--text-md);font-weight:var(--weight-semibold);line-height:1.4;color:currentColor}
.ef-alert__description{font-size:var(--text-sm);line-height:1.5;color:var(--text-secondary)}
.ef-alert--danger .ef-alert__description{color:var(--status-danger-text)}
.ef-alert .ef-alert__action{grid-column:2;grid-row:1/3;align-self:start;margin-top:calc(-1 * var(--space-0-5))}
.ef-alert:has([data-slot=icon]:not(:is(.ef-alert__title,.ef-alert__description,.ef-alert__action) *)) .ef-alert__action{grid-column:3}
@media (max-width:559px){.ef-alert:has(.ef-alert__action){grid-template-columns:minmax(0,1fr)}.ef-alert:has([data-slot=icon]:not(:is(.ef-alert__title,.ef-alert__description,.ef-alert__action) *)):has(.ef-alert__action){grid-template-columns:auto minmax(0,1fr)}.ef-alert .ef-alert__action{grid-column:1;grid-row:auto;margin-top:var(--space-2)}.ef-alert:has([data-slot=icon]:not(:is(.ef-alert__title,.ef-alert__description,.ef-alert__action) *)) .ef-alert__action{grid-column:2}}
`;

export const Alert = React.forwardRef(function Alert({
  variant = 'default',
  icon,
  children,
  className,
  ...rest
}, ref) {
  injectEfCss('ef-css-alert', CSS);
  const classes = ['ef-alert', `ef-alert--${variant}`, className || ''].filter(Boolean).join(' ');
  const name = icon === false || React.Children.toArray(children).some(isIcon) ? null : icon || DEFAULT_ICON[variant];

  return (
    <div {...rest} ref={ref} data-slot="alert" role="alert" className={classes}>
      {name ? <Icon name={name} size={16} data-alert-default={icon ? undefined : ''} /> : null}
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
