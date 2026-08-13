import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '../feedback/Dialog.jsx';

const CSS = `
.ef-drawer__overlay{padding:0}
.ef-drawer{position:fixed;z-index:var(--z-modal);display:flex;max-width:none;max-height:none;flex-direction:column;overflow:auto;border-radius:0;background:var(--surface-card);box-shadow:var(--shadow-xl);touch-action:none;will-change:transform}
.ef-drawer[data-vaul-drawer-direction=right]{top:0;right:0;bottom:0;width:min(75vw,384px);border-width:0 0 0 1px;animation:ef-drawer-right var(--dur-slow) var(--ease-out)}
.ef-drawer[data-vaul-drawer-direction=left]{top:0;left:0;bottom:0;width:min(75vw,384px);border-width:0 1px 0 0;animation:ef-drawer-left var(--dur-slow) var(--ease-out)}
.ef-drawer[data-vaul-drawer-direction=top]{top:0;left:0;right:0;width:100%;max-height:80vh;border-width:0 0 1px;border-radius:0 0 var(--radius-lg) var(--radius-lg);animation:ef-drawer-top var(--dur-slow) var(--ease-out)}
.ef-drawer[data-vaul-drawer-direction=bottom]{bottom:0;left:0;right:0;width:100%;max-height:80vh;border-width:1px 0 0;border-radius:var(--radius-lg) var(--radius-lg) 0 0;animation:ef-drawer-bottom var(--dur-slow) var(--ease-out)}
.ef-drawer__handle{display:none;width:100px;height:8px;flex:none;margin:16px auto 0;border-radius:var(--radius-full);background:var(--surface-sunken);cursor:grab;touch-action:none}
.ef-drawer[data-vaul-drawer-direction=bottom]>.ef-drawer__handle{display:block}
.ef-drawer__header{gap:6px;padding:20px 24px 12px;text-align:start}.ef-drawer__footer{margin-top:auto;padding:16px 24px}.ef-drawer__description{margin-top:2px}
@keyframes ef-drawer-right{from{transform:translateX(24px);opacity:0}}@keyframes ef-drawer-left{from{transform:translateX(-24px);opacity:0}}@keyframes ef-drawer-top{from{transform:translateY(-24px);opacity:0}}@keyframes ef-drawer-bottom{from{transform:translateY(24px);opacity:0}}
`;

const DrawerContext = React.createContext(null);
const join = (...values) => values.filter(Boolean).join(' ');
const compose = (first, second) => event => { first?.(event); if (!event.defaultPrevented) second?.(event); };

export function Drawer({ open: controlled, defaultOpen = false, onOpenChange, direction = 'bottom', dismissible = true, modal = true, handleOnly = false, children }) {
  injectEfCss('ef-css-drawer', CSS);
  const [internal, setInternal] = React.useState(defaultOpen);
  const open = controlled === undefined ? internal : controlled;
  const setOpen = React.useCallback(next => {
    if (controlled === undefined) setInternal(next);
    onOpenChange?.(next);
  }, [controlled, onOpenChange]);
  const context = React.useMemo(() => ({ direction, dismissible, handleOnly, open, setOpen }), [direction, dismissible, handleOnly, open, setOpen]);
  return <DrawerContext.Provider value={context}><Dialog open={open} onOpenChange={setOpen} modal={modal}>{children}</Dialog></DrawerContext.Provider>;
}

export const DrawerTrigger = React.forwardRef(function DrawerTrigger(props, ref) { return <DialogTrigger {...props} ref={ref} slot="drawer-trigger" />; });
export function DrawerPortal(props) { return <DialogPortal {...props} />; }
export const DrawerClose = React.forwardRef(function DrawerClose(props, ref) { return <DialogClose {...props} ref={ref} slot="drawer-close" />; });
export const DrawerOverlay = React.forwardRef(function DrawerOverlay({ className, onMouseDown, ...props }, ref) {
  const drawer = React.useContext(DrawerContext);
  const dismiss = event => { if (!drawer?.dismissible) event.preventDefault(); };
  return <DialogOverlay {...props} ref={ref} slot="drawer-overlay" className={join('ef-drawer__overlay', className)} onMouseDown={compose(onMouseDown, dismiss)} />;
});

export const DrawerContent = React.forwardRef(function DrawerContent({ className, style, children, onEscapeKeyDown, onPointerDown, onPointerMove, onPointerUp, overlayProps, ...props }, ref) {
  const drawer = React.useContext(DrawerContext);
  const gesture = React.useRef(null);
  const offsetRef = React.useRef(0);
  const [offset, setOffset] = React.useState(0);
  const direction = drawer?.direction || 'bottom';
  const axis = direction === 'left' || direction === 'right' ? 'clientX' : 'clientY';
  const sign = direction === 'top' || direction === 'left' ? -1 : 1;
  const start = event => {
    onPointerDown?.(event);
    if (event.defaultPrevented || !drawer?.dismissible || (drawer.handleOnly && event.target.dataset.slot !== 'drawer-handle') || event.target.closest('button,a,input,select,textarea')) return;
    gesture.current = { pointerId: event.pointerId, start: event[axis] };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const move = event => {
    onPointerMove?.(event);
    if (!gesture.current || gesture.current.pointerId !== event.pointerId) return;
    const next = Math.max(0, (event[axis] - gesture.current.start) * sign);
    offsetRef.current = next;
    setOffset(next);
  };
  const end = event => {
    onPointerUp?.(event);
    if (!gesture.current || gesture.current.pointerId !== event.pointerId) return;
    gesture.current = null;
    if (offsetRef.current > 80) drawer?.setOpen(false);
    offsetRef.current = 0;
    setOffset(0);
  };
  const transform = offset ? (axis === 'clientX' ? `translateX(${offset * sign}px)` : `translateY(${offset * sign}px)`) : undefined;
  const escape = event => { onEscapeKeyDown?.(event); if (!drawer?.dismissible) event.preventDefault(); };
  const dismissOverlay = event => { overlayProps?.onMouseDown?.(event); if (!drawer?.dismissible) event.preventDefault(); };
  return <DialogContent {...props} ref={ref} slot="drawer-content" data-vaul-drawer-direction={direction} className={join('ef-drawer', className)} width="none" showCloseButton={false} onEscapeKeyDown={escape} overlayProps={{ ...overlayProps, slot: 'drawer-overlay', className: join('ef-drawer__overlay', overlayProps?.className), onMouseDown: dismissOverlay }} style={{ ...style, position: 'fixed', transform: transform || style?.transform, transition: offset ? 'none' : style?.transition }} onPointerDown={start} onPointerMove={move} onPointerUp={end}>
    <div data-slot="drawer-handle" className="ef-drawer__handle" />{children}
  </DialogContent>;
});

export const DrawerHeader = React.forwardRef(function DrawerHeader({ className, ...props }, ref) { return <DialogHeader {...props} ref={ref} slot="drawer-header" className={join('ef-drawer__header', className)} />; });
export const DrawerFooter = React.forwardRef(function DrawerFooter({ className, ...props }, ref) { return <DialogFooter {...props} ref={ref} slot="drawer-footer" className={join('ef-drawer__footer', className)} />; });
export const DrawerTitle = React.forwardRef(function DrawerTitle(props, ref) { return <DialogTitle {...props} ref={ref} slot="drawer-title" />; });
export const DrawerDescription = React.forwardRef(function DrawerDescription({ className, ...props }, ref) { return <DialogDescription {...props} ref={ref} slot="drawer-description" className={join('ef-drawer__description', className)} />; });
