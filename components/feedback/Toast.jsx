import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../forms/Button.jsx';
import { Portal } from '../overlay/Portal.jsx';
const CSS = `
.ef-toast{display:flex;align-items:flex-start;gap:10px;width:360px;max-width:100%;padding:12px 14px;background:var(--surface-inverse);color:var(--text-inverse);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);animation:ef-toast-in var(--dur-slow) var(--ease-spring)}
.ef-toast__icon{display:inline-flex;margin-top:1px}
.ef-toast--success .ef-toast__icon{color:var(--success-on-dark)}
.ef-toast--danger .ef-toast__icon{color:var(--danger-on-dark)}
.ef-toast--warning .ef-toast__icon{color:var(--warning-on-dark)}
.ef-toast--info .ef-toast__icon{color:var(--peach-200)}
.ef-toast__title{font-size:var(--text-md);font-weight:var(--weight-semibold);line-height:1.35}
.ef-toast__desc{font-size:var(--text-sm);color:var(--text-inverse);opacity:.75;margin-top:2px;line-height:1.4}
.ef-toast__action{margin-top:8px;background:none;border:none;padding:0;color:var(--peach-200);font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--weight-semibold);cursor:pointer}
.ef-toast__action:hover{color:var(--cream-50);text-decoration:underline}
.ef-toast .ef-iconbtn{color:var(--text-inverse-muted)}
.ef-toast .ef-iconbtn:hover:not(:disabled){background:color-mix(in srgb,var(--text-inverse) 12%,transparent);color:var(--text-inverse)}
.ef-toast-stack{position:fixed;bottom:24px;right:24px;display:flex;flex-direction:column;gap:10px;z-index:var(--z-toast)}
[data-theme="dark"] .ef-toast--success .ef-toast__icon{color:var(--success-600)}
[data-theme="dark"] .ef-toast--danger .ef-toast__icon{color:var(--danger-600)}
[data-theme="dark"] .ef-toast--warning .ef-toast__icon{color:var(--warning-600)}
[data-theme="dark"] .ef-toast--info .ef-toast__icon{color:var(--brand-600)}
[data-theme="dark"] .ef-toast__action{color:var(--brand-700)}
[data-theme="dark"] .ef-toast .ef-iconbtn{color:var(--text-inverse-muted)}
@keyframes ef-toast-in{from{opacity:0;transform:translateY(12px) scale(.96)}}
`;
const ICONS = { success: 'circle-check', danger: 'circle-alert', warning: 'triangle-alert', info: 'info' };
export function Toast({ tone = 'info', title, description, actionLabel, onAction, onClose, role = 'status', style, className, ...rest }) {
  injectEfCss('ef-css-toast', CSS);
  return (
    <div {...rest} className={`ef-toast ef-toast--${tone}${className ? ' ' + className : ''}`} role={role || undefined} style={style}>
      <span className="ef-toast__icon"><Icon name={ICONS[tone] || 'info'} size={18} /></span>
      <div style={{ flex: 1 }}>
        <div className="ef-toast__title">{title}</div>
        {description ? <div className="ef-toast__desc">{description}</div> : null}
        {actionLabel ? <button className="ef-toast__action" onClick={onAction}>{actionLabel}</button> : null}
      </div>
      {onClose ? <IconButton icon="x" label="Dismiss" size="sm" onClick={onClose} /> : null}
    </div>
  );
}
export function ToastStack({ children, style, className, ...rest }) {
  injectEfCss('ef-css-toast', CSS);
  return <div {...rest} className={`ef-toast-stack${className ? ' ' + className : ''}`} style={style}>{children}</div>;
}

const ToastCtx = React.createContext(null);

/**
 * The toast queue API: notify, dismiss, dismissAll.
 *
 * Lowercase, so the compiler files it under unexposedExports and it never
 * reaches the global namespace directly. Consumers get it as `Toaster.useToast`
 * (assigned at the bottom of this file), which is the one sanctioned way to
 * publish a hook when only capitalised exports are exposed.
 *
 * Throws outside a <Toaster> rather than degrading to a no-op: a notification
 * that silently never appears is the harder bug to find.
 */
export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be called inside a <Toaster>');
  return ctx;
}

/**
 * Owns the toast queue: ids, timers, the live region, and the portal.
 *
 * Renders a Fragment around your app plus one portaled stack, so it can sit at
 * the root without introducing a wrapper element.
 */
export function Toaster({ duration = 5000, label = 'Notifications', children, ...rest }) {
  injectEfCss('ef-css-toast', CSS);
  const uid = React.useId();
  const seq = React.useRef(0);
  const [toasts, setToasts] = React.useState([]);
  const timers = React.useRef(new Map());

  const dismiss = React.useCallback(id => {
    const rec = timers.current.get(id);
    if (rec && rec.handle) clearTimeout(rec.handle);
    timers.current.delete(id);
    setToasts(list => list.filter(x => x.id !== id));
  }, []);

  const arm = React.useCallback((id, ms) => {
    const rec = { remaining: ms, startedAt: Date.now(), handle: null };
    rec.handle = setTimeout(() => dismiss(id), ms);
    timers.current.set(id, rec);
  }, [dismiss]);

  const notify = React.useCallback(options => {
    const id = uid + (seq.current++);
    const { duration: own, ...props } = options || {};
    // A toast carrying an action must not time out: WCAG 2.2.1 does not allow a
    // control to disappear on a timer the user cannot adjust.
    const ms = own != null ? own : (props.actionLabel ? 0 : duration);
    setToasts(list => [...list, { id, props }]);
    if (ms > 0) arm(id, ms);
    return id;
  }, [uid, duration, arm]);

  const dismissAll = React.useCallback(() => {
    timers.current.forEach(rec => { if (rec.handle) clearTimeout(rec.handle); });
    timers.current.clear();
    setToasts([]);
  }, []);

  React.useEffect(() => () => {
    timers.current.forEach(rec => { if (rec.handle) clearTimeout(rec.handle); });
    timers.current.clear();
  }, []);

  // Hovering or focusing the stack holds every pending timer, so a slow reader
  // or a keyboard user can actually reach the action inside a toast.
  const pause = () => {
    timers.current.forEach(rec => {
      if (!rec.handle) return;
      clearTimeout(rec.handle);
      rec.remaining = Math.max(0, rec.remaining - (Date.now() - rec.startedAt));
      rec.handle = null;
    });
  };
  const resume = () => {
    // A toast whose time ran out while paused must go on unpause, not become
    // permanent. Collect them first: dismiss() mutates the map being iterated.
    const expired = [];
    timers.current.forEach((rec, id) => {
      if (rec.handle) return;
      if (rec.remaining <= 0) { expired.push(id); return; }
      rec.startedAt = Date.now();
      rec.handle = setTimeout(() => dismiss(id), rec.remaining);
    });
    expired.forEach(dismiss);
  };

  const api = React.useMemo(() => ({ notify, dismiss, dismissAll }), [notify, dismiss, dismissAll]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <Portal>
        <ToastStack {...rest} aria-label={label} role="log" aria-live="polite" aria-relevant="additions"
          onMouseEnter={pause} onMouseLeave={resume} onFocusCapture={pause} onBlurCapture={resume}>
          {toasts.map(t => (
            <Toast key={t.id} {...t.props} role={null} onClose={() => dismiss(t.id)} />
          ))}
        </ToastStack>
      </Portal>
    </ToastCtx.Provider>
  );
}

Toaster.useToast = useToast;
