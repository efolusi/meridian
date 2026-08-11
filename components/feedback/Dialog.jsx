import React from 'react';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss, mergeRefs } from '../forms/Button.jsx';
import { Portal } from '../overlay/Portal.jsx';
const CSS = `
.ef-dialog__overlay{position:fixed;inset:0;z-index:var(--z-overlay);display:flex;align-items:center;justify-content:center;padding:24px;background:var(--overlay-scrim);animation:ef-fade var(--dur-med) var(--ease-out)}
.ef-dialog__content{width:100%;max-width:440px;max-height:min(85vh,720px);overflow:auto;border:1px solid var(--border-default);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-pop);animation:ef-pop var(--dur-slow) var(--ease-spring)}
.ef-dialog__content:focus{outline:none}.ef-dialog__close{position:absolute;inset-block-start:14px;inset-inline-end:14px}
.ef-dialog__header{display:flex;flex-direction:column;gap:6px;padding:24px 24px 0;padding-inline-end:56px}
.ef-dialog__title{margin:0;font-family:var(--font-display);font-size:var(--text-xl);font-weight:var(--weight-bold);line-height:var(--leading-tight);letter-spacing:var(--tracking-tight);color:var(--text-primary)}
.ef-dialog__description{font-size:var(--text-md);line-height:var(--leading-relaxed);color:var(--text-secondary)}
.ef-dialog__body{padding:16px 24px 24px}.ef-dialog__footer{display:flex;flex-direction:column-reverse;gap:8px;padding:14px 24px;border-top:1px solid var(--border-default);background:var(--surface-subtle)}
@media(min-width:480px){.ef-dialog__footer{flex-direction:row;justify-content:flex-end}}
@keyframes ef-fade{from{opacity:0}}@keyframes ef-pop{from{opacity:0;transform:scale(.96) translateY(6px)}}
`;
const DialogContext = React.createContext(null);
const FOCUSABLE = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
function cx(base, className) { return base + (className ? ` ${className}` : ''); }
function compose(first, second) { return e => { if (first) first(e); if (!e.defaultPrevented && second) second(e); }; }

export function Dialog({ open: controlled, defaultOpen = false, onOpenChange, children }) {
  injectEfCss('ef-css-dialog', CSS);
  const [internal, setInternal] = React.useState(defaultOpen);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const open = controlled === undefined ? internal : controlled;
  const setOpen = React.useCallback(next => { if (controlled === undefined) setInternal(next); onOpenChange?.(next); }, [controlled, onOpenChange]);
  const value = React.useMemo(() => ({ open, setOpen, titleId, descriptionId }), [open, setOpen, titleId, descriptionId]);
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export const DialogTrigger = React.forwardRef(function DialogTrigger({ asChild = false, children, onClick, slot = 'dialog-trigger', ...rest }, ref) {
  const ctx = React.useContext(DialogContext);
  const props = { ...rest, 'data-slot': slot, onClick: compose(onClick, () => ctx && ctx.setOpen(true)) };
  if (asChild) { const child = React.Children.only(children); return React.cloneElement(child, { ...props, ref: mergeRefs(ref, child.ref), className: child.props.className }); }
  return <button {...props} ref={ref} type={rest.type || 'button'}>{children}</button>;
});
export function DialogPortal({ children, container }) { return <Portal container={container}>{children}</Portal>; }
export const DialogOverlay = React.forwardRef(function DialogOverlay({ className, onMouseDown, slot = 'dialog-overlay', ...rest }, ref) {
  const ctx = React.useContext(DialogContext);
  return <div {...rest} ref={ref} data-slot={slot} className={cx('ef-dialog__overlay', className)} onMouseDown={compose(onMouseDown, e => { if (e.target === e.currentTarget && ctx) ctx.setOpen(false); })} />;
});
export const DialogClose = React.forwardRef(function DialogClose({ asChild = false, children, onClick, slot = 'dialog-close', ...rest }, ref) {
  const ctx = React.useContext(DialogContext); const props = { ...rest, 'data-slot': slot, onClick: compose(onClick, () => ctx && ctx.setOpen(false)) };
  if (asChild) { const child = React.Children.only(children); return React.cloneElement(child, { ...props, ref: mergeRefs(ref, child.ref), className: child.props.className }); }
  return <button {...props} ref={ref} type={rest.type || 'button'}>{children}</button>;
});
export const DialogContent = React.forwardRef(function DialogContent({ children, className, style, width = 440, showCloseButton = true, closeLabel = 'Close', onEscapeKeyDown, overlayProps, overlayRef, slot = 'dialog-content', ...rest }, ref) {
  const ctx = React.useContext(DialogContext); const panelRef = React.useRef(null); const previous = React.useRef(null);
  React.useEffect(() => { if (!ctx || !ctx.open) return; previous.current = document.activeElement; const panel = panelRef.current; const first = panel && panel.querySelector(FOCUSABLE); (first || panel).focus(); return () => previous.current && previous.current.focus && previous.current.focus(); }, [ctx && ctx.open]);
  React.useEffect(() => { if (!ctx || !ctx.open) return; const key = e => { if (e.key === 'Escape') { if (onEscapeKeyDown) onEscapeKeyDown(e); if (!e.defaultPrevented) ctx.setOpen(false); return; } if (e.key !== 'Tab') return; const f = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter(x => !x.disabled); if (!f.length) return e.preventDefault(); const i=f.indexOf(document.activeElement); if (e.shiftKey && i<=0) { e.preventDefault(); f[f.length-1].focus(); } else if (!e.shiftKey && (i<0 || i===f.length-1)) { e.preventDefault(); f[0].focus(); } }; document.addEventListener('keydown', key); return () => document.removeEventListener('keydown', key); }, [ctx && ctx.open, onEscapeKeyDown]);
  if (!ctx || !ctx.open) return null;
  return <DialogPortal><DialogOverlay {...overlayProps} ref={overlayRef}><div {...rest} ref={mergeRefs(ref, panelRef)} data-slot={slot} role="dialog" aria-modal="true" aria-labelledby={rest['aria-label'] ? undefined : ctx.titleId} aria-describedby={ctx.descriptionId} tabIndex={-1} className={cx('ef-dialog__content', className)} style={{ position:'relative', maxWidth: width, ...style }}>{children}{showCloseButton ? <div className="ef-dialog__close"><IconButton icon="x" label={closeLabel} size="sm" onClick={() => ctx.setOpen(false)} /></div> : null}</div></DialogOverlay></DialogPortal>;
});
export const DialogHeader = React.forwardRef(function DialogHeader({ className, slot = 'dialog-header', ...rest }, ref) { return <div {...rest} ref={ref} data-slot={slot} className={cx('ef-dialog__header', className)} />; });
export const DialogFooter = React.forwardRef(function DialogFooter({ className, slot = 'dialog-footer', ...rest }, ref) { return <div {...rest} ref={ref} data-slot={slot} className={cx('ef-dialog__footer', className)} />; });
export const DialogTitle = React.forwardRef(function DialogTitle({ className, id, slot = 'dialog-title', ...rest }, ref) { const ctx=React.useContext(DialogContext); return <div {...rest} ref={ref} id={id || (ctx && ctx.titleId)} data-slot={slot} className={cx('ef-dialog__title', className)} />; });
export const DialogDescription = React.forwardRef(function DialogDescription({ className, id, slot = 'dialog-description', ...rest }, ref) { const ctx=React.useContext(DialogContext); return <div {...rest} ref={ref} id={id || (ctx && ctx.descriptionId)} data-slot={slot} className={cx('ef-dialog__description', className)} />; });
