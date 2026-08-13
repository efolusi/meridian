import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../forms/Button.jsx';
import { Portal } from '../overlay/Portal.jsx';

const CSS = `
.ef-toast{display:flex;align-items:flex-start;gap:10px;width:360px;max-width:100%;padding:12px 14px;background:var(--surface-inverse);color:var(--text-inverse);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);animation:ef-toast-in var(--dur-slow) var(--ease-spring)}
.ef-toast__icon{display:inline-flex;margin-top:1px}.ef-toast--success .ef-toast__icon{color:var(--success-on-dark)}.ef-toast--danger .ef-toast__icon{color:var(--danger-on-dark)}.ef-toast--warning .ef-toast__icon{color:var(--warning-on-dark)}.ef-toast--info .ef-toast__icon{color:var(--peach-200)}
.ef-toast__title{font-size:var(--text-md);font-weight:var(--weight-semibold);line-height:1.35}.ef-toast__desc{margin-top:2px;color:var(--text-inverse);font-size:var(--text-sm);line-height:1.4;opacity:.75}.ef-toast__action{margin-top:8px;padding:0;border:0;background:none;color:var(--peach-200);font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--weight-semibold);cursor:pointer}.ef-toast__action:hover{color:var(--cream-50);text-decoration:none}.ef-toast .ef-iconbtn{color:var(--text-inverse-muted)}.ef-toast .ef-iconbtn:hover:not(:disabled){background:color-mix(in srgb,var(--text-inverse) 12%,transparent);color:var(--text-inverse)}
.ef-toast-stack{position:fixed;z-index:var(--z-toast);display:flex;width:360px;max-width:calc(100vw - 32px);flex-direction:column;gap:10px;pointer-events:none}.ef-toast-stack>*{pointer-events:auto}.ef-toast-stack[data-position^=top]{top:24px}.ef-toast-stack[data-position^=bottom]{bottom:24px}.ef-toast-stack[data-position$=left]{inset-inline-start:24px}.ef-toast-stack[data-position$=right]{inset-inline-end:24px}.ef-toast-stack[data-position$=center]{inset-inline-start:50%;transform:translateX(-50%)}
[data-theme="dark"] .ef-toast--success .ef-toast__icon{color:var(--success-600)}[data-theme="dark"] .ef-toast--danger .ef-toast__icon{color:var(--danger-600)}[data-theme="dark"] .ef-toast--warning .ef-toast__icon{color:var(--warning-600)}[data-theme="dark"] .ef-toast--info .ef-toast__icon{color:var(--brand-600)}[data-theme="dark"] .ef-toast__action{color:var(--brand-700)}
@media(max-width:599px){.ef-toast-stack{inset-inline:16px!important;width:auto;max-width:none;transform:none!important}.ef-toast-stack[data-position^=top]{top:16px}.ef-toast-stack[data-position^=bottom]{bottom:16px}}
@keyframes ef-toast-in{from{opacity:0;transform:translateY(12px) scale(.96)}}
`;
const ICONS = { success: 'circle-check', danger: 'circle-alert', warning: 'triangle-alert', info: 'info' };

function ToastItem({ tone = 'info', title, description, actionProps, onClose, role = 'status', style, className, ...rest }) {
  injectEfCss('ef-css-toast', CSS);
  const actionNode = actionProps ? <button type="button" {...actionProps} className={`ef-toast__action${actionProps.className ? ` ${actionProps.className}` : ''}`} /> : null;
  return <div {...rest} data-slot="toast" className={`ef-toast ef-toast--${tone}${className ? ` ${className}` : ''}`} role={role || undefined} style={style}>
    <span className="ef-toast__icon" aria-hidden="true"><Icon name={ICONS[tone] || 'info'} size={18} /></span>
    <div style={{ flex: 1 }}><div className="ef-toast__title">{title}</div>{description ? <div className="ef-toast__desc">{description}</div> : null}{actionNode}</div>
    {onClose ? <IconButton icon="x" label="Dismiss" size="sm" onClick={onClose} /> : null}
  </div>;
}

function ToastStack({ children, position = 'bottom-right', style, className, ...rest }) {
  injectEfCss('ef-css-toast', CSS);
  return <div {...rest} data-slot="toaster" data-position={position} className={`ef-toast-stack${className ? ` ${className}` : ''}`} style={style}>{children}</div>;
}

let records = [];
let sequence = 0;
let defaultDuration = 5000;
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
function schedule(id, duration) {
  if (!(duration > 0)) return;
  const timer = { remaining: duration, startedAt: Date.now(), handle: null };
  timer.handle = setTimeout(() => close(id), duration); timers.set(id, timer);
}
function add(options = {}) {
  const merged = { ...defaultToastOptions, ...options };
  const id = merged.id ?? `toast-${++sequence}`;
  const next = { ...merged, id, type: merged.type || 'default' };
  const previous = timers.get(id); if (previous?.handle) clearTimeout(previous.handle); timers.delete(id);
  records = records.some(item => item.id === id) ? records.map(item => item.id === id ? next : item) : [...records, next];
  schedule(id, merged.duration ?? (next.type === 'loading' || next.actionProps ? 0 : defaultDuration)); emit(); return id;
}

export const toast = { add, close };
toast.promise = (promise, data = {}) => {
  const loading = resolve(data.loading);
  const id = add(typeof loading === 'object' && loading !== null ? { ...loading, type: 'loading', duration: 0 } : { title: loading, type: 'loading', duration: 0 });
  Promise.resolve(typeof promise === 'function' ? promise() : promise).then(
    value => { const result = resolve(data.success, value); add(typeof result === 'object' && result !== null ? { ...result, id, type: result.type || 'success' } : { id, title: result, type: 'success', duration: data.duration }); },
    error => { const result = resolve(data.error, error); add(typeof result === 'object' && result !== null ? { ...result, id, type: result.type || 'error' } : { id, title: result, description: error?.message, type: 'error', duration: data.duration }); },
  );
  return id;
};

function pause() { timers.forEach(timer => { if (!timer.handle) return; clearTimeout(timer.handle); timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt)); timer.handle = null; }); }
function resume() { const expired = []; timers.forEach((timer, id) => { if (timer.handle) return; if (timer.remaining <= 0) { expired.push(id); return; } timer.startedAt = Date.now(); timer.handle = setTimeout(() => close(id), timer.remaining); }); expired.forEach(close); }

export function Toaster({ position = 'bottom-right', visibleToasts = 3, closeButton = false, richColors = false, duration = 5000, toastOptions = {}, expand = false, theme = 'system', dir, gap = 10, offset, mobileOffset, label = 'Notifications', children, style, ...rest }) {
  injectEfCss('ef-css-toast', CSS);
  const [items, setItems] = React.useState(records);
  React.useEffect(() => { const listener = value => setItems(value); listeners.add(listener); listener(records); return () => listeners.delete(listener); }, []);
  React.useEffect(() => { defaultDuration = duration; defaultToastOptions = toastOptions; return () => { defaultDuration = 5000; defaultToastOptions = {}; }; }, [duration, toastOptions]);
  const resolvedOffset = typeof offset === 'number' ? `${offset}px` : offset;
  return <>{children}<Portal><ToastStack {...rest} dir={dir} position={position} data-rich-colors={richColors ? 'true' : 'false'} data-expand={expand ? 'true' : 'false'} data-theme={theme} data-mobile-offset={typeof mobileOffset === 'number' ? `${mobileOffset}px` : mobileOffset} style={{ gap, ...(position.startsWith('top') ? { top: resolvedOffset } : { bottom: resolvedOffset }), ...style }} aria-label={label} role="log" aria-live="polite" aria-relevant="additions" onMouseEnter={pause} onMouseLeave={resume} onFocusCapture={pause} onBlurCapture={resume}>
    {items.slice(-visibleToasts).map(item => item.type === 'custom' && React.isValidElement(item.title)
      ? React.cloneElement(item.title, { key: item.id })
      : <ToastItem key={item.id} tone={item.type === 'error' ? 'danger' : ['success', 'warning', 'info'].includes(item.type) ? item.type : 'info'} title={item.title} description={item.description} actionProps={item.actionProps} role={null} onClose={closeButton || item.closeButton ? () => close(item.id) : undefined} />)}
  </ToastStack></Portal></>;
}
