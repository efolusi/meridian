import React from 'react';
import { injectEfCss, mergeRefs } from '../forms/Button.jsx';

const CSS = `
.ef-bubble-group{display:flex;min-width:0;flex-direction:column;gap:8px}
.ef-bubble{position:relative;display:flex;width:fit-content;max-width:80%;min-width:0;flex-direction:column;gap:4px}
.ef-bubble[data-align="end"]{align-self:flex-end}
.ef-bubble[data-variant="ghost"]{max-width:100%}
.ef-bubble__content{width:fit-content;max-width:100%;min-width:0;overflow:hidden;overflow-wrap:anywhere;padding:8px 12px;border:1px solid transparent;border-radius:var(--radius-lg);font-size:var(--text-sm);line-height:var(--leading-relaxed)}
.ef-bubble[data-align="end"]>.ef-bubble__content{align-self:flex-end}
.ef-bubble[data-variant="default"]>.ef-bubble__content{background:var(--accent);color:var(--accent-contrast)}
.ef-bubble[data-variant="secondary"]>.ef-bubble__content{background:var(--surface-sunken);color:var(--text-primary)}
.ef-bubble[data-variant="muted"]>.ef-bubble__content{background:var(--surface-subtle);color:var(--text-secondary)}
.ef-bubble[data-variant="tinted"]>.ef-bubble__content{background:var(--accent-subtle);color:var(--text-primary)}
.ef-bubble[data-variant="outline"]>.ef-bubble__content{border-color:var(--border-default);background:var(--surface-card);color:var(--text-primary)}
.ef-bubble[data-variant="ghost"]>.ef-bubble__content{padding:0;border-radius:0;background:transparent;color:var(--text-primary)}
.ef-bubble[data-variant="destructive"]>.ef-bubble__content{background:var(--danger-subtle);color:var(--danger-700)}
.ef-bubble__content:is(button,a){cursor:pointer;text-align:start;transition:filter var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-bubble__content:is(button,a):hover{filter:brightness(.96)}
.ef-bubble__content:is(button,a):focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-bubble__reactions{position:absolute;z-index:1;display:flex;width:fit-content;flex-shrink:0;align-items:center;justify-content:center;gap:4px;padding:2px 6px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-sm);box-shadow:0 0 0 3px var(--surface-card)}
.ef-bubble__reactions:has(button){padding:0}
.ef-bubble__reactions[data-side="top"]{inset-block-start:0;transform:translateY(-75%)}
.ef-bubble__reactions[data-side="bottom"]{inset-block-end:0;transform:translateY(75%)}
.ef-bubble__reactions[data-align="start"]{inset-inline-start:12px}
.ef-bubble__reactions[data-align="end"]{inset-inline-end:12px}
`;

function classes(base, className) {
  return base + (className ? ` ${className}` : '');
}

export const BubbleGroup = React.forwardRef(function BubbleGroup({ className, ...rest }, ref) {
  injectEfCss('ef-css-bubble', CSS);
  return <div {...rest} ref={ref} data-slot="bubble-group" className={classes('ef-bubble-group', className)} />;
});

export const Bubble = React.forwardRef(function Bubble({ variant = 'default', align = 'start', className, ...rest }, ref) {
  injectEfCss('ef-css-bubble', CSS);
  const resolvedVariant = ['default', 'secondary', 'muted', 'tinted', 'outline', 'ghost', 'destructive'].includes(variant) ? variant : 'default';
  const resolvedAlign = align === 'end' ? 'end' : 'start';
  return <div {...rest} ref={ref} data-slot="bubble" data-variant={resolvedVariant} data-align={resolvedAlign} className={classes('ef-bubble', className)} />;
});

export const BubbleContent = React.forwardRef(function BubbleContent({ asChild = false, children, className, ...rest }, ref) {
  const value = classes('ef-bubble__content', className);
  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ...rest,
      'data-slot': 'bubble-content',
      className: `${value}${child.props.className ? ` ${child.props.className}` : ''}`,
      ref: mergeRefs(ref, child.ref),
    });
  }
  return <div {...rest} ref={ref} data-slot="bubble-content" className={value}>{children}</div>;
});

export const BubbleReactions = React.forwardRef(function BubbleReactions({ side = 'bottom', align = 'end', className, ...rest }, ref) {
  const resolvedSide = side === 'top' ? 'top' : 'bottom';
  const resolvedAlign = align === 'start' ? 'start' : 'end';
  return <div {...rest} ref={ref} data-slot="bubble-reactions" data-side={resolvedSide} data-align={resolvedAlign} className={classes('ef-bubble__reactions', className)} />;
});
