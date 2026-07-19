import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
import { Portal, useAnchoredStyle } from './Portal.jsx';
const CSS = `
.ef-menu{position:relative;display:inline-flex}
.ef-menu__panel{position:absolute;top:calc(100% + 6px);min-width:190px;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:4px;z-index:var(--z-dropdown);animation:ef-menu-in var(--dur-fast) var(--ease-out)}
.ef-menu__panel--left{left:0}
.ef-menu__panel--right{right:0}
@keyframes ef-menu-in{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:translateY(0)}}
.ef-menu__item{display:flex;align-items:center;gap:9px;width:100%;height:32px;padding:0 10px;border:none;border-radius:var(--radius-sm);background:none;cursor:pointer;text-align:left;font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-primary);transition:background var(--dur-fast) var(--ease-out)}
.ef-menu__item:hover:not(:disabled){background:var(--surface-sunken)}
.ef-menu__item:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-menu__item:disabled{opacity:.4;cursor:not-allowed}
.ef-menu__item--danger{color:var(--danger-600)}
.ef-menu__item__icon{color:var(--text-muted);display:inline-flex}
.ef-menu__item--danger .ef-menu__item__icon{color:var(--danger-600)}
.ef-menu__sep{height:1px;background:var(--border-default);margin:4px 6px}
.ef-menu__kbd{margin-left:auto;font-family:var(--font-mono);font-size:11px;color:var(--text-muted)}
`;
export function Menu({ trigger, items, onSelect, align = 'left', style, className, ...rest }) {
  injectEfCss('ef-css-menu', CSS);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const panelRef = React.useRef(null);
  const { style: anchored } = useAnchoredStyle(ref, panelRef, { open, placement: 'bottom', align: align === 'right' ? 'end' : 'start' });
  const focusItem = which => {
    const panel = panelRef.current;
    const nodes = panel ? Array.from(panel.querySelectorAll('[role="menuitem"]:not(:disabled)')) : [];
    if (!nodes.length) return;
    const i = nodes.indexOf(document.activeElement);
    const next = which === 'first' ? 0 : which === 'last' ? nodes.length - 1 : (i + which + nodes.length) % nodes.length;
    nodes[next].focus();
  };
  const restoreFocus = () => {
    const t = ref.current && ref.current.querySelector('button,[href],[tabindex]');
    if (t) t.focus();
  };
  const close = restore => { setOpen(false); if (restore) restoreFocus(); };
  React.useEffect(() => {
    if (!open) return;
    focusItem('first');
    // the panel is portaled, so "outside" means outside the trigger AND the panel
    const away = e => {
      const inTrigger = ref.current && ref.current.contains(e.target);
      const inPanel = panelRef.current && panelRef.current.contains(e.target);
      if (!inTrigger && !inPanel) setOpen(false);
    };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);
  const onTriggerKey = e => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); }
    else if (e.key === 'Escape' && open) close(true);
  };
  const triggerProps = {
    onClick: e => { if (React.isValidElement(trigger) && trigger.props.onClick) trigger.props.onClick(e); setOpen(o => !o); },
    onKeyDown: onTriggerKey,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
  };
  const onPanelKey = e => {
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusItem(-1); }
    else if (e.key === 'Home') { e.preventDefault(); focusItem('first'); }
    else if (e.key === 'End') { e.preventDefault(); focusItem('last'); }
    else if (e.key === 'Tab') close(false);
    else if (e.key.length === 1 && /\S/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const panel = panelRef.current;
      const nodes = panel ? Array.from(panel.querySelectorAll('[role="menuitem"]:not(:disabled)')) : [];
      const cur = nodes.indexOf(document.activeElement);
      const ch = e.key.toLowerCase();
      for (let k = 1; k <= nodes.length; k++) {
        const n = nodes[(cur + k) % nodes.length];
        if ((n.textContent || '').trim().toLowerCase().startsWith(ch)) { e.preventDefault(); n.focus(); break; }
      }
    }
  };
  return (
    <span {...rest} ref={ref} className={`ef-menu${className ? ' ' + className : ''}`} style={style}>
      {React.isValidElement(trigger)
        ? React.cloneElement(trigger, triggerProps)
        : <span role="button" tabIndex={0} style={{ display: 'inline-flex' }} {...triggerProps}>{trigger}</span>}
      {open && (
        <Portal>
        <div role="menu" ref={panelRef} onKeyDown={onPanelKey} style={anchored}
          className={`ef-menu__panel ef-menu__panel--${align}`}>
          {items.map((it, i) => it === 'separator'
            ? <div key={'s' + i} className="ef-menu__sep"></div>
            : (
              <button key={it.id} role="menuitem" disabled={it.disabled} className={`ef-menu__item${it.danger ? ' ef-menu__item--danger' : ''}`}
                onClick={() => { close(true); if (onSelect) onSelect(it.id); if (it.onClick) it.onClick(); }}>
                {it.icon ? <span className="ef-menu__item__icon"><Icon name={it.icon} size={15} /></span> : null}
                {it.label}
                {it.kbd ? <span className="ef-menu__kbd">{it.kbd}</span> : null}
              </button>
            ))}
        </div>
        </Portal>
      )}
    </span>
  );
}
