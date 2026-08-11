import React from 'react';
import { injectEfCss, mergeRefs } from '../forms/Button.jsx';
import { Portal, useAnchoredStyle } from './Portal.jsx';

const CSS = `
.ef-popover{position:relative;display:inline-flex}
.ef-popover__panel{position:fixed;width:280px;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:14px;z-index:var(--z-dropdown);animation:ef-pop-in var(--dur-fast) var(--ease-out)}
.ef-popover__header{display:grid;gap:4px;margin-bottom:12px}
.ef-popover__title{margin:0;color:var(--text-primary);font-size:var(--text-md);font-weight:var(--weight-semibold);line-height:1.35}
.ef-popover__description{margin:0;color:var(--text-muted);font-size:var(--text-sm);line-height:1.45}
@keyframes ef-pop-in{from{opacity:0;transform:translateY(-3px)}}
`;
const PopoverCtx = React.createContext(null);

function compose(theirs, ours) {
  return event => { theirs?.(event); if (!event.defaultPrevented) ours?.(event); };
}

export function Popover({ children, open: controlled, defaultOpen = false, onOpenChange }) {
  injectEfCss('ef-css-popover', CSS);
  const [inner, setInner] = React.useState(defaultOpen);
  const open = controlled !== undefined ? controlled : inner;
  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);
  const contentId = React.useId();
  const setOpen = React.useCallback(next => {
    if (controlled === undefined) setInner(next);
    onOpenChange?.(next);
  }, [controlled, onOpenChange]);
  const value = React.useMemo(() => ({ open, setOpen, triggerRef, contentRef, contentId }), [open, setOpen, contentId]);
  React.useEffect(() => {
    if (!open) return;
    const away = event => {
      if (!triggerRef.current?.contains(event.target) && !contentRef.current?.contains(event.target)) setOpen(false);
    };
    const key = event => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', away);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', key);
    };
  }, [open, setOpen]);

  return <PopoverCtx.Provider value={value}>{children}</PopoverCtx.Provider>;
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

export const PopoverContent = React.forwardRef(function PopoverContent({ align = 'center', side = 'bottom', sideOffset = 8, width, role = 'dialog', className, style, children, ...rest }, forwardedRef) {
  const ctx = React.useContext(PopoverCtx);
  const fallbackTriggerRef = React.useRef(null);
  const fallbackContentRef = React.useRef(null);
  const placement = side === 'top' ? 'top' : 'bottom';
  const { style: anchored } = useAnchoredStyle(ctx?.triggerRef ?? fallbackTriggerRef, ctx?.contentRef ?? fallbackContentRef, { open: !!ctx?.open, placement, align, offset: sideOffset });
  if (!ctx?.open) return null;
  return (
    <Portal>
      <div {...rest} ref={mergeRefs(forwardedRef, ctx.contentRef)} id={ctx.contentId} role={role} data-slot="popover-content" data-state="open" data-side={placement} data-align={align}
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
