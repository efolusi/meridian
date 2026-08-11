import React from 'react';
import { injectEfCss, mergeRefs } from '../forms/Button.jsx';
import { Portal, useAnchoredStyle } from './Portal.jsx';

const CSS = `
.ef-hovercard__panel{position:fixed;width:256px;background:var(--surface-card);color:var(--text-primary);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:16px;z-index:var(--z-popover);animation:ef-hovercard-in var(--dur-med) var(--ease-out)}
@keyframes ef-hovercard-in{from{opacity:0;transform:translateY(2px)}}
`;

const HoverCardCtx = React.createContext(null);

function compose(theirs, ours) {
  return event => { theirs?.(event); if (!event.defaultPrevented) ours?.(event); };
}

export function HoverCard({ open: controlled, defaultOpen = false, onOpenChange, openDelay = 700, closeDelay = 300, children }) {
  injectEfCss('ef-css-hovercard', CSS);
  const [inner, setInner] = React.useState(defaultOpen);
  const open = controlled !== undefined ? controlled : inner;
  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);
  const timerRef = React.useRef(null);
  const contentId = React.useId();
  const setOpen = React.useCallback(next => {
    if (controlled === undefined) setInner(next);
    onOpenChange?.(next);
  }, [controlled, onOpenChange]);
  const clearTimer = React.useCallback(() => clearTimeout(timerRef.current), []);
  const openSoon = React.useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(true), openDelay);
  }, [clearTimer, openDelay, setOpen]);
  const closeSoon = React.useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(false), closeDelay);
  }, [clearTimer, closeDelay, setOpen]);
  React.useEffect(() => clearTimer, [clearTimer]);
  React.useEffect(() => {
    if (!open) return;
    const key = event => {
      if (event.key === 'Escape') {
        clearTimer();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [clearTimer, open, setOpen]);
  const value = React.useMemo(() => ({ open, setOpen, openSoon, closeSoon, clearTimer, triggerRef, contentRef, contentId }), [open, setOpen, openSoon, closeSoon, clearTimer, contentId]);
  return <HoverCardCtx.Provider value={value}>{children}</HoverCardCtx.Provider>;
}

export const HoverCardTrigger = React.forwardRef(function HoverCardTrigger({ asChild = false, children, ...rest }, forwardedRef) {
  const ctx = React.useContext(HoverCardCtx);
  const props = {
    ...rest,
    ref: mergeRefs(forwardedRef, ctx?.triggerRef),
    'data-slot': 'hover-card-trigger',
    'data-state': ctx?.open ? 'open' : 'closed',
    'aria-expanded': ctx?.open,
    'aria-controls': ctx?.open ? ctx.contentId : undefined,
    onMouseEnter: compose(rest.onMouseEnter, ctx?.openSoon),
    onMouseLeave: compose(rest.onMouseLeave, ctx?.closeSoon),
    onFocus: compose(rest.onFocus, () => { ctx?.clearTimer(); ctx?.setOpen(true); }),
    onBlur: compose(rest.onBlur, ctx?.closeSoon),
  };
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...children.props,
      ref: mergeRefs(children.ref, props.ref),
      onMouseEnter: compose(children.props.onMouseEnter, props.onMouseEnter),
      onMouseLeave: compose(children.props.onMouseLeave, props.onMouseLeave),
      onFocus: compose(children.props.onFocus, props.onFocus),
      onBlur: compose(children.props.onBlur, props.onBlur),
      'data-slot': 'hover-card-trigger',
      'data-state': props['data-state'],
      'aria-expanded': props['aria-expanded'],
      'aria-controls': props['aria-controls'],
    });
  }
  return <button type="button" {...props}>{children}</button>;
});

export const HoverCardContent = React.forwardRef(function HoverCardContent({ align = 'center', side = 'bottom', sideOffset = 4, alignOffset = 0, className, style, children, ...rest }, forwardedRef) {
  const ctx = React.useContext(HoverCardCtx);
  const fallbackTriggerRef = React.useRef(null);
  const fallbackContentRef = React.useRef(null);
  const { style: anchored, side: resolvedSide } = useAnchoredStyle(ctx?.triggerRef ?? fallbackTriggerRef, ctx?.contentRef ?? fallbackContentRef, {
    open: !!ctx?.open,
    placement: side,
    align,
    offset: sideOffset,
    crossOffset: alignOffset,
  });
  if (!ctx?.open) return null;
  return (
    <Portal>
      <div {...rest} ref={mergeRefs(forwardedRef, ctx.contentRef)} id={ctx.contentId} data-slot="hover-card-content" data-state="open" data-side={resolvedSide} data-align={align}
        onMouseEnter={compose(rest.onMouseEnter, ctx.clearTimer)} onMouseLeave={compose(rest.onMouseLeave, ctx.closeSoon)}
        className={`ef-hovercard__panel${className ? ' ' + className : ''}`} style={{ ...anchored, ...style }}>{children}</div>
    </Portal>
  );
});
