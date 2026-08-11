import React from 'react';
import { injectEfCss, mergeRefs } from '../forms/Button.jsx';
import { useDirection } from '../display/Direction.jsx';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../overlay/DropdownMenu.jsx';

const CSS = `
.ef-menubar{display:flex;width:max-content;height:36px;align-items:center;gap:2px;padding:3px;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);box-shadow:var(--shadow-xs)}
.ef-menubar__trigger{display:flex;height:28px;align-items:center;padding:0 8px;border:0;border-radius:var(--radius-sm);outline:0;background:transparent;color:var(--text-primary);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:default;user-select:none}
.ef-menubar__trigger:hover,.ef-menubar__trigger:focus,.ef-menubar__trigger[data-state=open]{background:var(--surface-sunken)}
.ef-menubar__trigger:focus-visible{box-shadow:var(--focus-ring)}
`;

const MenubarRootContext = React.createContext(null);
const MenubarMenuContext = React.createContext(null);
const join = (...values) => values.filter(Boolean).join(' ');

export const Menubar = React.forwardRef(function Menubar({ loop = true, className, children, onKeyDown, ...props }, forwardedRef) {
  injectEfCss('ef-css-menubar', CSS);
  const direction = useDirection();
  const rootRef = React.useRef(null);
  const [value, setValue] = React.useState(null);
  const [tabStop, setTabStop] = React.useState(null);
  const move = React.useCallback((current, delta, openNext = false) => {
    const triggers = rootRef.current ? Array.from(rootRef.current.querySelectorAll('[data-slot="menubar-trigger"]:not(:disabled)')) : [];
    if (!triggers.length) return;
    const currentIndex = triggers.findIndex(trigger => trigger.dataset.menuId === current);
    const raw = Math.max(0, currentIndex) + delta;
    const nextIndex = loop ? (raw + triggers.length) % triggers.length : Math.max(0, Math.min(triggers.length - 1, raw));
    const next = triggers[nextIndex];
    next?.focus();
    if (openNext && next?.dataset.menuId) setValue(next.dataset.menuId);
  }, [loop]);
  const context = React.useMemo(() => ({ value, setValue, move, direction, tabStop, setTabStop }), [value, move, direction, tabStop]);
  return <MenubarRootContext.Provider value={context}><div {...props} ref={mergeRefs(forwardedRef, rootRef)} role="menubar" data-slot="menubar" className={join('ef-menubar', className)} onKeyDown={onKeyDown}>{children}</div></MenubarRootContext.Provider>;
});

export function MenubarMenu({ children, onOpenChange }) {
  const root = React.useContext(MenubarRootContext);
  const id = React.useId();
  const open = root?.value === id;
  const setOpen = next => {
    root?.setValue(next ? id : null);
    onOpenChange?.(next);
  };
  return <MenubarMenuContext.Provider value={{ id }}><DropdownMenu open={open} onOpenChange={setOpen}>{children}</DropdownMenu></MenubarMenuContext.Provider>;
}

export const MenubarTrigger = React.forwardRef(function MenubarTrigger({ className, onKeyDown, onMouseEnter, onFocus, tabIndex, ...props }, ref) {
  const root = React.useContext(MenubarRootContext);
  const menu = React.useContext(MenubarMenuContext);
  React.useEffect(() => { root?.setTabStop(current => current ?? menu?.id); }, [root?.setTabStop, menu?.id]);
  const keyboard = event => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      root?.setValue(menu?.id);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const visualDelta = event.key === 'ArrowRight' ? 1 : -1;
      root?.move(menu?.id, root.direction === 'rtl' ? -visualDelta : visualDelta, root.value !== null);
    }
  };
  const enter = event => {
    onMouseEnter?.(event);
    if (!event.defaultPrevented && root?.value !== null) root.setValue(menu?.id);
  };
  const focus = event => { root?.setTabStop(menu?.id); onFocus?.(event); };
  return <DropdownMenuTrigger {...props} ref={ref} role="menuitem" slot="menubar-trigger" data-menu-id={menu?.id} tabIndex={tabIndex ?? (root?.tabStop === null || root?.tabStop === menu?.id ? 0 : -1)} className={join('ef-menubar__trigger', className)} onKeyDown={keyboard} onMouseEnter={enter} onFocus={focus} />;
});

export const MenubarContent = React.forwardRef(function MenubarContent({ align = 'start', alignOffset = -4, sideOffset = 8, onKeyDown, ...props }, ref) {
  const root = React.useContext(MenubarRootContext);
  const menu = React.useContext(MenubarMenuContext);
  const keyboard = event => {
    onKeyDown?.(event);
    if (event.defaultPrevented || (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')) return;
    event.preventDefault();
    const visualDelta = event.key === 'ArrowRight' ? 1 : -1;
    root?.move(menu?.id, root.direction === 'rtl' ? -visualDelta : visualDelta, true);
  };
  return <DropdownMenuContent {...props} ref={ref} slot="menubar-content" align={align} alignOffset={alignOffset} sideOffset={sideOffset} onKeyDown={keyboard} />;
});

export function MenubarPortal(props) { return <DropdownMenuPortal {...props} />; }
export const MenubarGroup = React.forwardRef(function MenubarGroup(props, ref) { return <DropdownMenuGroup {...props} ref={ref} slot="menubar-group" />; });
export function MenubarRadioGroup(props) { return <DropdownMenuRadioGroup {...props} slot="menubar-radio-group" />; }
export const MenubarLabel = React.forwardRef(function MenubarLabel(props, ref) { return <DropdownMenuLabel {...props} ref={ref} slot="menubar-label" />; });
export const MenubarSeparator = React.forwardRef(function MenubarSeparator(props, ref) { return <DropdownMenuSeparator {...props} ref={ref} slot="menubar-separator" />; });
export const MenubarShortcut = React.forwardRef(function MenubarShortcut(props, ref) { return <DropdownMenuShortcut {...props} ref={ref} slot="menubar-shortcut" />; });
export const MenubarItem = React.forwardRef(function MenubarItem(props, ref) { return <DropdownMenuItem {...props} ref={ref} slot="menubar-item" />; });
export const MenubarCheckboxItem = React.forwardRef(function MenubarCheckboxItem(props, ref) { return <DropdownMenuCheckboxItem {...props} ref={ref} slot="menubar-checkbox-item" />; });
export const MenubarRadioItem = React.forwardRef(function MenubarRadioItem(props, ref) { return <DropdownMenuRadioItem {...props} ref={ref} slot="menubar-radio-item" />; });
export function MenubarSub(props) { return <DropdownMenuSub {...props} />; }
export const MenubarSubTrigger = React.forwardRef(function MenubarSubTrigger(props, ref) { return <DropdownMenuSubTrigger {...props} ref={ref} slot="menubar-sub-trigger" />; });
export const MenubarSubContent = React.forwardRef(function MenubarSubContent(props, ref) { return <DropdownMenuSubContent {...props} ref={ref} slot="menubar-sub-content" />; });
