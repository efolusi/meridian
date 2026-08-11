import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from './Button.jsx';
import { InputGroup, InputGroupAddon, InputGroupInput } from './InputGroup.jsx';
import { Portal, useAnchoredStyle } from '../overlay/Portal.jsx';

const CSS = `
.ef-combobox{position:relative;width:100%}.ef-combobox__input-group{width:100%}.ef-combobox__input{min-width:0}.ef-combobox__actions{gap:2px;padding-inline:4px;border:0}.ef-combobox__button{display:inline-flex;width:26px;height:26px;align-items:center;justify-content:center;border:0;border-radius:var(--radius-sm);background:transparent;color:var(--text-muted);cursor:pointer}.ef-combobox__button:hover{background:var(--surface-sunken);color:var(--text-primary)}.ef-combobox__button:focus-visible{outline:none;box-shadow:var(--focus-ring)}.ef-combobox__button:disabled{cursor:not-allowed;opacity:.45}
.ef-combobox__content{position:fixed;z-index:var(--z-popover);max-height:min(384px,var(--ef-available-height,384px));overflow:hidden;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);color:var(--text-primary);box-shadow:var(--shadow-md);animation:ef-combobox-in var(--dur-fast) var(--ease-out)}@keyframes ef-combobox-in{from{opacity:0;transform:translateY(-3px)}}
.ef-combobox__list{max-height:min(340px,var(--ef-available-height,340px));overflow-y:auto;padding:4px;scroll-padding-block:4px}.ef-combobox__item{position:relative;display:flex;width:100%;align-items:center;gap:8px;padding:7px 30px 7px 8px;border:0;border-radius:var(--radius-sm);outline:0;background:transparent;color:var(--text-primary);font:inherit;font-size:var(--text-sm);text-align:start;cursor:default;user-select:none}.ef-combobox__item[data-highlighted="true"]{background:var(--surface-sunken)}.ef-combobox__item[data-disabled="true"]{pointer-events:none;opacity:.5}.ef-combobox__item[hidden]{display:none}.ef-combobox__indicator{position:absolute;inset-inline-end:8px;display:inline-flex;color:var(--accent)}
.ef-combobox__group{padding:4px}.ef-combobox__group:not(:has(.ef-combobox__item:not([hidden]))){display:none}.ef-combobox__label{padding:6px 8px;color:var(--text-muted);font-size:var(--text-xs);font-weight:var(--weight-medium)}.ef-combobox__empty{display:flex;justify-content:center;padding:12px;color:var(--text-muted);font-size:var(--text-sm)}.ef-combobox__separator{height:1px;margin:4px -4px;background:var(--border-default)}
.ef-combobox__chips{display:flex;min-height:var(--control-h-md);width:100%;flex-wrap:wrap;align-items:center;gap:6px;padding:5px 8px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card)}.ef-combobox__chips:focus-within{border-color:var(--accent);box-shadow:var(--focus-ring)}.ef-combobox__chip{display:inline-flex;height:24px;align-items:center;gap:3px;padding:0 4px 0 7px;border-radius:var(--radius-sm);background:var(--surface-sunken);font-size:var(--text-xs);font-weight:var(--weight-medium)}.ef-combobox__chip-remove{display:inline-flex;width:20px;height:20px;align-items:center;justify-content:center;border:0;border-radius:var(--radius-sm);background:transparent;color:var(--text-muted);cursor:pointer}.ef-combobox__chip-remove:hover{background:var(--surface-card);color:var(--text-primary)}.ef-combobox__chips-input{min-width:64px;flex:1;border:0;outline:0;background:transparent;color:var(--text-primary);font:inherit;font-size:var(--text-sm)}
`;

const ComboboxContext = React.createContext(null);
const join = (...values) => values.filter(Boolean).join(' ');
const textOf = node => React.Children.toArray(node).map(child => typeof child === 'string' || typeof child === 'number' ? String(child) : React.isValidElement(child) ? textOf(child.props.children) : '').join(' ').trim();
const itemValue = item => typeof item === 'object' && item !== null ? item.value ?? item.id ?? item.name ?? item.label : item;
const itemText = item => typeof item === 'object' && item !== null ? String(item.label ?? item.name ?? item.value ?? item.id ?? '') : String(item ?? '');
const same = (a, b) => Object.is(a, b) || itemValue(a) === itemValue(b);

export function Combobox({ items = [], value, defaultValue, onValueChange, multiple = false, open, defaultOpen = false, onOpenChange, inputValue, defaultInputValue = '', onInputValueChange, disabled = false, autoHighlight = true, children }) {
  injectEfCss('ef-css-combobox', CSS);
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? (multiple ? [] : null));
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [internalInput, setInternalInput] = React.useState(defaultInputValue);
  const [active, setActive] = React.useState('');
  const [version, setVersion] = React.useState(0);
  const listId = React.useId();
  const records = React.useRef(new Map());
  const anchorRef = React.useRef(null);
  const currentValue = value === undefined ? internalValue : value;
  const isOpen = open === undefined ? internalOpen : open;
  const query = inputValue === undefined ? internalInput : inputValue;
  const setOpen = React.useCallback(next => { if (open === undefined) setInternalOpen(next); onOpenChange?.(next); }, [open, onOpenChange]);
  const setQuery = React.useCallback(next => { if (inputValue === undefined) setInternalInput(next); onInputValueChange?.(next); }, [inputValue, onInputValueChange]);
  const setValue = React.useCallback(next => { if (value === undefined) setInternalValue(next); onValueChange?.(next); }, [value, onValueChange]);
  const selected = multiple ? (Array.isArray(currentValue) ? currentValue : []) : currentValue;
  const register = React.useCallback((id, record) => { records.current.set(id, record); setVersion(v => v + 1); return () => { records.current.delete(id); setVersion(v => v + 1); }; }, []);
  const matches = React.useCallback(record => !query || `${record.text} ${(record.keywords || []).join(' ')}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()), [query]);
  const visibleRecords = [...records.current.values()].filter(record => !record.disabled && matches(record));
  React.useEffect(() => {
    if (!isOpen || !autoHighlight || !visibleRecords.length) return;
    if (!visibleRecords.some(record => record.id === active)) setActive(visibleRecords[0].id);
  }, [isOpen, query, version, autoHighlight]);
  React.useEffect(() => {
    if (multiple || isOpen || query || currentValue == null) return;
    const found = items.find(item => same(itemValue(item), currentValue));
    if (found !== undefined) setQuery(itemText(found));
  }, [currentValue, items, isOpen, multiple]);
  const choose = React.useCallback((next, label) => {
    if (multiple) {
      const values = Array.isArray(selected) ? selected : [];
      setValue(values.some(value => same(value, next)) ? values.filter(value => !same(value, next)) : [...values, next]);
      setQuery('');
    } else {
      setValue(next); setQuery(label); setOpen(false);
    }
  }, [multiple, selected, setOpen, setQuery, setValue]);
  const remove = React.useCallback(next => { if (multiple) setValue(selected.filter(value => !same(value, next))); else { setValue(null); setQuery(''); } }, [multiple, selected, setQuery, setValue]);
  const clear = React.useCallback(() => { setValue(multiple ? [] : null); setQuery(''); }, [multiple, setQuery, setValue]);
  const filteredItems = items.filter(item => !query || itemText(item).toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const context = React.useMemo(() => ({ active, anchorRef, choose, clear, disabled, filteredItems, isOpen, listId, matches, multiple, query, records, register, remove, selected, setActive, setOpen, setQuery, visibleCount: visibleRecords.length }), [active, choose, clear, disabled, filteredItems, isOpen, listId, matches, multiple, query, register, remove, selected, setOpen, setQuery, visibleRecords.length]);
  return <ComboboxContext.Provider value={context}>{children}</ComboboxContext.Provider>;
}

export const ComboboxValue = React.forwardRef(function ComboboxValue({ children, className, ...props }, ref) {
  const context = React.useContext(ComboboxContext);
  const content = typeof children === 'function' ? children(context?.selected) : children ?? (Array.isArray(context?.selected) ? context.selected.map(itemText).join(', ') : itemText(context?.selected));
  return <span ref={ref} data-slot="combobox-value" className={className} {...props}>{content}</span>;
});

export const ComboboxTrigger = React.forwardRef(function ComboboxTrigger({ className, children, disabled, onClick, ...props }, ref) {
  const context = React.useContext(ComboboxContext);
  return <button ref={ref} type="button" data-slot="combobox-trigger" aria-haspopup="listbox" aria-expanded={context?.isOpen} disabled={disabled ?? context?.disabled} className={join('ef-combobox__button', className)} onClick={event => { onClick?.(event); if (!event.defaultPrevented) context?.setOpen(!context.isOpen); }} {...props}>{children}<Icon name="chevron-down" size={16} /></button>;
});

export const ComboboxClear = React.forwardRef(function ComboboxClear({ className, children, disabled, onClick, ...props }, ref) {
  const context = React.useContext(ComboboxContext);
  return <button ref={ref} type="button" data-slot="combobox-clear" aria-label="Clear selection" disabled={disabled ?? context?.disabled} className={join('ef-combobox__button', className)} onClick={event => { onClick?.(event); if (!event.defaultPrevented) context?.clear(); }} {...props}>{children || <Icon name="x" size={14} />}</button>;
});

function useInputKeyboard(context, onKeyDown) {
  return event => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !context) return;
    const current = [...context.records.current.values()].filter(record => !record.disabled && context.matches(record));
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); context.setOpen(true);
      if (!current.length) return;
      const index = current.findIndex(record => record.id === context.active);
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const next = Math.max(0, Math.min(current.length - 1, (index < 0 ? 0 : index) + delta));
      context.setActive(current[next].id); current[next].ref.current?.scrollIntoView?.({ block: 'nearest' });
    } else if (event.key === 'Home' || event.key === 'End') {
      if (!context.isOpen || !current.length) return;
      event.preventDefault(); context.setActive(current[event.key === 'Home' ? 0 : current.length - 1].id);
    } else if (event.key === 'Enter' && context.isOpen) {
      const record = current.find(item => item.id === context.active);
      if (record) { event.preventDefault(); record.ref.current?.click(); }
    } else if (event.key === 'Escape') { context.setOpen(false); }
    else if (event.key === 'Backspace' && !context.query && context.multiple && context.selected.length) { context.remove(context.selected[context.selected.length - 1]); }
  };
}

export const ComboboxInput = React.forwardRef(function ComboboxInput({ className, children, disabled = false, showTrigger = true, showClear = false, onChange, onFocus, onKeyDown, ...props }, forwardedRef) {
  const context = React.useContext(ComboboxContext);
  const localRef = React.useRef(null);
  React.useImperativeHandle(forwardedRef, () => localRef.current);
  const hasSelection = context?.multiple ? context.selected.length > 0 : context?.selected != null;
  return <div ref={context?.anchorRef} className="ef-combobox"><InputGroup className={join('ef-combobox__input-group', className)}><InputGroupInput ref={localRef} data-slot="combobox-input" role="combobox" aria-autocomplete="list" aria-expanded={context?.isOpen} aria-controls={context?.listId} aria-activedescendant={context?.active || undefined} disabled={disabled || context?.disabled} className="ef-combobox__input" value={context?.query ?? ''} onChange={event => { context?.setQuery(event.target.value); context?.setOpen(true); onChange?.(event); }} onFocus={event => { context?.setOpen(true); onFocus?.(event); }} onKeyDown={useInputKeyboard(context, onKeyDown)} {...props} /><InputGroupAddon align="inline-end" className="ef-combobox__actions">{showClear && hasSelection ? <ComboboxClear /> : showTrigger ? <ComboboxTrigger /> : null}</InputGroupAddon>{children}</InputGroup></div>;
});

export const ComboboxContent = React.forwardRef(function ComboboxContent({ className, side = 'bottom', sideOffset = 6, align = 'start', alignOffset = 0, anchor, children, ...props }, forwardedRef) {
  const context = React.useContext(ComboboxContext);
  const popupRef = React.useRef(null);
  React.useImperativeHandle(forwardedRef, () => popupRef.current);
  const target = anchor || context?.anchorRef;
  const { style } = useAnchoredStyle(target, popupRef, { open: context?.isOpen, placement: side, align, offset: sideOffset, crossOffset: alignOffset, matchWidth: side === 'top' || side === 'bottom' });
  React.useEffect(() => {
    if (!context?.isOpen) return;
    const close = event => { if (!target?.current?.contains(event.target) && !popupRef.current?.contains(event.target)) context.setOpen(false); };
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close);
  }, [context?.isOpen, context?.setOpen, target]);
  if (!context?.isOpen) return null;
  return <Portal><div ref={popupRef} data-slot="combobox-content" className={join('ef-combobox__content', className)} style={style} {...props}>{children}</div></Portal>;
});

export const ComboboxList = React.forwardRef(function ComboboxList({ className, children, ...props }, ref) {
  const context = React.useContext(ComboboxContext);
  const content = typeof children === 'function' ? context?.filteredItems.map((item, index) => <React.Fragment key={String(itemValue(item) ?? index)}>{children(item)}</React.Fragment>) : children;
  return <div ref={ref} id={props.id || context?.listId} data-slot="combobox-list" role="listbox" aria-multiselectable={context?.multiple || undefined} className={join('ef-combobox__list', className)} {...props}>{content}</div>;
});

export const ComboboxItem = React.forwardRef(function ComboboxItem({ value, keywords = [], disabled = false, className, children, onClick, ...props }, forwardedRef) {
  const context = React.useContext(ComboboxContext);
  const reactId = React.useId();
  const id = props.id || reactId;
  const localRef = React.useRef(null);
  React.useImperativeHandle(forwardedRef, () => localRef.current);
  const nextValue = value ?? textOf(children);
  const text = textOf(children) || itemText(nextValue);
  React.useEffect(() => context?.register(id, { id, value: nextValue, text, keywords, disabled, ref: localRef }), [context?.register, disabled, id, keywords.join('\0'), nextValue, text]);
  const hidden = context ? !context.matches({ text, keywords }) : false;
  const selected = context?.multiple ? context.selected.some(item => same(item, nextValue)) : same(context?.selected, nextValue);
  return <button ref={localRef} type="button" id={id} data-slot="combobox-item" data-highlighted={context?.active === id ? 'true' : 'false'} data-disabled={disabled ? 'true' : 'false'} role="option" aria-selected={selected} disabled={disabled} hidden={hidden} className={join('ef-combobox__item', className)} onMouseEnter={() => !disabled && context?.setActive(id)} onClick={event => { onClick?.(event); if (!event.defaultPrevented && !disabled) context?.choose(nextValue, text); }} {...props}>{children}{selected ? <span data-slot="combobox-item-indicator" className="ef-combobox__indicator"><Icon name="check" size={15} /></span> : null}</button>;
});

export const ComboboxGroup = React.forwardRef(function ComboboxGroup({ className, ...props }, ref) { return <div ref={ref} data-slot="combobox-group" role="group" className={join('ef-combobox__group', className)} {...props} />; });
export const ComboboxLabel = React.forwardRef(function ComboboxLabel({ className, ...props }, ref) { return <div ref={ref} data-slot="combobox-label" className={join('ef-combobox__label', className)} {...props} />; });
export function ComboboxCollection({ children }) { return <>{children}</>; }
export const ComboboxEmpty = React.forwardRef(function ComboboxEmpty({ className, ...props }, ref) { const context = React.useContext(ComboboxContext); return context?.visibleCount === 0 && context.filteredItems.length === 0 ? <div ref={ref} data-slot="combobox-empty" className={join('ef-combobox__empty', className)} {...props} /> : null; });
export const ComboboxSeparator = React.forwardRef(function ComboboxSeparator({ className, ...props }, ref) { return <div ref={ref} data-slot="combobox-separator" role="separator" className={join('ef-combobox__separator', className)} {...props} />; });

export const ComboboxChips = React.forwardRef(function ComboboxChips({ className, ...props }, forwardedRef) {
  const context = React.useContext(ComboboxContext);
  const localRef = React.useRef(null);
  React.useImperativeHandle(forwardedRef, () => localRef.current);
  React.useEffect(() => { if (context) context.anchorRef.current = localRef.current; }, [context]);
  return <div ref={localRef} data-slot="combobox-chips" className={join('ef-combobox__chips', className)} {...props} />;
});
export const ComboboxChip = React.forwardRef(function ComboboxChip({ value, className, children, showRemove = true, ...props }, ref) { const context = React.useContext(ComboboxContext); const nextValue = value ?? textOf(children); return <span ref={ref} data-slot="combobox-chip" className={join('ef-combobox__chip', className)} {...props}>{children}{showRemove ? <button type="button" data-slot="combobox-chip-remove" className="ef-combobox__chip-remove" aria-label={`Remove ${itemText(nextValue)}`} onClick={() => context?.remove(nextValue)}><Icon name="x" size={12} /></button> : null}</span>; });
export const ComboboxChipsInput = React.forwardRef(function ComboboxChipsInput({ className, onChange, onFocus, onKeyDown, ...props }, ref) { const context = React.useContext(ComboboxContext); return <input ref={ref} data-slot="combobox-chips-input" role="combobox" aria-autocomplete="list" aria-expanded={context?.isOpen} aria-controls={context?.listId} aria-activedescendant={context?.active || undefined} className={join('ef-combobox__chips-input', className)} value={context?.query ?? ''} onChange={event => { context?.setQuery(event.target.value); context?.setOpen(true); onChange?.(event); }} onFocus={event => { context?.setOpen(true); onFocus?.(event); }} onKeyDown={useInputKeyboard(context, onKeyDown)} {...props} />; });
export function useComboboxAnchor() { return React.useRef(null); }
