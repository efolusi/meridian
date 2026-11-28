'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss, styleRef, useIsoLayoutEffect, usePresence } from '../runtime/runtime.jsx';
import { Portal, useHydrated } from '../overlay/Portal.jsx';

const CSS = `
.ef-toast__body{flex:1}
.ef-toast{display:flex;align-items:flex-start;gap:var(--space-3);width:360px;max-width:100%;padding:var(--space-3) var(--space-4);background:var(--surface-inverse);color:var(--text-inverse);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);animation:ef-toast-in var(--dur-slow) var(--ease-enter)}
.ef-toast__icon{display:inline-flex;margin-top:1px}.ef-toast--success .ef-toast__icon{color:var(--success-on-dark)}.ef-toast--danger .ef-toast__icon{color:var(--danger-on-dark)}.ef-toast--warning .ef-toast__icon{color:var(--warning-on-dark)}.ef-toast--info .ef-toast__icon{color:var(--peach-200)}
.ef-toast__title{font-size:var(--text-md);font-weight:var(--weight-semibold);line-height:1.35}.ef-toast__desc{margin-top:var(--space-0-5);color:var(--text-inverse);font-size:var(--text-sm);line-height:1.4;opacity:.75}.ef-toast__action{margin-top:var(--space-2);padding:0;border:0;background:none;color:var(--peach-200);font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--weight-semibold);cursor:pointer}@media (hover:hover){.ef-toast__action:hover{color:var(--cream-50);text-decoration:none}}.ef-toast .ef-iconbtn{color:var(--text-inverse-muted)}@media (hover:hover){.ef-toast .ef-iconbtn:hover:not(:disabled){background:color-mix(in srgb,var(--text-inverse) 12%,transparent);color:var(--text-inverse)}}
.ef-toast-stack{position:fixed;z-index:var(--z-toast);display:flex;width:360px;max-width:calc(100vw - 32px);flex-direction:column;gap:var(--space-3);pointer-events:none}.ef-toast-stack>*{pointer-events:auto}.ef-toast-stack[data-position^=top]{top:24px}.ef-toast-stack[data-position^=bottom]{bottom:24px}.ef-toast-stack[data-position$=left]{inset-inline-start:24px}.ef-toast-stack[data-position$=right]{inset-inline-end:24px}.ef-toast-stack[data-position$=center]{inset-inline-start:50%;transform:translateX(-50%)}
[data-theme="dark"] .ef-toast--success .ef-toast__icon{color:color-mix(in srgb,var(--success-600) 60%,var(--text-inverse))}[data-theme="dark"] .ef-toast--danger .ef-toast__icon{color:color-mix(in srgb,var(--status-danger-solid) 60%,var(--text-inverse))}[data-theme="dark"] .ef-toast--warning .ef-toast__icon{color:color-mix(in srgb,var(--warning-600) 60%,var(--text-inverse))}[data-theme="dark"] .ef-toast--info .ef-toast__icon{color:var(--brand-600)}[data-theme="dark"] .ef-toast__action{color:var(--brand-700)}
@media (prefers-color-scheme:dark){:root:not(:where([data-theme="light"])) .ef-toast--success .ef-toast__icon{color:color-mix(in srgb,var(--success-600) 60%,var(--text-inverse))}:root:not(:where([data-theme="light"])) .ef-toast--danger .ef-toast__icon{color:color-mix(in srgb,var(--status-danger-solid) 60%,var(--text-inverse))}:root:not(:where([data-theme="light"])) .ef-toast--warning .ef-toast__icon{color:color-mix(in srgb,var(--warning-600) 60%,var(--text-inverse))}:root:not(:where([data-theme="light"])) .ef-toast--info .ef-toast__icon{color:var(--brand-600)}:root:not(:where([data-theme="light"])) .ef-toast__action{color:var(--brand-700)}}
@media(max-width:599px){.ef-toast-stack{inset-inline:16px!important;width:auto;max-width:none;transform:none!important}.ef-toast-stack[data-position^=top]{top:16px}.ef-toast-stack[data-position^=bottom]{bottom:16px}}
.ef-toast__action:focus-visible{outline:none;border-radius:var(--radius-sm);box-shadow:var(--focus-ring)}
@keyframes ef-toast-in{from{opacity:0;transform:translateY(12px) scale(var(--motion-enter-scale-sm))}}
@keyframes ef-toast-out{to{opacity:0;transform:translateY(12px) scale(var(--motion-enter-scale-sm))}}
.ef-toast[data-state="closed"]{animation:ef-reduce-fade-out var(--dur-fast) var(--ease-exit) forwards;pointer-events:none}
@media (prefers-reduced-motion:no-preference){.ef-toast[data-state="closed"]{animation:ef-toast-out var(--dur-base) var(--ease-exit) forwards}}
/* coarse pointers get the 44px touch target, like form controls do through --control-h-* */
@media (pointer:coarse){.ef-toast__action{min-height:var(--tap-min)}}
@media (prefers-reduced-motion:reduce){.ef-toast{--ef-motion-guard:var(--dur-fast);animation-name:ef-reduce-fade}}
`;
const ICONS = { success: 'circle-check', danger: 'circle-alert', warning: 'triangle-alert', info: 'info' };

// `leaving` is a toast that was dismissed or timed out: it stays, closed, until its exit has played, then calls onGone.
function ToastItem({ tone = 'info', title, description, actionProps, onClose, role = 'status', style, className, leaving = false, onGone, ...rest }) {
  injectEfCss('ef-css-toast', CSS);
  const ref = React.useRef(null);
  const { present, state } = usePresence(!leaving, ref);
  React.useEffect(() => { if (!present) onGone?.(); }, [present, onGone]);
  if (!present) return null;
  const actionNode = actionProps ? <button type="button" {...actionProps} className={`ef-toast__action${actionProps.className ? ` ${actionProps.className}` : ''}`} /> : null;
  return <div {...rest} ref={ref} data-slot="toast" data-state={state} className={`ef-toast ef-toast--${tone}${className ? ` ${className}` : ''}`} role={role || undefined} style={style}>
    <span className="ef-toast__icon" aria-hidden="true"><Icon name={ICONS[tone] || 'info'} size={20} /></span>
    <div className="ef-toast__body"><div className="ef-toast__title">{title}</div>{description ? <div className="ef-toast__desc">{description}</div> : null}{actionNode}</div>
    {onClose ? <IconButton icon="x" label="Dismiss" size="sm" onClick={onClose} /> : null}
  </div>;
}

function ToastStack({ children, position = 'bottom-right', gap, offset, style, className, ...rest }) {
  injectEfCss('ef-css-toast', CSS);
  return <div {...rest} data-slot="toaster" data-position={position} className={`ef-toast-stack${className ? ` ${className}` : ''}`} ref={styleRef({ gap, top: position.startsWith('top') ? offset : undefined, bottom: position.startsWith('top') ? undefined : offset })} style={style}>{children}</div>;
}

let records = [];
let sequence = 0;
let defaultDuration;
// How long a self-dismissing notice stays: the --hold-notice token (design-tokens docs/motion.md), read
// where the toast is added. The number is only for a page that has not loaded the tokens.
const NOTICE_HOLD_FALLBACK = 8000;
function holdNotice() {
  if (typeof document === 'undefined') return NOTICE_HOLD_FALLBACK;
  const token = getComputedStyle(document.documentElement).getPropertyValue('--hold-notice').trim().match(/^([\d.]+)(ms|s)$/);
  return token ? Number(token[1]) * (token[2] === 's' ? 1000 : 1) : NOTICE_HOLD_FALLBACK;
}
let defaultToastOptions = {};
const listeners = new Set();
const timers = new Map();
const emit = () => listeners.forEach(listener => listener(records));
const resolve = (value, payload) => typeof value === 'function' ? value(payload) : value;

function close(id) {
  if (id == null) { timers.forEach(timer => clearTimeout(timer.handle)); timers.clear(); records = []; }
  else { const timer = timers.get(id); if (timer?.handle) clearTimeout(timer.handle); timers.delete(id); records = records.filter(item => item.id !== id); }
  emit();
}
// Why the timers are held: the pointer is over the stack, focus is inside it, or the window is hidden
// (WCAG 2.2.1). A toast added while a hold is on starts paused.
const holds = new Set();
function schedule(id, duration) {
  if (!(duration > 0)) return;
  const timer = { remaining: duration, startedAt: Date.now(), handle: null };
  if (holds.size === 0) timer.handle = setTimeout(() => close(id), duration);
  timers.set(id, timer);
}
function add(options = {}) {
  const merged = { ...defaultToastOptions, ...options };
  const id = merged.id ?? `toast-${++sequence}`;
  const next = { ...merged, id, type: merged.type || 'default' };
  const previous = timers.get(id); if (previous?.handle) clearTimeout(previous.handle); timers.delete(id);
  // What the user must act on, or is still waiting for, never dismisses itself, whatever duration was asked for.
  const mustAct = next.type === 'loading' || next.type === 'danger' || Boolean(next.actionProps);
  const duration = mustAct ? 0 : merged.duration ?? defaultDuration ?? holdNotice();
  // a toast that never expires must be dismissable, or it stays on screen for good
  next.sticky = !(duration > 0) && next.type !== 'loading';
  records = records.some(item => item.id === id) ? records.map(item => item.id === id ? next : item) : [...records, next];
  schedule(id, duration); emit(); return id;
}

export const toast = { add, close };
toast.promise = (promise, data = {}) => {
  const loading = resolve(data.loading);
  const id = add(typeof loading === 'object' && loading !== null ? { ...loading, type: 'loading', duration: 0 } : { title: loading, type: 'loading', duration: 0 });
  Promise.resolve(typeof promise === 'function' ? promise() : promise).then(
    value => { const result = resolve(data.success, value); add(typeof result === 'object' && result !== null ? { ...result, id, type: result.type || 'success' } : { id, title: result, type: 'success', duration: data.duration }); },
    error => { const result = resolve(data.error, error); add(typeof result === 'object' && result !== null ? { ...result, id, type: result.type || 'danger' } : { id, title: result, description: error?.message, type: 'danger', duration: data.duration }); },
  );
  return id;
};

function pause() { timers.forEach(timer => { if (!timer.handle) return; clearTimeout(timer.handle); timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt)); timer.handle = null; }); }
function hold(reason) { const idle = holds.size === 0; holds.add(reason); if (idle) pause(); }
function release(reason) { if (holds.delete(reason) && holds.size === 0) resume(); }
function resume() { const expired = []; timers.forEach((timer, id) => { if (timer.handle) return; if (timer.remaining <= 0) { expired.push(id); return; } timer.startedAt = Date.now(); timer.handle = setTimeout(() => close(id), timer.remaining); }); expired.forEach(close); }

export function Toaster({ position = 'bottom-right', visibleToasts = 3, closeButton = true, richColors = false, duration, toastOptions = {}, expand = false, theme = 'system', dir, gap = 10, offset, mobileOffset, label = 'Notifications', children, style, ...rest }) {
  injectEfCss('ef-css-toast', CSS);
  const [items, setItems] = React.useState(records);
  // What is on screen: the toasts that are live, plus the ones that were just removed, each still in its old place until its exit ends.
  const [rendered, setRendered] = React.useState(() => records.slice(-visibleToasts).map(item => ({ item, leaving: false })));
  useIsoLayoutEffect(() => {
    const shown = items.slice(-visibleToasts);
    setRendered(previous => {
      const now = new Map(shown.map(item => [item.id, item]));
      const next = previous.map(entry => now.has(entry.item.id) ? { item: now.get(entry.item.id), leaving: false } : { item: entry.item, leaving: true });
      const kept = new Set(previous.map(entry => entry.item.id));
      for (const item of shown) if (!kept.has(item.id)) next.push({ item, leaving: false });
      return next;
    });
  }, [items, visibleToasts]);
  const gone = React.useCallback(id => setRendered(previous => previous.filter(entry => !(entry.leaving && entry.item.id === id))), []);
  React.useEffect(() => { const listener = value => setItems(value); listeners.add(listener); listener(records); return () => listeners.delete(listener); }, []);
  React.useEffect(() => { defaultDuration = duration; defaultToastOptions = toastOptions; return () => { defaultDuration = undefined; defaultToastOptions = {}; }; }, [duration, toastOptions]);
  // A hidden window holds the timers too, so a notice is not gone before anyone could read it.
  React.useEffect(() => {
    const sync = () => (document.visibilityState === 'hidden' ? hold('hidden') : release('hidden'));
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => { document.removeEventListener('visibilitychange', sync); ['hidden', 'pointer', 'focus'].forEach(release); };
  }, []);
  const resolvedOffset = typeof offset === 'number' ? `${offset}px` : offset;
  // Mounted on every page load, so wait for hydration: see useHydrated.
  const hydrated = useHydrated();
  if (!hydrated) return <>{children}</>;
  return <>{children}<Portal><ToastStack {...rest} dir={dir} position={position} data-rich-colors={richColors ? 'true' : 'false'} data-expand={expand ? 'true' : 'false'} data-theme={theme} data-mobile-offset={typeof mobileOffset === 'number' ? `${mobileOffset}px` : mobileOffset} gap={gap} offset={resolvedOffset} style={style} aria-label={label} role="log" aria-live="polite" aria-relevant="additions" onMouseEnter={() => hold('pointer')} onMouseLeave={() => release('pointer')} onFocusCapture={() => hold('focus')} onBlurCapture={() => release('focus')}>
    {rendered.map(({ item, leaving }) => item.type === 'custom' && React.isValidElement(item.title)
      ? (leaving ? null : React.cloneElement(item.title, { key: item.id }))
      : <ToastItem key={item.id} leaving={leaving} onGone={() => gone(item.id)} tone={['success', 'warning', 'danger', 'info'].includes(item.type) ? item.type : 'info'} title={item.title} description={item.description} actionProps={item.actionProps} role={null} onClose={item.closeButton ?? (closeButton || item.sticky) ? () => close(item.id) : undefined} />)}
  </ToastStack></Portal></>;
}
