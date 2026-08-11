import React from 'react';
import { injectEfCss, mergeRefs, buttonVariants } from '../forms/Button.jsx';
import { Portal } from '../overlay/Portal.jsx';

const CSS = `
.ef-alertdialog__overlay{position:fixed;inset:0;z-index:var(--z-overlay);display:grid;place-items:center;padding:24px;background:var(--overlay-scrim);animation:ef-alertdialog-fade var(--dur-med) var(--ease-out)}
.ef-alertdialog__content{width:100%;max-width:512px;padding:24px;background:var(--surface-card);color:var(--text-primary);border:1px solid var(--border-default);border-radius:var(--radius-lg);box-shadow:var(--shadow-pop);animation:ef-alertdialog-pop var(--dur-slow) var(--ease-spring)}
.ef-alertdialog__content:focus{outline:none}
.ef-alertdialog__content--sm{max-width:384px}
.ef-alertdialog__header{display:flex;flex-direction:column;gap:8px;text-align:start}
.ef-alertdialog__header:has(.ef-alertdialog__media){display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:16px}
.ef-alertdialog__header:has(.ef-alertdialog__media) .ef-alertdialog__description{grid-column:2}
.ef-alertdialog__title{margin:0;font-family:var(--font-display);font-size:var(--text-lg);font-weight:var(--weight-bold);line-height:var(--leading-tight);letter-spacing:var(--tracking-tight)}
.ef-alertdialog__description{margin:0;color:var(--text-secondary);font-size:var(--text-sm);line-height:var(--leading-relaxed)}
.ef-alertdialog__media{display:grid;grid-row:1/span 2;place-items:center;width:40px;height:40px;color:var(--text-primary);background:var(--surface-subtle);border-radius:var(--radius-md)}
.ef-alertdialog__footer{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:8px;margin-top:24px}
@media(max-width:520px){.ef-alertdialog__overlay{padding:16px}.ef-alertdialog__content{padding:20px}.ef-alertdialog__footer{flex-direction:column-reverse}.ef-alertdialog__footer .ef-btn{width:100%}}
@keyframes ef-alertdialog-fade{from{opacity:0}}
@keyframes ef-alertdialog-pop{from{opacity:0;transform:scale(.96) translateY(6px)}}
@media(prefers-reduced-motion:reduce){.ef-alertdialog__overlay,.ef-alertdialog__content{animation:none}}
`;

const AlertDialogContext = React.createContext(null);
const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function useAlertDialog(part) {
  const value = React.useContext(AlertDialogContext);
  if (!value) throw new Error(`${part} must be used inside AlertDialog`);
  return value;
}

function composeEventHandlers(theirs, ours) {
  return event => {
    if (theirs) theirs(event);
    if (!event.defaultPrevented) ours(event);
  };
}

function renderSlot(asChild, children, props, ref) {
  if (!asChild) return React.createElement(props.as, { ...props, as: undefined, ref }, children);
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    ...props,
    as: undefined,
    className: [props.className, child.props.className].filter(Boolean).join(' '),
    onClick: composeEventHandlers(child.props.onClick, props.onClick || (() => {})),
    ref: mergeRefs(ref, child.ref),
  });
}

export function AlertDialog({ open, defaultOpen = false, onOpenChange, children }) {
  const controlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = controlled ? open : internalOpen;
  const triggerRef = React.useRef(null);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const setOpen = React.useCallback(next => {
    if (!controlled) setInternalOpen(next);
    if (onOpenChange) onOpenChange(next);
  }, [controlled, onOpenChange]);
  const value = React.useMemo(() => ({ open: isOpen, setOpen, triggerRef, titleId, descriptionId }), [isOpen, setOpen, titleId, descriptionId]);
  return <AlertDialogContext.Provider value={value}>{children}</AlertDialogContext.Provider>;
}

export const AlertDialogTrigger = React.forwardRef(function AlertDialogTrigger({ asChild = false, children, onClick, ...rest }, ref) {
  const ctx = useAlertDialog('AlertDialogTrigger');
  const props = {
    ...rest,
    as: 'button',
    type: asChild ? undefined : rest.type || 'button',
    'data-slot': 'alert-dialog-trigger',
    'aria-haspopup': 'alertdialog',
    'aria-expanded': ctx.open,
    onClick: composeEventHandlers(onClick, () => ctx.setOpen(true)),
  };
  return renderSlot(asChild, children, props, mergeRefs(ref, ctx.triggerRef));
});

export function AlertDialogPortal({ forceMount = false, container, children }) {
  const ctx = useAlertDialog('AlertDialogPortal');
  if (!ctx.open && !forceMount) return null;
  return <Portal container={container}>{children}</Portal>;
}

export const AlertDialogOverlay = React.forwardRef(function AlertDialogOverlay({ forceMount = false, className, ...rest }, ref) {
  injectEfCss('ef-css-alertdialog', CSS);
  const ctx = useAlertDialog('AlertDialogOverlay');
  if (!ctx.open && !forceMount) return null;
  return <div {...rest} ref={ref} className={`ef-alertdialog__overlay${className ? ' ' + className : ''}`} data-slot="alert-dialog-overlay" data-state={ctx.open ? 'open' : 'closed'} />;
});

export const AlertDialogContent = React.forwardRef(function AlertDialogContent({ size = 'default', forceMount = false, children, className, onKeyDown, ...rest }, ref) {
  injectEfCss('ef-css-alertdialog', CSS);
  const ctx = useAlertDialog('AlertDialogContent');
  const panelRef = React.useRef(null);
  React.useEffect(() => {
    if (!ctx.open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const panel = panelRef.current;
    const preferred = panel && (panel.querySelector('[data-slot="alert-dialog-cancel"]') || panel.querySelector(FOCUSABLE));
    (preferred || panel)?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      ctx.triggerRef.current?.focus?.();
    };
  }, [ctx.open, ctx.triggerRef]);
  if (!ctx.open && !forceMount) return null;
  const handleKeyDown = event => {
    if (onKeyDown) onKeyDown(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      ctx.setOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(panelRef.current?.querySelectorAll(FOCUSABLE) || []);
    if (!focusable.length) { event.preventDefault(); return; }
    const index = focusable.indexOf(document.activeElement);
    if (event.shiftKey && index <= 0) { event.preventDefault(); focusable[focusable.length - 1].focus(); }
    else if (!event.shiftKey && (index < 0 || index === focusable.length - 1)) { event.preventDefault(); focusable[0].focus(); }
  };
  return (
    <AlertDialogPortal forceMount={forceMount}>
      <AlertDialogOverlay forceMount={forceMount}>
        <div {...rest} ref={mergeRefs(ref, panelRef)} role="alertdialog" aria-modal="true" aria-labelledby={ctx.titleId} aria-describedby={ctx.descriptionId}
          tabIndex={-1} data-slot="alert-dialog-content" data-state={ctx.open ? 'open' : 'closed'} data-size={size}
          className={`ef-alertdialog__content ef-alertdialog__content--${size}${className ? ' ' + className : ''}`} onKeyDown={handleKeyDown}>
          {children}
        </div>
      </AlertDialogOverlay>
    </AlertDialogPortal>
  );
});

export const AlertDialogHeader = React.forwardRef(function AlertDialogHeader({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="alert-dialog-header" className={`ef-alertdialog__header${className ? ' ' + className : ''}`} />;
});

export const AlertDialogFooter = React.forwardRef(function AlertDialogFooter({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="alert-dialog-footer" className={`ef-alertdialog__footer${className ? ' ' + className : ''}`} />;
});

export const AlertDialogMedia = React.forwardRef(function AlertDialogMedia({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="alert-dialog-media" className={`ef-alertdialog__media${className ? ' ' + className : ''}`} />;
});

export const AlertDialogTitle = React.forwardRef(function AlertDialogTitle({ className, ...rest }, ref) {
  const ctx = useAlertDialog('AlertDialogTitle');
  return <h2 {...rest} ref={ref} id={rest.id || ctx.titleId} data-slot="alert-dialog-title" className={`ef-alertdialog__title${className ? ' ' + className : ''}`} />;
});

export const AlertDialogDescription = React.forwardRef(function AlertDialogDescription({ className, ...rest }, ref) {
  const ctx = useAlertDialog('AlertDialogDescription');
  return <p {...rest} ref={ref} id={rest.id || ctx.descriptionId} data-slot="alert-dialog-description" className={`ef-alertdialog__description${className ? ' ' + className : ''}`} />;
});

function createAction(name, slot, variant, closes) {
  return React.forwardRef(function AlertDialogButton({ asChild = false, children, className, onClick, variant: selectedVariant = variant, size = 'default', ...rest }, ref) {
    const ctx = useAlertDialog(name);
    const props = {
      ...rest,
      as: 'button',
      type: asChild ? undefined : rest.type || 'button',
      'data-slot': slot,
      className: asChild ? className : buttonVariants({ variant: selectedVariant, size, className }),
      onClick: composeEventHandlers(onClick, () => closes && ctx.setOpen(false)),
    };
    return renderSlot(asChild, children, props, ref);
  });
}

export const AlertDialogCancel = createAction('AlertDialogCancel', 'alert-dialog-cancel', 'outline', true);
export const AlertDialogAction = createAction('AlertDialogAction', 'alert-dialog-action', 'default', true);
