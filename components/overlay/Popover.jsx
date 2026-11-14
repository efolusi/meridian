'use client';
import React from 'react';
import { injectEfCss, mergeRefs, useIsoLayoutEffect } from '../forms/Button.jsx';
import { Portal, useAnchoredStyle, useEscapeLayer, escapeLayerContext } from './Portal.jsx';

const CSS = `
.ef-popover{position:relative;display:inline-flex}
.ef-popover__panel{position:fixed;width:280px;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:14px;z-index:var(--z-popover);animation:ef-pop-in var(--dur-fast) var(--ease-out)}
.ef-popover__header{display:grid;gap:4px;margin-bottom:12px}
.ef-popover__title{margin:0;color:var(--text-primary);font-size:var(--text-md);font-weight:var(--weight-semibold);line-height:1.35}
.ef-popover__description{margin:0;color:var(--text-muted);font-size:var(--text-sm);line-height:1.45}
@keyframes ef-pop-in{from{opacity:0;transform:translateY(-3px)}}
`;
const PopoverCtx = React.createContext(null);
const TABBABLE = 'a[href],button,input,select,textarea,[tabindex]';
const tabbable = root => [...root.querySelectorAll(TABBABLE)].filter(node => !node.disabled && node.tabIndex >= 0 && !node.closest('[hidden]'));

function compose(theirs, ours) {
  return event => { theirs?.(event); if (!event.defaultPrevented) ours?.(event); };
}

export function Popover({ children, open: controlled, defaultOpen = false, onOpenChange }) {
  injectEfCss('ef-css-popover', CSS);
  const [inner, setInner] = React.useState(defaultOpen);
  const open = controlled !== undefined ? controlled : inner;
  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);
  // The content's own `id` wins over the generated one, and the trigger's
  // aria attribute follows whichever is rendered.
  const baseId = React.useId();
  const [customId, setContentId] = React.useState();
  const contentId = customId || baseId;
  const setOpen = React.useCallback(next => {
    if (controlled === undefined) setInner(next);
    onOpenChange?.(next);
  }, [controlled, onOpenChange]);
  const value = React.useMemo(() => ({ open, setOpen, triggerRef, contentRef, contentId, setContentId }), [open, setOpen, contentId, setContentId]);
  React.useEffect(() => {
    if (!open) return;
    const away = event => {
      if (!triggerRef.current?.contains(event.target) && !contentRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    document.addEventListener('mousedown', away);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('mousedown', away);
    };
  }, [open, setOpen]);
  // The panel is portaled to the end of <body>, so the browser's Tab order
  // runs from the trigger straight past it. Stitch it back in: Tab from the
  // trigger enters the panel, Shift+Tab from its first stop returns to the
  // trigger, and Tab past its last stop continues after the trigger.
  React.useEffect(() => {
    if (!open) return;
    const tab = event => {
      if (event.key !== 'Tab' || event.defaultPrevented) return;
      const trigger = triggerRef.current;
      const panel = contentRef.current;
      if (!trigger || !panel) return;
      const inside = tabbable(panel);
      const active = document.activeElement;
      if (active === trigger && !event.shiftKey && inside.length) {
        event.preventDefault();
        inside[0].focus();
      } else if (event.shiftKey && inside.length && active === inside[0]) {
        event.preventDefault();
        trigger.focus();
      } else if (!event.shiftKey && (inside.length ? active === inside[inside.length - 1] : active === panel)) {
        // inside a modal the order wraps within that modal, not the page
        const modal = trigger.closest('[aria-modal="true"]');
        const page = tabbable(modal || document.body).filter(node => !panel.contains(node));
        const next = page[page.indexOf(trigger) + 1] || (modal ? page[0] : undefined);
        if (next) { event.preventDefault(); next.focus(); }
        setOpen(false);
      }
    };
    // capture phase: a dialog's focus trap listening on document must see the
    // key already handled, or it would wrap focus away from the panel
    document.addEventListener('keydown', tab, true);
    return () => document.removeEventListener('keydown', tab, true);
  }, [open, setOpen]);
  const layer = useEscapeLayer(open, () => {
    setOpen(false);
    triggerRef.current?.focus();
  });

  return <PopoverCtx.Provider value={value}><escapeLayerContext.Provider value={layer}>{children}</escapeLayerContext.Provider></PopoverCtx.Provider>;
}

export const PopoverTrigger = React.forwardRef(function PopoverTrigger({ asChild = false, children, ...rest }, forwardedRef) {
  const ctx = React.useContext(PopoverCtx);
  if (!ctx) return <button type="button" {...rest} ref={forwardedRef}>{children}</button>;
  const props = {
    ...rest,
    ref: mergeRefs(forwardedRef, ctx.triggerRef),
    'data-slot': 'popover-trigger',
    'aria-haspopup': 'dialog',
    'aria-expanded': ctx.open,
    'aria-controls': ctx.open ? ctx.contentId : undefined,
    onClick: compose(rest.onClick, () => ctx.setOpen(!ctx.open)),
  };
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...children.props,
      ref: mergeRefs(children.ref, props.ref),
      onClick: compose(children.props.onClick, props.onClick),
      'data-slot': 'popover-trigger',
      'aria-haspopup': 'dialog',
      'aria-expanded': ctx.open,
      'aria-controls': props['aria-controls'],
    });
  }
  return <button type="button" {...props}>{children}</button>;
});

export const PopoverContent = React.forwardRef(function PopoverContent({ align = 'center', side = 'bottom', sideOffset = 8, width, role = 'dialog', className, style, children, id, ...rest }, forwardedRef) {
  const ctx = React.useContext(PopoverCtx);
  const registerId = ctx?.setContentId;
  useIsoLayoutEffect(() => {
    if (!registerId) return;
    registerId(id);
    return () => registerId(undefined);
  }, [registerId, id]);
  const fallbackTriggerRef = React.useRef(null);
  const fallbackContentRef = React.useRef(null);
  const placement = side === 'top' ? 'top' : 'bottom';
  const { style: anchored } = useAnchoredStyle(ctx?.triggerRef ?? fallbackTriggerRef, ctx?.contentRef ?? fallbackContentRef, { open: !!ctx?.open, placement, align, offset: sideOffset });
  if (!ctx?.open) return null;
  return (
    <Portal>
      <div {...rest} ref={mergeRefs(forwardedRef, ctx.contentRef)} id={id || ctx.contentId} role={role} data-slot="popover-content" data-state="open" data-side={placement} data-align={align}
        className={`ef-popover__panel${className ? ' ' + className : ''}`} style={{ ...anchored, width: width ?? undefined, ...style }}>{children}</div>
    </Portal>
  );
});

export const PopoverHeader = React.forwardRef(function PopoverHeader({ className, ...props }, ref) {
  return <div {...props} ref={ref} data-slot="popover-header" className={`ef-popover__header${className ? ' ' + className : ''}`} />;
});
export const PopoverTitle = React.forwardRef(function PopoverTitle({ className, ...props }, ref) {
  return <h2 {...props} ref={ref} data-slot="popover-title" className={`ef-popover__title${className ? ' ' + className : ''}`} />;
});
export const PopoverDescription = React.forwardRef(function PopoverDescription({ className, ...props }, ref) {
  return <p {...props} ref={ref} data-slot="popover-description" className={`ef-popover__description${className ? ' ' + className : ''}`} />;
});
