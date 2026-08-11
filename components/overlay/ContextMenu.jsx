import React from 'react';
import { injectEfCss, mergeRefs, useIsoLayoutEffect } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
import { Portal, useAnchoredStyle } from './Portal.jsx';

const CSS = `
.ef-context-menu__content{position:fixed;min-width:128px;max-height:calc(100vh - 16px);overflow:auto;background:var(--surface-card);color:var(--text-primary);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:4px;z-index:var(--z-dropdown);animation:ef-context-menu-in var(--dur-fast) var(--ease-out)}
@keyframes ef-context-menu-in{from{opacity:0;transform:scale(.98)}}
.ef-context-menu__item{position:relative;display:flex;align-items:center;gap:8px;width:100%;min-height:32px;padding:6px 8px;border:0;border-radius:var(--radius-sm);outline:0;background:transparent;color:var(--text-primary);font:inherit;font-size:var(--text-sm);line-height:1.35;text-align:start;white-space:nowrap;cursor:default;user-select:none}
.ef-context-menu__item:hover,.ef-context-menu__item:focus,.ef-context-menu__item[data-highlighted=true],.ef-context-menu__item[data-state=open]{background:var(--surface-sunken)}
.ef-context-menu__item:disabled,.ef-context-menu__item[data-disabled=true]{pointer-events:none;opacity:.5}
.ef-context-menu__item[data-inset=true],.ef-context-menu__label[data-inset=true]{padding-inline-start:32px}
.ef-context-menu__item[data-variant=destructive]{color:var(--danger-600)}
.ef-context-menu__indicator{position:absolute;inset-inline-start:8px;display:inline-flex;width:14px;align-items:center;justify-content:center}
.ef-context-menu__label{padding:6px 8px;color:var(--text-primary);font-size:var(--text-sm);font-weight:var(--weight-medium)}
.ef-context-menu__separator{height:1px;margin:4px -4px;background:var(--border-default)}
.ef-context-menu__shortcut{margin-inline-start:auto;color:var(--text-muted);font-size:var(--text-xs);letter-spacing:.08em}
.ef-context-menu__chevron{display:inline-flex;margin-inline-start:auto;color:var(--text-muted)}
`;

const RootCtx = React.createContext(null);
const SubCtx = React.createContext(null);
const RadioCtx = React.createContext(null);
const join = (...values) => values.filter(Boolean).join(' ');
const compose = (theirs, ours) => event => { theirs?.(event); if (!event.defaultPrevented) ours?.(event); };

function menuItems(node) {
  return node ? Array.from(node.querySelectorAll('[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]')).filter(item => !item.disabled && item.dataset.disabled !== 'true') : [];
}

function focusRelative(node, direction, loop = true) {
  const items = menuItems(node);
  if (!items.length) return;
  const current = items.indexOf(document.activeElement);
  const raw = Math.max(0, current) + direction;
  const index = direction === 'first' ? 0 : direction === 'last' ? items.length - 1 : loop ? (raw + items.length) % items.length : Math.max(0, Math.min(items.length - 1, raw));
  items[index]?.focus();
}

function useMenuKeyboard(ref, close, { sub = false, loop = true } = {}) {
  return event => {
    if (event.defaultPrevented) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusRelative(ref.current, event.key === 'ArrowDown' ? 1 : -1, loop);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      focusRelative(ref.current, event.key === 'Home' ? 'first' : 'last');
    } else if (event.key === 'Escape' || (sub && event.key === 'ArrowLeft')) {
      event.preventDefault();
      close?.();
    } else if (event.key.length === 1 && /\S/.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const items = menuItems(ref.current);
      const start = Math.max(0, items.indexOf(document.activeElement));
      const key = event.key.toLocaleLowerCase();
      for (let offset = 1; offset <= items.length; offset += 1) {
        const item = items[(start + offset) % items.length];
        if ((item.textContent || '').trim().toLocaleLowerCase().startsWith(key)) {
          event.preventDefault();
          item.focus();
          break;
        }
      }
    }
  };
}

export function ContextMenu({ open: controlled, defaultOpen = false, onOpenChange, modal = true, children }) {
  injectEfCss('ef-css-context-menu', CSS);
  const [inner, setInner] = React.useState(defaultOpen);
  const [point, setPoint] = React.useState({ x: 0, y: 0 });
  const open = controlled !== undefined ? controlled : inner;
  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);
  const setOpen = React.useCallback(next => {
    if (controlled === undefined) setInner(next);
    onOpenChange?.(next);
  }, [controlled, onOpenChange]);
  const openAt = React.useCallback((x, y) => { setPoint({ x, y }); setOpen(true); }, [setOpen]);
  const value = React.useMemo(() => ({ open, setOpen, openAt, point, triggerRef, contentRef, modal }), [open, setOpen, openAt, point, modal]);
  return <RootCtx.Provider value={value}>{children}</RootCtx.Provider>;
}

export const ContextMenuTrigger = React.forwardRef(function ContextMenuTrigger({ asChild = false, disabled = false, children, ...rest }, forwardedRef) {
  const root = React.useContext(RootCtx);
  const open = event => {
    if (disabled) return;
    event.preventDefault();
    root?.openAt(event.clientX, event.clientY);
  };
  const keyboard = event => {
    if (disabled || (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10'))) return;
    event.preventDefault();
    const rect = root?.triggerRef.current?.getBoundingClientRect();
    root?.openAt(rect?.left ?? 0, rect?.bottom ?? 0);
  };
  const props = { ...rest, ref: mergeRefs(forwardedRef, root?.triggerRef), 'data-slot': 'context-menu-trigger', 'data-state': root?.open ? 'open' : 'closed', 'data-disabled': disabled ? 'true' : undefined, onContextMenu: compose(rest.onContextMenu, open), onKeyDown: compose(rest.onKeyDown, keyboard) };
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { ...props, ...children.props, ref: mergeRefs(children.ref, props.ref), onContextMenu: compose(children.props.onContextMenu, props.onContextMenu), onKeyDown: compose(children.props.onKeyDown, props.onKeyDown), 'data-slot': props['data-slot'], 'data-state': props['data-state'], 'data-disabled': props['data-disabled'] });
  }
  return <span {...props}>{children}</span>;
});

export function ContextMenuPortal({ children, container }) {
  return <Portal container={container}>{children}</Portal>;
}

export const ContextMenuContent = React.forwardRef(function ContextMenuContent({ loop = true, className, style, onKeyDown, onCloseAutoFocus, children, ...rest }, forwardedRef) {
  const root = React.useContext(RootCtx);
  const localRef = React.useRef(null);
  const ref = mergeRefs(forwardedRef, localRef, root?.contentRef);
  const close = React.useCallback(() => {
    root?.setOpen(false);
    const event = { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    onCloseAutoFocus?.(event);
    if (!event.defaultPrevented) root?.triggerRef.current?.focus?.();
  }, [root, onCloseAutoFocus]);
  const keyboard = useMenuKeyboard(localRef, close, { loop });
  useIsoLayoutEffect(() => {
    if (!root?.open || !localRef.current) return;
    const panel = localRef.current;
    const rect = panel.getBoundingClientRect();
    const edge = 8;
    const x = Math.max(edge, Math.min(root.point.x, document.documentElement.clientWidth - rect.width - edge));
    const y = Math.max(edge, Math.min(root.point.y, document.documentElement.clientHeight - rect.height - edge));
    panel.style.left = `${Math.round(x)}px`;
    panel.style.top = `${Math.round(y)}px`;
    menuItems(panel)[0]?.focus();
  }, [root?.open, root?.point.x, root?.point.y]);
  React.useEffect(() => {
    if (!root?.open) return;
    const away = event => { if (!localRef.current?.contains(event.target) && !root.triggerRef.current?.contains(event.target)) close(); };
    const blur = () => close();
    document.addEventListener('pointerdown', away);
    window.addEventListener('blur', blur);
    return () => { document.removeEventListener('pointerdown', away); window.removeEventListener('blur', blur); };
  }, [root?.open, close]);
  if (!root?.open) return null;
  return <ContextMenuPortal><div {...rest} ref={ref} role="menu" data-slot="context-menu-content" data-state="open" className={join('ef-context-menu__content', className)} style={{ left: root.point.x, top: root.point.y, ...style }} onKeyDown={compose(onKeyDown, keyboard)}>{children}</div></ContextMenuPortal>;
});

export const ContextMenuGroup = React.forwardRef(function ContextMenuGroup(props, ref) {
  return <div {...props} ref={ref} role="group" data-slot="context-menu-group" />;
});

export const ContextMenuLabel = React.forwardRef(function ContextMenuLabel({ inset = false, className, ...props }, ref) {
  return <div {...props} ref={ref} data-slot="context-menu-label" data-inset={inset ? 'true' : undefined} className={join('ef-context-menu__label', className)} />;
});

export const ContextMenuSeparator = React.forwardRef(function ContextMenuSeparator({ className, ...props }, ref) {
  return <div {...props} ref={ref} role="separator" data-slot="context-menu-separator" className={join('ef-context-menu__separator', className)} />;
});

export const ContextMenuShortcut = React.forwardRef(function ContextMenuShortcut({ className, ...props }, ref) {
  return <span {...props} ref={ref} data-slot="context-menu-shortcut" className={join('ef-context-menu__shortcut', className)} />;
});

export const ContextMenuItem = React.forwardRef(function ContextMenuItem({ inset = false, variant = 'default', disabled = false, onSelect, onClick, className, children, ...props }, ref) {
  const root = React.useContext(RootCtx);
  const activate = event => { onClick?.(event); if (!event.defaultPrevented && !disabled) { onSelect?.(event); if (!event.defaultPrevented) root?.setOpen(false); } };
  return <button {...props} ref={ref} type="button" role="menuitem" disabled={disabled} data-slot="context-menu-item" data-inset={inset ? 'true' : undefined} data-variant={variant} data-disabled={disabled ? 'true' : undefined} className={join('ef-context-menu__item', className)} onClick={activate}>{children}</button>;
});

export const ContextMenuCheckboxItem = React.forwardRef(function ContextMenuCheckboxItem({ checked: controlled, defaultChecked = false, onCheckedChange, disabled = false, onSelect, onClick, className, children, ...props }, ref) {
  const root = React.useContext(RootCtx);
  const [inner, setInner] = React.useState(defaultChecked);
  const checked = controlled !== undefined ? controlled : inner;
  const activate = event => { onClick?.(event); if (event.defaultPrevented || disabled) return; const next = !checked; if (controlled === undefined) setInner(next); onCheckedChange?.(next); onSelect?.(event); if (!event.defaultPrevented) root?.setOpen(false); };
  return <button {...props} ref={ref} type="button" role="menuitemcheckbox" aria-checked={checked} disabled={disabled} data-slot="context-menu-checkbox-item" data-state={checked ? 'checked' : 'unchecked'} data-disabled={disabled ? 'true' : undefined} className={join('ef-context-menu__item', className)} onClick={activate}><span className="ef-context-menu__indicator">{checked ? <Icon name="check" size={14} /> : null}</span>{children}</button>;
});

export function ContextMenuRadioGroup({ value: controlled, defaultValue = '', onValueChange, children, ...props }) {
  const [inner, setInner] = React.useState(defaultValue);
  const value = controlled !== undefined ? controlled : inner;
  const setValue = next => { if (controlled === undefined) setInner(next); onValueChange?.(next); };
  return <RadioCtx.Provider value={{ value, setValue }}><div {...props} role="group" data-slot="context-menu-radio-group">{children}</div></RadioCtx.Provider>;
}

export const ContextMenuRadioItem = React.forwardRef(function ContextMenuRadioItem({ value, disabled = false, onSelect, onClick, className, children, ...props }, ref) {
  const root = React.useContext(RootCtx);
  const radio = React.useContext(RadioCtx);
  const checked = radio?.value === value;
  const activate = event => { onClick?.(event); if (event.defaultPrevented || disabled) return; radio?.setValue(value); onSelect?.(event); if (!event.defaultPrevented) root?.setOpen(false); };
  return <button {...props} ref={ref} type="button" role="menuitemradio" aria-checked={checked} disabled={disabled} data-slot="context-menu-radio-item" data-state={checked ? 'checked' : 'unchecked'} data-disabled={disabled ? 'true' : undefined} className={join('ef-context-menu__item', className)} onClick={activate}><span className="ef-context-menu__indicator">{checked ? <Icon name="circle" size={8} /> : null}</span>{children}</button>;
});

export function ContextMenuSub({ open: controlled, defaultOpen = false, onOpenChange, children }) {
  const [inner, setInner] = React.useState(defaultOpen);
  const open = controlled !== undefined ? controlled : inner;
  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);
  const setOpen = next => { if (controlled === undefined) setInner(next); onOpenChange?.(next); };
  return <SubCtx.Provider value={{ open, setOpen, triggerRef, contentRef }}>{children}</SubCtx.Provider>;
}

export const ContextMenuSubTrigger = React.forwardRef(function ContextMenuSubTrigger({ inset = false, disabled = false, className, children, onKeyDown, ...props }, forwardedRef) {
  const sub = React.useContext(SubCtx);
  const keyboard = event => { if (!disabled && event.key === 'ArrowRight') { event.preventDefault(); sub?.setOpen(true); requestAnimationFrame(() => menuItems(sub?.contentRef.current)[0]?.focus()); } };
  return <button {...props} ref={mergeRefs(forwardedRef, sub?.triggerRef)} type="button" role="menuitem" disabled={disabled} data-slot="context-menu-sub-trigger" data-state={sub?.open ? 'open' : 'closed'} data-inset={inset ? 'true' : undefined} data-disabled={disabled ? 'true' : undefined} className={join('ef-context-menu__item', className)} onMouseEnter={() => !disabled && sub?.setOpen(true)} onKeyDown={compose(onKeyDown, keyboard)}>{children}<span className="ef-context-menu__chevron"><Icon name="chevron-right" size={14} /></span></button>;
});

export const ContextMenuSubContent = React.forwardRef(function ContextMenuSubContent({ sideOffset = 4, alignOffset = -4, loop = true, className, style, onKeyDown, children, ...props }, forwardedRef) {
  const sub = React.useContext(SubCtx);
  const localRef = React.useRef(null);
  const fallbackTriggerRef = React.useRef(null);
  const fallbackContentRef = React.useRef(null);
  const { style: anchored, side } = useAnchoredStyle(sub?.triggerRef ?? fallbackTriggerRef, sub?.contentRef ?? fallbackContentRef, { open: !!sub?.open, placement: 'right', align: 'start', offset: sideOffset, crossOffset: alignOffset });
  const close = () => { sub?.setOpen(false); sub?.triggerRef.current?.focus(); };
  const keyboard = useMenuKeyboard(localRef, close, { sub: true, loop });
  useIsoLayoutEffect(() => { if (sub?.open) menuItems(localRef.current)[0]?.focus(); }, [sub?.open]);
  if (!sub?.open) return null;
  return <ContextMenuPortal><div {...props} ref={mergeRefs(forwardedRef, localRef, sub.contentRef)} role="menu" data-slot="context-menu-sub-content" data-state="open" data-side={side} className={join('ef-context-menu__content', className)} style={{ ...anchored, ...style }} onMouseLeave={() => sub.setOpen(false)} onKeyDown={compose(onKeyDown, keyboard)}>{children}</div></ContextMenuPortal>;
});
