import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss, mergeRefs } from './Button.jsx';
import { Portal, useAnchoredStyle } from '../overlay/Portal.jsx';

const CSS = `
.ef-select-trigger{display:flex;width:100%;height:var(--control-h-md);align-items:center;justify-content:space-between;gap:8px;padding:0 11px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-sunken);color:var(--text-primary);font:inherit;font-size:var(--text-sm);text-align:start;cursor:pointer}
.ef-select-trigger:hover:not(:disabled){border-color:var(--sand-400)}
.ef-select-trigger:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-select-trigger:disabled{cursor:not-allowed;opacity:.5}
.ef-select-trigger[aria-invalid="true"]{border-color:var(--danger-600)}
.ef-select-value[data-placeholder]{color:var(--text-muted)}
.ef-select-content{position:fixed;z-index:var(--z-dropdown);min-width:var(--select-trigger-width);max-height:280px;overflow:auto;padding:4px;border:1px solid var(--border-strong);border-radius:var(--radius-md);background:var(--surface-card);box-shadow:var(--shadow-md);animation:ef-select-in var(--dur-fast) var(--ease-out)}
@keyframes ef-select-in{from{opacity:0;transform:translateY(-3px)}}
.ef-select-group{padding:2px 0}
.ef-select-label{padding:6px 9px;color:var(--text-muted);font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.ef-select-item{position:relative;display:flex;width:100%;min-height:32px;align-items:center;padding:6px 30px 6px 9px;border:0;border-radius:var(--radius-sm);background:none;color:var(--text-primary);font:inherit;font-size:var(--text-sm);text-align:start;cursor:pointer}
[dir="rtl"] .ef-select-item{padding:6px 9px 6px 30px}
.ef-select-item:hover,.ef-select-item:focus-visible,.ef-select-item[data-highlighted]{outline:none;background:var(--surface-sunken)}
.ef-select-item:disabled{cursor:not-allowed;opacity:.45}
.ef-select-check{position:absolute;inset-inline-end:9px;display:inline-flex}
.ef-select-separator{height:1px;margin:4px 6px;background:var(--border-default)}
`;
const SelectCtx = React.createContext(null);
const itemText = children => typeof children === 'string' || typeof children === 'number' ? String(children) : '';
function collectLabels(children, out = {}) {
  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    if (child.type === SelectItem) out[child.props.value] = itemText(child.props.children) || child.props.value;
    if (child.props.children) collectLabels(child.props.children, out);
  });
  return out;
}

export function Select({ value: controlled, defaultValue = '', onValueChange, onOpenChange, open: controlledOpen, defaultOpen = false, disabled = false, name, required, children }) {
  injectEfCss('ef-css-select', CSS);
  const [innerValue, setInnerValue] = React.useState(defaultValue);
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
  const value = controlled !== undefined ? controlled : innerValue;
  const open = controlledOpen !== undefined ? controlledOpen : innerOpen;
  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);
  const declaredLabels = React.useMemo(() => collectLabels(children), [children]);
  const [labels, setLabels] = React.useState(declaredLabels);
  const setOpen = React.useCallback(next => { if (controlledOpen === undefined) setInnerOpen(next); onOpenChange?.(next); }, [controlledOpen, onOpenChange]);
  const choose = React.useCallback((next, label) => { if (controlled === undefined) setInnerValue(next); onValueChange?.(next); setLabels(prev => prev[next] === label ? prev : { ...prev, [next]: label }); setOpen(false); triggerRef.current?.focus(); }, [controlled, onValueChange, setOpen]);
  const register = React.useCallback((next, label) => setLabels(prev => prev[next] === label ? prev : { ...prev, [next]: label }), []);
  const allLabels = { ...declaredLabels, ...labels };
  const ctx = React.useMemo(() => ({ value, open, disabled, labels: allLabels, setOpen, choose, register, triggerRef, contentRef }), [value, open, disabled, allLabels, setOpen, choose, register]);
  React.useEffect(() => {
    if (!open) return;
    const away = event => { if (!triggerRef.current?.contains(event.target) && !contentRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open, setOpen]);
  return <SelectCtx.Provider value={ctx}>{name ? <input type="hidden" name={name} value={value} required={required} /> : null}{children}</SelectCtx.Provider>;
}

export const SelectTrigger = React.forwardRef(function SelectTrigger({ children, className, onClick, onKeyDown, ...props }, ref) {
  const ctx = React.useContext(SelectCtx);
  const key = event => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); ctx?.setOpen(true); }
  };
  return <button {...props} ref={mergeRefs(ref, ctx?.triggerRef)} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={!!ctx?.open} disabled={ctx?.disabled || props.disabled} data-slot="select-trigger" className={`ef-select-trigger${className ? ` ${className}` : ''}`} onClick={event => { onClick?.(event); if (!event.defaultPrevented) ctx?.setOpen(!ctx.open); }} onKeyDown={key}>{children}<Icon name="chevron-down" size={16} /></button>;
});

export function SelectValue({ placeholder, children, className }) {
  const ctx = React.useContext(SelectCtx);
  const shown = children ?? ctx?.labels[ctx?.value];
  return <span data-slot="select-value" data-placeholder={shown ? undefined : ''} className={`ef-select-value${className ? ` ${className}` : ''}`}>{shown || placeholder}</span>;
}

export const SelectContent = React.forwardRef(function SelectContent({ children, className, position, align = 'start', sideOffset = 5, onKeyDown, style, ...props }, ref) {
  const ctx = React.useContext(SelectCtx);
  const { style: anchored } = useAnchoredStyle(ctx?.triggerRef, ctx?.contentRef, { open: !!ctx?.open, placement: 'bottom', align, offset: sideOffset });
  React.useEffect(() => {
    if (!ctx?.open) return;
    requestAnimationFrame(() => {
      const selected = ctx.contentRef.current?.querySelector('[aria-selected="true"]');
      const first = ctx.contentRef.current?.querySelector('[role="option"]:not(:disabled)');
      (selected || first)?.focus();
    });
  }, [ctx?.open]);
  if (!ctx?.open) return null;
  const key = event => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const items = [...event.currentTarget.querySelectorAll('[role="option"]:not(:disabled)')];
    const index = items.indexOf(document.activeElement);
    if (event.key === 'Escape') { event.preventDefault(); ctx.setOpen(false); ctx.triggerRef.current?.focus(); }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus(); }
    else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); items[event.key === 'Home' ? 0 : items.length - 1]?.focus(); }
    else if (event.key === 'Tab') ctx.setOpen(false);
    else if (event.key.length === 1 && /\S/.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const query = event.key.toLocaleLowerCase();
      const match = items.slice(index + 1).concat(items.slice(0, index + 1)).find(item => (item.textContent || '').trim().toLocaleLowerCase().startsWith(query));
      if (match) { event.preventDefault(); match.focus(); }
    }
  };
  return <Portal><div {...props} ref={mergeRefs(ref, ctx.contentRef)} role="listbox" data-slot="select-content" data-position={position} className={`ef-select-content${className ? ` ${className}` : ''}`} style={{ ...anchored, '--select-trigger-width': `${ctx.triggerRef.current?.offsetWidth || 160}px`, ...style }} onKeyDown={key}>{children}</div></Portal>;
});

export const SelectGroup = React.forwardRef(function SelectGroup({ className, ...props }, ref) { return <div {...props} ref={ref} role="group" data-slot="select-group" className={`ef-select-group${className ? ` ${className}` : ''}`} />; });
export const SelectLabel = React.forwardRef(function SelectLabel({ className, ...props }, ref) { return <div {...props} ref={ref} data-slot="select-label" className={`ef-select-label${className ? ` ${className}` : ''}`} />; });
export const SelectSeparator = React.forwardRef(function SelectSeparator({ className, ...props }, ref) { return <div {...props} ref={ref} role="separator" data-slot="select-separator" className={`ef-select-separator${className ? ` ${className}` : ''}`} />; });

export const SelectItem = React.forwardRef(function SelectItem({ value, disabled = false, children, className, onClick, ...props }, ref) {
  const ctx = React.useContext(SelectCtx);
  const label = itemText(children) || value;
  React.useEffect(() => { ctx?.register(value, label); }, [ctx?.register, value, label]);
  const selected = ctx?.value === value;
  return <button {...props} ref={ref} type="button" role="option" aria-selected={selected} disabled={disabled} data-slot="select-item" className={`ef-select-item${className ? ` ${className}` : ''}`} onClick={event => { onClick?.(event); if (!event.defaultPrevented) ctx?.choose(value, label); }}>{children}{selected ? <span className="ef-select-check"><Icon name="check" size={15} /></span> : null}</button>;
});
