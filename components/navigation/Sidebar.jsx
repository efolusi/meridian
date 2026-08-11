import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss, mergeRefs } from '../forms/Button.jsx';

const CSS = `
.ef-sidebar-provider{--sidebar-width:16rem;--sidebar-width-icon:3rem;position:relative;display:flex;min-height:100%;width:100%;background:var(--surface-page);color:var(--text-primary)}
.ef-sidebar{position:relative;flex:0 0 var(--sidebar-width);width:var(--sidebar-width);min-height:100%;transition:flex-basis var(--dur-med) var(--ease-out),width var(--dur-med) var(--ease-out)}
.ef-sidebar__panel{position:absolute;inset-block:0;inset-inline-start:0;z-index:30;display:flex;width:var(--sidebar-width);flex-direction:column;border-inline-end:1px solid var(--border-default);background:var(--surface-card);color:var(--text-primary);transition:width var(--dur-med) var(--ease-out),transform var(--dur-med) var(--ease-out)}
.ef-sidebar[data-side=right] .ef-sidebar__panel{inset-inline-start:auto;inset-inline-end:0;border-inline-end:0;border-inline-start:1px solid var(--border-default)}
.ef-sidebar[data-variant=floating] .ef-sidebar__panel{inset-block:8px;border:1px solid var(--border-default);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm)}
.ef-sidebar[data-side=left][data-variant=floating] .ef-sidebar__panel{inset-inline-start:8px}.ef-sidebar[data-side=right][data-variant=floating] .ef-sidebar__panel{inset-inline-end:8px}
.ef-sidebar[data-state=collapsed][data-collapsible=offcanvas]{flex-basis:0;width:0}.ef-sidebar[data-state=collapsed][data-collapsible=offcanvas] .ef-sidebar__panel{transform:translateX(calc(-100% - 10px))}
[dir=rtl] .ef-sidebar[data-state=collapsed][data-collapsible=offcanvas] .ef-sidebar__panel,.ef-sidebar[data-side=right][data-state=collapsed][data-collapsible=offcanvas] .ef-sidebar__panel{transform:translateX(calc(100% + 10px))}
[dir=rtl] .ef-sidebar[data-side=right][data-state=collapsed][data-collapsible=offcanvas] .ef-sidebar__panel{transform:translateX(calc(-100% - 10px))}
.ef-sidebar[data-state=collapsed][data-collapsible=icon]{flex-basis:var(--sidebar-width-icon);width:var(--sidebar-width-icon)}.ef-sidebar[data-state=collapsed][data-collapsible=icon] .ef-sidebar__panel{width:var(--sidebar-width-icon)}
.ef-sidebar[data-state=collapsed][data-collapsible=icon] .ef-sidebar__collapse-hide{display:none}.ef-sidebar[data-state=collapsed][data-collapsible=icon] .ef-sidebar-menu-button{justify-content:center;padding-inline:0}.ef-sidebar[data-state=collapsed][data-collapsible=icon] .ef-sidebar-menu-button>span:not(.ef-sidebar-menu-button__icon){display:none}
.ef-sidebar[data-state=collapsed][data-collapsible=icon] .ef-sidebar-input,.ef-sidebar[data-state=collapsed][data-collapsible=icon] .ef-sidebar-menu-action,.ef-sidebar[data-state=collapsed][data-collapsible=icon] .ef-sidebar-menu-badge,.ef-sidebar[data-state=collapsed][data-collapsible=icon] .ef-sidebar-menu-sub{display:none}
.ef-sidebar-header,.ef-sidebar-footer{display:flex;flex-direction:column;gap:8px;padding:8px}.ef-sidebar-content{display:flex;min-height:0;flex:1;flex-direction:column;gap:8px;overflow:auto;overscroll-behavior:contain}
.ef-sidebar-group{position:relative;display:flex;min-width:0;flex-direction:column;padding:8px}.ef-sidebar-group-label{display:flex;height:32px;align-items:center;padding-inline:8px;color:var(--text-muted);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.ef-sidebar-group-action{position:absolute;inset-block-start:12px;inset-inline-end:12px;display:inline-flex;width:24px;height:24px;align-items:center;justify-content:center;border:0;border-radius:var(--radius-sm);background:transparent;color:var(--text-secondary);cursor:pointer}.ef-sidebar-group-action:hover{background:var(--surface-sunken);color:var(--text-primary)}
.ef-sidebar-group-content{width:100%;font-size:var(--text-sm)}.ef-sidebar-menu,.ef-sidebar-menu-sub{display:flex;min-width:0;flex-direction:column;gap:2px;margin:0;padding:0;list-style:none}.ef-sidebar-menu-item,.ef-sidebar-menu-sub-item{position:relative;min-width:0}
.ef-sidebar-menu-button,.ef-sidebar-menu-sub-button{display:flex;width:100%;min-width:0;align-items:center;gap:8px;border:0;border-radius:var(--radius-sm);background:transparent;color:var(--text-secondary);font:inherit;text-align:start;text-decoration:none;cursor:pointer}.ef-sidebar-menu-button{height:32px;padding-inline:8px}.ef-sidebar-menu-button[data-size=sm]{height:28px;font-size:var(--text-xs)}.ef-sidebar-menu-button[data-size=lg]{height:40px}.ef-sidebar-menu-button:hover,.ef-sidebar-menu-sub-button:hover,.ef-sidebar-menu-button[data-active=true],.ef-sidebar-menu-sub-button[data-active=true]{background:var(--surface-sunken);color:var(--text-primary);text-decoration:none}.ef-sidebar-menu-button:focus-visible,.ef-sidebar-menu-sub-button:focus-visible,.ef-sidebar-group-action:focus-visible,.ef-sidebar-trigger:focus-visible,.ef-sidebar-rail:focus-visible{outline:0;box-shadow:var(--focus-ring)}
.ef-sidebar-menu-button__icon{display:inline-flex;flex:0 0 auto}.ef-sidebar-menu-action{position:absolute;inset-block-start:4px;inset-inline-end:4px;display:inline-flex;width:24px;height:24px;align-items:center;justify-content:center;border:0;border-radius:var(--radius-sm);background:transparent;color:var(--text-muted);cursor:pointer}.ef-sidebar-menu-action:hover{background:var(--surface-raised);color:var(--text-primary)}
.ef-sidebar-menu-action[data-show-on-hover=true]{opacity:0}.ef-sidebar-menu-item:hover>.ef-sidebar-menu-action[data-show-on-hover=true],.ef-sidebar-menu-action[data-show-on-hover=true]:focus-visible{opacity:1}
.ef-sidebar-menu-badge{position:absolute;inset-block-start:7px;inset-inline-end:8px;min-width:20px;padding-inline:5px;border-radius:var(--radius-full);background:var(--surface-sunken);color:var(--text-muted);font-size:10px;line-height:18px;text-align:center;pointer-events:none}
.ef-sidebar-menu-sub{margin-inline-start:15px;padding:3px 0 3px 12px;border-inline-start:1px solid var(--border-default)}.ef-sidebar-menu-sub-button{min-height:28px;padding:5px 8px;font-size:var(--text-xs)}
.ef-sidebar-input{width:100%;height:32px;padding-inline:10px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-sunken);color:var(--text-primary);font:inherit;font-size:var(--text-sm)}.ef-sidebar-input:focus-visible{outline:0;box-shadow:var(--focus-ring)}
.ef-sidebar-separator{height:1px;margin:4px 8px;border:0;background:var(--border-default)}.ef-sidebar-skeleton{height:32px;border-radius:var(--radius-sm);background:var(--surface-sunken)}
.ef-sidebar-inset{position:relative;display:flex;min-width:0;flex:1;flex-direction:column;background:var(--surface-page)}.ef-sidebar-trigger{display:inline-flex;width:32px;height:32px;align-items:center;justify-content:center;border:0;border-radius:var(--radius-sm);background:transparent;color:var(--text-secondary);cursor:pointer}.ef-sidebar-trigger:hover{background:var(--surface-sunken);color:var(--text-primary)}
.ef-sidebar-rail{position:absolute;inset-block:0;inset-inline-end:-6px;z-index:40;width:12px;border:0;background:transparent;cursor:ew-resize}.ef-sidebar-rail:hover:after{content:"";position:absolute;inset-block:0;inset-inline-start:5px;width:2px;background:var(--border-strong)}
.ef-sidebar[data-side=right] .ef-sidebar-rail{inset-inline-end:auto;inset-inline-start:-6px}
.ef-sidebar-mobile-backdrop{position:fixed;inset:0;z-index:49;background:var(--overlay-backdrop)}.ef-sidebar-mobile{position:fixed;inset-block:0;z-index:50;display:flex;width:min(var(--sidebar-width),calc(100vw - 48px));flex-direction:column;background:var(--surface-card);box-shadow:var(--shadow-lg)}.ef-sidebar-mobile[data-side=left]{inset-inline-start:0}.ef-sidebar-mobile[data-side=right]{inset-inline-end:0}
@media(max-width:767px){.ef-sidebar:not([data-collapsible=none]){display:none}.ef-sidebar-provider{min-height:100%}}
@media(min-width:768px){.ef-sidebar-mobile-backdrop,.ef-sidebar-mobile{display:none}}
@media(prefers-reduced-motion:reduce){.ef-sidebar,.ef-sidebar__panel{transition:none}}
`;

const SidebarContext = React.createContext(null);
const join = (...parts) => parts.filter(Boolean).join(' ');

function compose(render, fallback, props, ref, children) {
  if (React.isValidElement(render)) return React.cloneElement(render, { ...props, ...render.props, ref: mergeRefs(ref, render.ref), className: join(props.className, render.props.className), children: render.props.children ?? children });
  return React.createElement(fallback, { ...props, ref }, children);
}

export function useSidebar() {
  const value = React.useContext(SidebarContext);
  if (!value) throw new Error('useSidebar must be used within SidebarProvider.');
  return value;
}

export const SidebarProvider = React.forwardRef(function SidebarProvider({ defaultOpen = true, open: controlledOpen, onOpenChange, style, className, children, ...props }, ref) {
  injectEfCss('ef-css-sidebar', CSS);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = React.useCallback((next) => {
    const value = typeof next === 'function' ? next(open) : next;
    if (controlledOpen === undefined) setInternalOpen(value);
    onOpenChange?.(value);
  }, [controlledOpen, onOpenChange, open]);
  const toggleSidebar = React.useCallback(() => isMobile ? setOpenMobile(value => !value) : setOpen(value => !value), [isMobile, setOpen]);
  React.useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(query.matches);
    update(); query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  React.useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape' && openMobile) { event.preventDefault(); setOpenMobile(false); }
      if (event.key.toLowerCase() === 'b' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); toggleSidebar(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openMobile, toggleSidebar]);
  const context = React.useMemo(() => ({ state: open ? 'expanded' : 'collapsed', open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }), [open, setOpen, openMobile, isMobile, toggleSidebar]);
  return <SidebarContext.Provider value={context}><div {...props} ref={ref} data-slot="sidebar-wrapper" style={{ '--sidebar-width': '16rem', '--sidebar-width-icon': '3rem', ...style }} className={join('ef-sidebar-provider', className)}>{children}</div></SidebarContext.Provider>;
});

export const Sidebar = React.forwardRef(function Sidebar({ side = 'left', variant = 'sidebar', collapsible = 'offcanvas', dir, className, children, ...props }, ref) {
  const context = useSidebar();
  const common = { 'data-side': side, 'data-variant': variant, 'data-collapsible': collapsible, 'data-state': context.state };
  return <>
    <aside {...props} {...common} ref={ref} dir={dir} data-slot="sidebar" className={join('ef-sidebar', className)}><div data-slot="sidebar-container" className="ef-sidebar__panel">{children}</div></aside>
    {context.openMobile ? <><button type="button" className="ef-sidebar-mobile-backdrop" aria-label="Close sidebar" onClick={() => context.setOpenMobile(false)} /><aside {...common} dir={dir} data-mobile="true" className="ef-sidebar-mobile">{children}</aside></> : null}
  </>;
});

export const SidebarTrigger = React.forwardRef(function SidebarTrigger({ render, className, onClick, children, ...props }, ref) { const context = useSidebar(); const click = event => { onClick?.(event); if (!event.defaultPrevented) context.toggleSidebar(); }; return compose(render, 'button', { ...props, type: render ? undefined : 'button', 'data-slot': 'sidebar-trigger', 'aria-label': props['aria-label'] || 'Toggle sidebar', 'aria-expanded': context.isMobile ? context.openMobile : context.open, className: join('ef-sidebar-trigger', className), onClick: click }, ref, children || <Icon name="panel-left" size={18} />); });
export const SidebarRail = React.forwardRef(function SidebarRail({ className, onClick, ...props }, ref) { const context = useSidebar(); return <button {...props} ref={ref} type="button" data-slot="sidebar-rail" aria-label={props['aria-label'] || 'Toggle sidebar'} tabIndex={-1} className={join('ef-sidebar-rail', className)} onClick={event => { onClick?.(event); if (!event.defaultPrevented) context.toggleSidebar(); }} />; });

function region(name, tag, base) { return React.forwardRef(function SidebarRegion({ className, ...props }, ref) { return React.createElement(tag, { ...props, ref, 'data-slot': name, className: join(base, className) }); }); }
export const SidebarInset = region('sidebar-inset', 'main', 'ef-sidebar-inset');
export const SidebarHeader = region('sidebar-header', 'div', 'ef-sidebar-header');
export const SidebarFooter = region('sidebar-footer', 'div', 'ef-sidebar-footer');
export const SidebarContent = region('sidebar-content', 'div', 'ef-sidebar-content');
export const SidebarGroup = region('sidebar-group', 'div', 'ef-sidebar-group');
export const SidebarGroupContent = region('sidebar-group-content', 'div', 'ef-sidebar-group-content');
export const SidebarMenu = region('sidebar-menu', 'ul', 'ef-sidebar-menu');
export const SidebarMenuItem = region('sidebar-menu-item', 'li', 'ef-sidebar-menu-item');
export const SidebarMenuSub = region('sidebar-menu-sub', 'ul', 'ef-sidebar-menu-sub');
export const SidebarMenuSubItem = region('sidebar-menu-sub-item', 'li', 'ef-sidebar-menu-sub-item');

export const SidebarInput = React.forwardRef(function SidebarInput({ className, ...props }, ref) { return <input {...props} ref={ref} data-slot="sidebar-input" className={join('ef-sidebar-input', className)} />; });
export const SidebarSeparator = React.forwardRef(function SidebarSeparator({ className, ...props }, ref) { return <hr {...props} ref={ref} data-slot="sidebar-separator" className={join('ef-sidebar-separator', className)} />; });
export const SidebarGroupLabel = React.forwardRef(function SidebarGroupLabel({ render, className, children, ...props }, ref) { return compose(render, 'div', { ...props, 'data-slot': 'sidebar-group-label', className: join('ef-sidebar-group-label', 'ef-sidebar__collapse-hide', className) }, ref, children); });
export const SidebarGroupAction = React.forwardRef(function SidebarGroupAction({ render, className, children, ...props }, ref) { return compose(render, 'button', { ...props, type: render ? undefined : 'button', 'data-slot': 'sidebar-group-action', className: join('ef-sidebar-group-action', 'ef-sidebar__collapse-hide', className) }, ref, children); });

export const SidebarMenuButton = React.forwardRef(function SidebarMenuButton({ render, href, isActive = false, size = 'default', tooltip, className, children, ...props }, ref) { const fallback = href ? 'a' : 'button'; const label = tooltip && typeof tooltip === 'string' ? tooltip : undefined; return compose(render, fallback, { ...props, href, type: fallback === 'button' && !render ? 'button' : undefined, title: props.title || label, 'aria-current': props['aria-current'] || (href && isActive ? 'page' : undefined), 'data-slot': 'sidebar-menu-button', 'data-active': isActive ? 'true' : 'false', 'data-size': size, className: join('ef-sidebar-menu-button', className) }, ref, children); });
export const SidebarMenuAction = React.forwardRef(function SidebarMenuAction({ render, showOnHover = false, className, children, ...props }, ref) { return compose(render, 'button', { ...props, type: render ? undefined : 'button', 'data-slot': 'sidebar-menu-action', 'data-show-on-hover': showOnHover ? 'true' : 'false', className: join('ef-sidebar-menu-action', className) }, ref, children); });
export const SidebarMenuBadge = region('sidebar-menu-badge', 'span', 'ef-sidebar-menu-badge');
export const SidebarMenuSubButton = React.forwardRef(function SidebarMenuSubButton({ render, href, isActive = false, size = 'md', className, children, ...props }, ref) { const fallback = href ? 'a' : 'button'; return compose(render, fallback, { ...props, href, type: fallback === 'button' && !render ? 'button' : undefined, 'data-slot': 'sidebar-menu-sub-button', 'data-active': isActive ? 'true' : 'false', 'data-size': size, className: join('ef-sidebar-menu-sub-button', className) }, ref, children); });
export const SidebarMenuSkeleton = React.forwardRef(function SidebarMenuSkeleton({ showIcon = false, className, ...props }, ref) { return <div {...props} ref={ref} data-slot="sidebar-menu-skeleton" aria-hidden="true" className={join('ef-sidebar-skeleton', className)} style={{ width: props.style?.width || (showIcon ? '84%' : '72%'), ...props.style }} />; });
