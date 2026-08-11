import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../feedback/Dialog.jsx';

const CSS = `
.ef-command{display:flex;width:100%;height:100%;flex-direction:column;overflow:hidden;border-radius:var(--radius-md);background:var(--surface-card);color:var(--text-primary);font-family:var(--font-sans)}
.ef-command__input-wrap{display:flex;height:44px;align-items:center;gap:8px;padding-inline:12px;border-bottom:1px solid var(--border-default);color:var(--text-muted)}
.ef-command__input{display:flex;width:100%;height:40px;border:0;outline:0;background:transparent;color:var(--text-primary);font:inherit;font-size:var(--text-sm)}.ef-command__input::placeholder{color:var(--text-muted)}.ef-command__input:disabled{cursor:not-allowed;opacity:.5}
.ef-command__list{max-height:300px;overflow-x:hidden;overflow-y:auto;scroll-padding-block:4px;padding:4px}
.ef-command__empty{padding:24px;text-align:center;color:var(--text-muted);font-size:var(--text-sm)}
.ef-command__group{overflow:hidden;padding:4px}.ef-command__group[hidden],.ef-command__group:not(:has(.ef-command__item:not([hidden]))){display:none}.ef-command__heading{padding:6px 8px;color:var(--text-muted);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.ef-command__item{position:relative;display:flex;width:100%;align-items:center;gap:8px;padding:7px 8px;border:0;border-radius:var(--radius-sm);outline:0;background:transparent;color:var(--text-primary);font:inherit;font-size:var(--text-sm);text-align:start;cursor:default;user-select:none}.ef-command__item[data-selected="true"]{background:var(--surface-sunken)}.ef-command__item[data-disabled="true"]{pointer-events:none;opacity:.5}.ef-command__item[hidden]{display:none}
.ef-command__shortcut{margin-inline-start:auto;color:var(--text-muted);font-size:var(--text-xs);letter-spacing:.08em}
.ef-command__separator{height:1px;margin-inline:-4px;background:var(--border-default)}
.ef-command-dialog{overflow:hidden;padding:0}.ef-command-dialog>.ef-dialog__close{z-index:1}.ef-command-dialog .ef-command__input-wrap{height:48px}.ef-command-dialog .ef-command__item{padding-block:10px}
.ef-command__sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
`;

const CommandContext = React.createContext(null);
const textOf = node => React.Children.toArray(node).map(child => typeof child === 'string' || typeof child === 'number' ? String(child) : React.isValidElement(child) ? textOf(child.props.children) : '').join(' ');
const join = (...values) => values.filter(Boolean).join(' ');

export const Command = React.forwardRef(function Command({ value, defaultValue = '', onValueChange, shouldFilter = true, filter, loop = false, className, children, onKeyDown, ...props }, ref) {
  injectEfCss('ef-css-command', CSS);
  const [search, setSearch] = React.useState('');
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [version, setVersion] = React.useState(0);
  const listId = React.useId();
  const items = React.useRef(new Map());
  const selected = value === undefined ? internalValue : value;
  const setSelected = React.useCallback(next => { if (value === undefined) setInternalValue(next); onValueChange?.(next); }, [value, onValueChange]);
  const register = React.useCallback((id, record) => { items.current.set(id, record); setVersion(v => v + 1); return () => { items.current.delete(id); setVersion(v => v + 1); }; }, []);
  const score = React.useCallback(record => {
    if (!shouldFilter || !search) return 1;
    if (filter) return filter(record.value, search, record.keywords) || 0;
    const haystack = `${record.value} ${record.label} ${(record.keywords || []).join(' ')}`.toLocaleLowerCase();
    return haystack.includes(search.toLocaleLowerCase()) ? 1 : 0;
  }, [filter, search, shouldFilter]);
  const visible = React.useCallback(record => score(record) > 0, [score]);
  const visibleItems = [...items.current.values()].filter(record => !record.disabled && visible(record));
  const activeId = visibleItems.find(record => record.value === selected)?.id;
  React.useEffect(() => {
    if (!visibleItems.length) return setSelected('');
    if (!visibleItems.some(record => record.value === selected)) setSelected(visibleItems[0].value);
  }, [search, version]);
  const keydown = event => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const current = [...items.current.values()].filter(record => !record.disabled && visible(record));
    if (!current.length) return;
    const index = Math.max(0, current.findIndex(record => record.value === selected));
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const next = loop ? (index + delta + current.length) % current.length : Math.max(0, Math.min(current.length - 1, index + delta));
      setSelected(current[next].value);
      current[next].ref.current?.scrollIntoView?.({ block: 'nearest' });
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setSelected(current[event.key === 'Home' ? 0 : current.length - 1].value);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      current[index].ref.current?.click();
    }
  };
  const context = React.useMemo(() => ({ register, search, setSearch, selected, setSelected, visible, visibleCount: visibleItems.length, version, listId, activeId }), [register, search, selected, setSelected, visible, visibleItems.length, version, listId, activeId]);
  return <CommandContext.Provider value={context}><div ref={ref} data-slot="command" className={join('ef-command', className)} onKeyDown={keydown} {...props}>{children}</div></CommandContext.Provider>;
});

export function CommandDialog({ title = 'Command Palette', description = 'Search for a command to run…', children, className, showCloseButton = true, ...props }) {
  injectEfCss('ef-css-command', CSS);
  return <Dialog {...props}><DialogContent className={join('ef-command-dialog', className)} showCloseButton={showCloseButton} width={560}><DialogHeader className="ef-command__sr"><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><Command>{children}</Command></DialogContent></Dialog>;
}

export const CommandInput = React.forwardRef(function CommandInput({ className, value, onChange, ...props }, ref) {
  const context = React.useContext(CommandContext);
  const current = value === undefined ? context?.search || '' : value;
  return <div data-slot="command-input-wrapper" className="ef-command__input-wrap"><Icon name="search" size={16} /><input ref={ref} data-slot="command-input" className={join('ef-command__input', className)} value={current} onChange={event => { if (value === undefined) context?.setSearch(event.target.value); onChange?.(event); }} role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls={context?.listId} aria-activedescendant={context?.activeId} aria-label={props['aria-label'] || props.placeholder} {...props} /></div>;
});

export const CommandList = React.forwardRef(function CommandList({ className, ...props }, ref) {
  const context = React.useContext(CommandContext);
  return <div ref={ref} id={props.id || context?.listId} data-slot="command-list" role="listbox" className={join('ef-command__list', className)} {...props} />;
});

export const CommandEmpty = React.forwardRef(function CommandEmpty({ className, ...props }, ref) {
  const context = React.useContext(CommandContext);
  return context?.visibleCount === 0 ? <div ref={ref} data-slot="command-empty" className={join('ef-command__empty', className)} {...props} /> : null;
});

export const CommandGroup = React.forwardRef(function CommandGroup({ heading, className, children, ...props }, ref) {
  return <div ref={ref} data-slot="command-group" role="group" aria-label={typeof heading === 'string' ? heading : undefined} className={join('ef-command__group', className)} {...props}>{heading ? <div data-slot="command-group-heading" className="ef-command__heading">{heading}</div> : null}{children}</div>;
});

export const CommandItem = React.forwardRef(function CommandItem({ value, keywords = [], disabled = false, onSelect, onClick, className, children, ...props }, forwardedRef) {
  const context = React.useContext(CommandContext);
  const id = React.useId();
  const localRef = React.useRef(null);
  React.useImperativeHandle(forwardedRef, () => localRef.current);
  const itemValue = value || textOf(children).trim();
  React.useEffect(() => context?.register(id, { id, value: itemValue, label: textOf(children), keywords, disabled, ref: localRef }), [context?.register, id, itemValue, keywords.join('\0'), disabled]);
  const hidden = context ? !context.visible({ value: itemValue, label: textOf(children), keywords, disabled }) : false;
  const selected = context?.selected === itemValue;
  const activate = event => { onClick?.(event); if (!event.defaultPrevented && !disabled) { context?.setSelected(itemValue); onSelect?.(itemValue); } };
  return <button ref={localRef} type="button" id={id} data-slot="command-item" data-value={itemValue} data-selected={selected ? 'true' : 'false'} data-disabled={disabled ? 'true' : 'false'} role="option" aria-selected={selected} disabled={disabled} hidden={hidden} className={join('ef-command__item', className)} onMouseEnter={() => !disabled && context?.setSelected(itemValue)} onClick={activate} {...props}>{children}</button>;
});

export const CommandShortcut = React.forwardRef(function CommandShortcut({ className, ...props }, ref) {
  return <span ref={ref} data-slot="command-shortcut" className={join('ef-command__shortcut', className)} {...props} />;
});

export const CommandSeparator = React.forwardRef(function CommandSeparator({ className, ...props }, ref) {
  return <div ref={ref} data-slot="command-separator" role="separator" className={join('ef-command__separator', className)} {...props} />;
});
