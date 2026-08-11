import React from 'react';
import ReactDOM from 'react-dom';
import { injectEfCss, mergeRefs, useIsoLayoutEffect } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
import { useDirection } from '../display/Direction.jsx';

const CSS = `
.ef-navigation-menu{position:relative;display:flex;width:max-content;max-width:100%;align-items:center;justify-content:center}
.ef-navigation-menu__list{display:flex;flex:1;list-style:none;align-items:center;justify-content:center;gap:4px;margin:0;padding:0}
.ef-navigation-menu__item{position:relative}
.ef-navigation-menu__trigger{display:inline-flex;width:max-content;height:36px;align-items:center;justify-content:center;gap:5px;padding:0 14px;border:0;border-radius:var(--radius-md);outline:0;background:transparent;color:var(--text-primary);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:default;transition:background var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-navigation-menu__trigger:hover,.ef-navigation-menu__trigger:focus,.ef-navigation-menu__trigger[data-state=open]{background:var(--surface-sunken)}.ef-navigation-menu__trigger:focus-visible{box-shadow:var(--focus-ring)}
.ef-navigation-menu__chevron{display:inline-flex;transition:transform var(--dur-med) var(--ease-out)}.ef-navigation-menu__trigger[data-state=open] .ef-navigation-menu__chevron{transform:rotate(180deg)}
.ef-navigation-menu__content{min-width:280px;padding:8px;color:var(--text-primary);animation:ef-navigation-menu-in var(--dur-med) var(--ease-out)}
.ef-navigation-menu[data-viewport=false] .ef-navigation-menu__content{position:absolute;inset-block-start:calc(100% + 6px);inset-inline-start:0;z-index:var(--z-dropdown);overflow:hidden;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);box-shadow:var(--shadow-md)}
.ef-navigation-menu__viewport-wrap{position:absolute;inset-block-start:100%;inset-inline-start:0;z-index:var(--z-dropdown);display:flex;justify-content:center;padding-top:6px}
.ef-navigation-menu__viewport{position:relative;width:max-content;min-width:280px;overflow:hidden;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);color:var(--text-primary);box-shadow:var(--shadow-md);transform-origin:top center;animation:ef-navigation-menu-viewport var(--dur-med) var(--ease-out)}
.ef-navigation-menu__link{display:flex;flex-direction:column;gap:3px;padding:9px 10px;border-radius:var(--radius-sm);outline:0;color:var(--text-primary);font-size:var(--text-sm);text-decoration:none;transition:background var(--dur-fast) var(--ease-out)}
.ef-navigation-menu__link:hover,.ef-navigation-menu__link:focus,.ef-navigation-menu__link[data-active=true]{background:var(--surface-sunken);text-decoration:none}.ef-navigation-menu__link:focus-visible{box-shadow:var(--focus-ring)}
.ef-navigation-menu__indicator{position:absolute;inset-block-start:calc(100% - 3px);z-index:calc(var(--z-dropdown) + 1);display:flex;height:9px;align-items:flex-end;justify-content:center;pointer-events:none;transition:inset-inline-start var(--dur-med) var(--ease-out),width var(--dur-med) var(--ease-out)}
.ef-navigation-menu__indicator-mark{width:9px;height:9px;transform:translateY(55%) rotate(45deg);border:1px solid var(--border-default);border-inline-end:0;border-block-end:0;border-radius:2px 0 0;background:var(--surface-card)}
@keyframes ef-navigation-menu-in{from{opacity:0;transform:translateY(-4px)}}@keyframes ef-navigation-menu-viewport{from{opacity:0;transform:scale(.98)}}
`;

const NavigationRootContext = React.createContext(null);
const NavigationItemContext = React.createContext(null);
const join = (...values) => values.filter(Boolean).join(' ');
const compose = (first, second) => event => { first?.(event); if (!event.defaultPrevented) second?.(event); };

export function navigationMenuTriggerStyle() { return 'ef-navigation-menu__trigger'; }

export const NavigationMenu = React.forwardRef(function NavigationMenu({ value: controlled, defaultValue = '', onValueChange, viewport = true, delayDuration = 150, skipDelayDuration = 300, orientation = 'horizontal', className, children, onKeyDown, ...props }, forwardedRef) {
  injectEfCss('ef-css-navigation-menu', CSS);
  const direction = useDirection();
  const [internal, setInternal] = React.useState(defaultValue);
  const [viewportNode, setViewportNode] = React.useState(null);
  const [tabStop, setTabStop] = React.useState(null);
  const [indicator, setIndicator] = React.useState({ start: 0, width: 0 });
  const rootRef = React.useRef(null);
  const timerRef = React.useRef(null);
  const value = controlled === undefined ? internal : controlled;
  const setValue = React.useCallback(next => { if (controlled === undefined) setInternal(next); onValueChange?.(next); }, [controlled, onValueChange]);
  const updateIndicator = React.useCallback(trigger => {
    const root = rootRef.current;
    if (!root || !trigger) return;
    const rootRect = root.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    setIndicator({ start: triggerRect.left - rootRect.left, width: triggerRect.width });
  }, []);
  const openItem = React.useCallback((next, trigger, immediate = false) => {
    clearTimeout(timerRef.current);
    const open = () => { setValue(next); updateIndicator(trigger); };
    if (immediate || !next) open(); else timerRef.current = setTimeout(open, value ? Math.min(delayDuration, skipDelayDuration) : delayDuration);
  }, [setValue, updateIndicator, value, delayDuration, skipDelayDuration]);
  const moveTrigger = React.useCallback((current, delta, openNext = false) => {
    const triggers = rootRef.current ? Array.from(rootRef.current.querySelectorAll('[data-slot="navigation-menu-trigger"]:not(:disabled)')) : [];
    if (!triggers.length) return;
    const currentIndex = triggers.findIndex(trigger => trigger.dataset.itemValue === current);
    const next = triggers[(Math.max(0, currentIndex) + delta + triggers.length) % triggers.length];
    next?.focus();
    if (openNext && next) openItem(next.dataset.itemValue, next, true);
  }, [openItem]);
  React.useEffect(() => {
    if (!value) return;
    const close = event => { if (!rootRef.current?.contains(event.target) && !viewportNode?.contains(event.target)) setValue(''); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [value, viewportNode, setValue]);
  React.useEffect(() => () => clearTimeout(timerRef.current), []);
  const focusTrigger = React.useCallback(itemValue => {
    const triggers = rootRef.current ? Array.from(rootRef.current.querySelectorAll('[data-slot="navigation-menu-trigger"]')) : [];
    triggers.find(trigger => trigger.dataset.itemValue === itemValue)?.focus();
  }, []);
  const context = React.useMemo(() => ({ value, setValue, viewport, viewportNode, setViewportNode, openItem, moveTrigger, focusTrigger, direction, orientation, tabStop, setTabStop, indicator, updateIndicator }), [value, setValue, viewport, viewportNode, openItem, moveTrigger, focusTrigger, direction, orientation, tabStop, indicator, updateIndicator]);
  return <NavigationRootContext.Provider value={context}><nav {...props} ref={mergeRefs(forwardedRef, rootRef)} data-slot="navigation-menu" data-viewport={viewport ? 'true' : 'false'} aria-orientation={orientation} className={join('ef-navigation-menu', className)} onKeyDown={onKeyDown}>{children}{viewport ? <NavigationMenuViewport /> : null}</nav></NavigationRootContext.Provider>;
});

export const NavigationMenuList = React.forwardRef(function NavigationMenuList({ className, ...props }, ref) { return <ul {...props} ref={ref} data-slot="navigation-menu-list" className={join('ef-navigation-menu__list', className)} />; });

export const NavigationMenuItem = React.forwardRef(function NavigationMenuItem({ value, className, children, ...props }, ref) {
  const id = React.useId();
  const itemValue = value || id;
  return <NavigationItemContext.Provider value={itemValue}><li {...props} ref={ref} data-slot="navigation-menu-item" data-value={itemValue} className={join('ef-navigation-menu__item', className)}>{children}</li></NavigationItemContext.Provider>;
});

export const NavigationMenuTrigger = React.forwardRef(function NavigationMenuTrigger({ className, children, onClick, onMouseEnter, onFocus, onKeyDown, disabled, ...props }, forwardedRef) {
  const root = React.useContext(NavigationRootContext);
  const itemValue = React.useContext(NavigationItemContext);
  const localRef = React.useRef(null);
  const open = root?.value === itemValue;
  React.useEffect(() => { root?.setTabStop(current => current ?? itemValue); }, [root?.setTabStop, itemValue]);
  useIsoLayoutEffect(() => { if (open) root?.updateIndicator(localRef.current); }, [open, root?.updateIndicator]);
  const keyboard = event => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      root?.openItem(itemValue, localRef.current, true);
      requestAnimationFrame(() => root?.viewportNode?.querySelector('a,button,[tabindex]:not([tabindex="-1"])')?.focus());
    } else if ((root?.orientation === 'horizontal' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) || (root?.orientation === 'vertical' && (event.key === 'ArrowUp' || event.key === 'ArrowDown'))) {
      event.preventDefault();
      const visualDelta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
      root?.moveTrigger(itemValue, root.orientation === 'horizontal' && root.direction === 'rtl' ? -visualDelta : visualDelta, !!root.value);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      root?.setValue('');
    }
  };
  const focus = event => { root?.setTabStop(itemValue); onFocus?.(event); };
  return <button {...props} ref={mergeRefs(forwardedRef, localRef)} type="button" disabled={disabled} data-slot="navigation-menu-trigger" data-item-value={itemValue} data-state={open ? 'open' : 'closed'} aria-expanded={open} aria-haspopup="true" tabIndex={root?.tabStop === null || root?.tabStop === itemValue ? 0 : -1} className={join(navigationMenuTriggerStyle(), className)} onClick={compose(onClick, () => root?.openItem(open ? '' : itemValue, localRef.current, true))} onMouseEnter={compose(onMouseEnter, () => root?.openItem(itemValue, localRef.current))} onFocus={focus} onKeyDown={keyboard}>{children}<span className="ef-navigation-menu__chevron" aria-hidden="true"><Icon name="chevron-down" size={13} /></span></button>;
});

export const NavigationMenuContent = React.forwardRef(function NavigationMenuContent({ className, forceMount = false, children, onKeyDown, ...props }, ref) {
  const root = React.useContext(NavigationRootContext);
  const itemValue = React.useContext(NavigationItemContext);
  const open = root?.value === itemValue;
  const keyboard = event => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && event.key === 'Escape') {
      event.preventDefault();
      root?.setValue('');
      root?.focusTrigger(itemValue);
    }
  };
  if (!open && !forceMount) return null;
  const content = <div {...props} ref={ref} data-slot="navigation-menu-content" data-state={open ? 'open' : 'closed'} hidden={!open} className={join('ef-navigation-menu__content', className)} onKeyDown={keyboard}>{children}</div>;
  return root?.viewport ? (root.viewportNode ? ReactDOM.createPortal(content, root.viewportNode) : null) : content;
});

export const NavigationMenuLink = React.forwardRef(function NavigationMenuLink({ asChild = false, active = false, className, children, onClick, ...props }, ref) {
  const root = React.useContext(NavigationRootContext);
  const common = { ...props, ref, 'data-slot': 'navigation-menu-link', 'data-active': active ? 'true' : undefined, className: join('ef-navigation-menu__link', className), onClick: compose(onClick, () => root?.setValue('')) };
  if (asChild && React.isValidElement(children)) return React.cloneElement(children, { ...common, ...children.props, ref: mergeRefs(ref, children.ref), className: join('ef-navigation-menu__link', className, children.props.className), onClick: compose(children.props.onClick, common.onClick) });
  return <a {...common}>{children}</a>;
});

export const NavigationMenuIndicator = React.forwardRef(function NavigationMenuIndicator({ className, style, ...props }, ref) {
  const root = React.useContext(NavigationRootContext);
  if (!root?.value) return null;
  return <div {...props} ref={ref} data-slot="navigation-menu-indicator" data-state="visible" className={join('ef-navigation-menu__indicator', className)} style={{ ...style, insetInlineStart: root.indicator.start, width: root.indicator.width }}><div className="ef-navigation-menu__indicator-mark" /></div>;
});

export const NavigationMenuViewport = React.forwardRef(function NavigationMenuViewport({ className, ...props }, ref) {
  const root = React.useContext(NavigationRootContext);
  const setNode = React.useCallback(node => {
    root?.setViewportNode(current => current === node ? current : node);
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [root?.setViewportNode, ref]);
  if (!root?.value) return null;
  return <div className="ef-navigation-menu__viewport-wrap"><div {...props} ref={setNode} data-slot="navigation-menu-viewport" data-state="open" className={join('ef-navigation-menu__viewport', className)} /></div>;
});
