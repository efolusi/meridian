'use client';
import React from 'react';
import { injectEfCss, mergeRefs } from '../runtime/runtime.jsx';
import { Separator } from './Separator.jsx';

const CSS = `
.ef-item-group{display:flex;flex-direction:column}
.ef-item-group>[data-slot="item-group-item"]{display:flex;flex-direction:column;min-width:0}
.ef-item{display:flex;flex-wrap:wrap;align-items:center;width:100%;border:1px solid transparent;border-radius:var(--radius-md);background:transparent;color:var(--text-primary);font-family:var(--font-sans);font-size:var(--text-sm);text-align:start;transition:background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-item[data-size="default"]{gap:var(--space-4);padding:var(--space-4)}.ef-item[data-size="sm"]{gap:var(--space-3);padding:var(--space-3) var(--space-4)}.ef-item[data-size="xs"]{gap:var(--space-2);padding:var(--space-2) var(--space-3)}
.ef-item[data-variant="outline"]{border-color:var(--border-default)}.ef-item[data-variant="muted"]{background:var(--surface-sunken)}
.ef-item:is(a,button){cursor:pointer;text-decoration:none}.ef-item:is(a,button):hover{background:var(--surface-sunken);text-decoration:none}.ef-item:is(a,button):focus-visible{outline:none;border-color:var(--accent);box-shadow:var(--focus-ring)}
.ef-item__media{display:flex;flex:none;align-items:center;justify-content:center;gap:var(--space-2)}.ef-item:has(.ef-item__description)>.ef-item__media{align-self:flex-start;margin-top:var(--space-0-5)}
.ef-item__media[data-variant="icon"]{width:32px;height:32px;border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--surface-sunken)}
.ef-item__media[data-variant="image"]{width:40px;height:40px;overflow:hidden;border-radius:var(--radius-sm)}.ef-item__media[data-variant="image"] img{width:100%;height:100%;object-fit:cover}
.ef-item__content{display:flex;min-width:0;flex:1;flex-direction:column;gap:var(--space-1)}.ef-item__content+.ef-item__content{flex:none}
.ef-item__title{display:flex;width:fit-content;align-items:center;gap:var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-medium);line-height:1.35}
.ef-item__description{display:-webkit-box;overflow:hidden;margin:0;color:var(--text-muted);font-size:var(--text-sm);font-weight:var(--weight-regular);line-height:1.5;text-wrap:balance;-webkit-box-orient:vertical;-webkit-line-clamp:2}.ef-item__description>a{text-decoration:underline;text-underline-offset:4px}.ef-item__description>a:hover{color:var(--text-primary)}
.ef-item__actions{display:flex;flex:none;align-items:center;gap:var(--space-2);margin-inline-start:auto}.ef-item__header,.ef-item__footer{display:flex;flex-basis:100%;align-items:center;justify-content:space-between;gap:var(--space-2)}
.ef-item-separator{margin-block:0}
`;

function classes(...values) {
  return values.filter(Boolean).join(' ');
}

function renderRoot({ render, asChild, children, rootProps, ref }) {
  const candidate = render || (asChild ? React.Children.only(children) : null);
  if (typeof candidate === 'function') return candidate({ ...rootProps, ref });
  if (React.isValidElement(candidate)) {
    return React.cloneElement(candidate, {
      ...rootProps,
      ...candidate.props,
      className: classes(rootProps.className, candidate.props.className),
      ref: mergeRefs(ref, candidate.ref),
      children: candidate.props.children ?? children,
    });
  }
  return <div {...rootProps} ref={ref}>{children}</div>;
}

// A list must hold list items. Each child sits in a listitem wrapper that is a real box
// (screen readers drop the role of a display:contents element), laid out so the group's gap
// and the item's own width stay the same. Separators stay decorative inside the list.
export const ItemGroup = React.forwardRef(function ItemGroup({ className, children, ...props }, ref) {
  injectEfCss('ef-css-item', CSS);
  const items = React.Children.map(children, (child) => {
    if (child == null || child === false) return child;
    if (React.isValidElement(child) && child.type === ItemSeparator) return React.cloneElement(child, { decorative: true });
    return <div role="listitem" data-slot="item-group-item">{child}</div>;
  });
  return <div ref={ref} role="list" data-slot="item-group" className={classes('ef-item-group', className)} {...props}>{items}</div>;
});

export const ItemSeparator = React.forwardRef(function ItemSeparator({ className, ...props }, ref) {
  return <Separator ref={ref} data-slot="item-separator" orientation="horizontal" className={classes('ef-item-separator', className)} {...props} />;
});

export const Item = React.forwardRef(function Item({ variant = 'default', size = 'default', render, asChild = false, className, children, ...props }, ref) {
  injectEfCss('ef-css-item', CSS);
  const rootProps = { ...props, 'data-slot': 'item', 'data-variant': variant, 'data-size': size, className: classes('ef-item', className), children };
  return renderRoot({ render, asChild, children, rootProps, ref });
});

export const ItemMedia = React.forwardRef(function ItemMedia({ variant = 'default', className, ...props }, ref) {
  return <div ref={ref} data-slot="item-media" data-variant={variant} className={classes('ef-item__media', className)} {...props} />;
});

export const ItemContent = React.forwardRef(function ItemContent({ className, ...props }, ref) {
  return <div ref={ref} data-slot="item-content" className={classes('ef-item__content', className)} {...props} />;
});

export const ItemTitle = React.forwardRef(function ItemTitle({ className, ...props }, ref) {
  return <div ref={ref} data-slot="item-title" className={classes('ef-item__title', className)} {...props} />;
});

export const ItemDescription = React.forwardRef(function ItemDescription({ className, ...props }, ref) {
  return <p ref={ref} data-slot="item-description" className={classes('ef-item__description', className)} {...props} />;
});

export const ItemActions = React.forwardRef(function ItemActions({ className, ...props }, ref) {
  return <div ref={ref} data-slot="item-actions" className={classes('ef-item__actions', className)} {...props} />;
});

export const ItemHeader = React.forwardRef(function ItemHeader({ className, ...props }, ref) {
  return <div ref={ref} data-slot="item-header" className={classes('ef-item__header', className)} {...props} />;
});

export const ItemFooter = React.forwardRef(function ItemFooter({ className, ...props }, ref) {
  return <div ref={ref} data-slot="item-footer" className={classes('ef-item__footer', className)} {...props} />;
});
