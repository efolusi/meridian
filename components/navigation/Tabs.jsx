import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
import { useDirection } from '../display/Direction.jsx';
const CSS = `
.ef-tabs{position:relative}.ef-tabs__list{position:relative;display:flex;gap:4px;border-bottom:1px solid var(--border-default)}
.ef-tabs__list[data-orientation="vertical"]{flex-direction:column;border-bottom:0;border-inline-end:1px solid var(--border-default)}
.ef-tabs__tab{position:relative;display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 12px;border:none;background:transparent;color:var(--text-secondary);font-family:var(--font-sans);font-size:var(--text-md);font-weight:var(--weight-medium);cursor:pointer;border-radius:var(--radius-sm) var(--radius-sm) 0 0;transition:color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-tabs__tab:hover{color:var(--text-primary);background:var(--surface-sunken)}
.ef-tabs__tab:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-tabs__tab--active{color:var(--text-primary);font-weight:var(--weight-semibold);background:var(--surface-sunken)}
.ef-tabs__list[data-variant="line"] .ef-tabs__tab{background:transparent}.ef-tabs__list[data-variant="line"] .ef-tabs__tab--active::after{content:'';position:absolute;inset-inline:0;bottom:-1px;height:2px;border-radius:var(--radius-full);background:var(--accent)}
.ef-tabs__ink{position:absolute;bottom:-1px;height:2px;background:var(--accent);border-radius:2px;transition:inset-inline-start var(--dur-med) var(--ease-spring),width var(--dur-med) var(--ease-spring)}
.ef-tabs__count{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.ef-tabs__tab--active .ef-tabs__count{color:var(--text-primary)}
.ef-tabs__content{padding-block:var(--space-4)}
`;
const TabsContext = React.createContext(null);
export const Tabs = React.forwardRef(function Tabs({ items, value: valueProp, defaultValue, onValueChange, onChange, orientation = 'horizontal', children, style, className, ...rest }, fRef) {
  injectEfCss('ef-css-tabs', CSS);
  const uid = React.useId();
  const [inner, setInner] = React.useState(defaultValue != null ? defaultValue : (items && items[0] ? items[0].id : undefined));
  const value = valueProp !== undefined ? valueProp : inner;
  const change = next => { if (valueProp === undefined) setInner(next); if (onValueChange) onValueChange(next); if (onChange) onChange(next); };
  const forwardedRef = typeof fRef === 'function' || (fRef && Object.prototype.hasOwnProperty.call(fRef, 'current')) ? fRef : null;
  if (items) return <Tabs value={value} onValueChange={change} orientation={orientation} className={className} style={style} {...rest} ref={forwardedRef}>
    <TabsList>
      {items.map(it => (
        <TabsTrigger key={it.id} value={it.id}>
          {it.icon ? <Icon name={it.icon} size={16} /> : null}
          {it.label}
          {it.count != null ? <span className="ef-tabs__count">{it.count}</span> : null}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>;
  return <TabsContext.Provider value={{ value, change, orientation, uid }}><div {...rest} ref={forwardedRef} data-slot="tabs" data-orientation={orientation} className={`ef-tabs${className ? ' ' + className : ''}`} style={style}>{children}</div></TabsContext.Provider>;
});

export const TabsList = React.forwardRef(function TabsList({ className, onKeyDown, variant, ...props }, ref) {
  const ctx = React.useContext(TabsContext) || { orientation: 'horizontal' };
  const direction = useDirection();
  const keydown = e => {
    if (onKeyDown) onKeyDown(e);
    if (e.defaultPrevented || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)) return;
    const tabs = [...e.currentTarget.querySelectorAll('[role="tab"]')].filter(x => !x.disabled);
    const focused = tabs.indexOf(document.activeElement);
    const current = focused >= 0 ? focused : tabs.indexOf(e.target);
    let next = current;
    const previous = ctx.orientation === 'vertical' ? e.key === 'ArrowUp' : e.key === (direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft');
    const following = ctx.orientation === 'vertical' ? e.key === 'ArrowDown' : e.key === (direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
    if (previous) next = (current - 1 + tabs.length) % tabs.length;
    if (following) next = (current + 1) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    if (tabs[next]) { e.preventDefault(); tabs[next].focus(); tabs[next].click(); }
  };
  return <div {...props} ref={ref} role="tablist" aria-orientation={ctx.orientation} data-slot="tabs-list" data-orientation={ctx.orientation} data-variant={variant || 'default'} onKeyDown={keydown} className={`ef-tabs__list${className ? ' ' + className : ''}`} />;
});
export const TabsTrigger = React.forwardRef(function TabsTrigger({ value, className, disabled, ...props }, ref) {
  const ctx = React.useContext(TabsContext) || { value: undefined, change: () => {}, uid: 'tabs' }; const active = ctx.value === value;
  return <button {...props} ref={ref} id={`${ctx.uid}-trigger-${value}`} type="button" role="tab" disabled={disabled} aria-selected={active} aria-controls={`${ctx.uid}-content-${value}`} tabIndex={active ? 0 : -1} data-slot="tabs-trigger" data-state={active ? 'active' : 'inactive'} data-active={active ? 'true' : 'false'} className={`ef-tabs__tab${active ? ' ef-tabs__tab--active' : ''}${className ? ' ' + className : ''}`} onClick={e => { if (props.onClick) props.onClick(e); if (!e.defaultPrevented) ctx.change(value); }} />;
});
export const TabsContent = React.forwardRef(function TabsContent({ value, className, forceMount, ...props }, ref) {
  const ctx = React.useContext(TabsContext) || { value: undefined, uid: 'tabs' }; const active = ctx.value === value; if (!active && !forceMount) return null;
  return <div {...props} ref={ref} id={`${ctx.uid}-content-${value}`} role="tabpanel" aria-labelledby={`${ctx.uid}-trigger-${value}`} tabIndex={0} hidden={!active} data-slot="tabs-content" data-state={active ? 'active' : 'inactive'} className={`ef-tabs__content${className ? ' ' + className : ''}`} />;
});
