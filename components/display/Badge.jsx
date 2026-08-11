import React from 'react';
import { injectEfCss, mergeRefs } from '../forms/Button.jsx';

const CSS = `
.ef-badge{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:20px;padding:0 8px;border:1px solid transparent;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);line-height:1;white-space:nowrap;text-decoration:none;transition:background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-badge:hover,.ef-badge:focus,.ef-badge:visited{text-decoration:none}
.ef-badge:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-badge--md{height:24px;padding:0 10px;font-size:var(--text-sm)}
.ef-badge__dot{width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}
.ef-badge--default{background:var(--accent);color:var(--accent-contrast)}
.ef-badge--secondary,.ef-badge--neutral{background:var(--surface-sunken);color:var(--text-secondary)}
.ef-badge--destructive{background:var(--danger-600);color:var(--danger-contrast)}
.ef-badge--outline{background:transparent;border-color:var(--border-strong);color:var(--text-primary)}
.ef-badge--ghost{background:transparent;color:var(--text-secondary)}
.ef-badge--link{height:auto;padding:0;background:transparent;color:var(--text-link)}
.ef-badge--accent{background:var(--accent-subtle);color:var(--brand-700)}
.ef-badge--success{background:var(--success-100);color:var(--success-600)}
.ef-badge--warning{background:var(--warning-100);color:var(--warning-600)}
.ef-badge--danger{background:var(--danger-100);color:var(--danger-600)}
.ef-badge--brand{background:var(--cream-50);color:var(--cocoa-700)}
.ef-badge--default:hover{background:var(--accent-hover)}
.ef-badge--secondary:hover,.ef-badge--neutral:hover,.ef-badge--outline:hover,.ef-badge--ghost:hover{background:var(--surface-sunken)}
.ef-badge--destructive:hover{background:var(--danger-700)}
.ef-badge--link:hover{color:var(--text-link-hover);text-decoration:underline}
[data-theme="dark"] .ef-badge--accent{color:var(--brand-300)}
[data-theme="dark"] .ef-badge--brand{background:var(--accent-subtle);color:var(--brand-300)}
`;

const TONE_VARIANTS = {
  neutral: 'neutral',
  accent: 'accent',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  brand: 'brand',
};

export function badgeVariants({ variant = 'default', tone, size = 'sm', className = '' } = {}) {
  const resolved = tone ? TONE_VARIANTS[tone] : variant;
  return `ef-badge ef-badge--${resolved}${size === 'md' ? ' ef-badge--md' : ''}${className ? ' ' + className : ''}`;
}

export const Badge = React.forwardRef(function Badge(
  { variant = 'default', tone, size = 'sm', dot, asChild = false, children, className, ...props },
  ref,
) {
  injectEfCss('ef-css-badge', CSS);
  const classes = badgeVariants({ variant, tone, size, className });
  const content = dot ? <><span aria-hidden="true" className="ef-badge__dot" />{children}</> : children;

  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      ref: mergeRefs(ref, child.ref),
      'data-slot': 'badge',
      className: `${classes}${child.props.className ? ' ' + child.props.className : ''}`,
      children: dot ? <><span aria-hidden="true" className="ef-badge__dot" />{child.props.children}</> : child.props.children,
    });
  }

  return (
    <span {...props} ref={ref} data-slot="badge" className={classes}>
      {content}
    </span>
  );
});
