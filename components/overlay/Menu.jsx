import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-menu{position:relative;display:inline-flex}
.ef-menu__panel{position:absolute;top:calc(100% + 6px);min-width:190px;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:4px;z-index:80;animation:ef-menu-in var(--dur-fast) var(--ease-out)}
.ef-menu__panel--left{left:0}
.ef-menu__panel--right{right:0}
@keyframes ef-menu-in{from{opacity:0;transform:translateY(-3px)}}
.ef-menu__item{display:flex;align-items:center;gap:9px;width:100%;height:32px;padding:0 10px;border:none;border-radius:var(--radius-sm);background:none;cursor:pointer;text-align:left;font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-primary);transition:background var(--dur-fast) var(--ease-out)}
.ef-menu__item:hover:not(:disabled){background:var(--surface-sunken)}
.ef-menu__item:disabled{opacity:.4;cursor:not-allowed}
.ef-menu__item--danger{color:var(--danger-600)}
.ef-menu__item__icon{color:var(--text-muted);display:inline-flex}
.ef-menu__item--danger .ef-menu__item__icon{color:var(--danger-600)}
.ef-menu__sep{height:1px;background:var(--border-default);margin:4px 6px}
.ef-menu__kbd{margin-left:auto;font-family:var(--font-mono);font-size:11px;color:var(--text-muted)}
`;
export function Menu({ trigger, items, onSelect, align = 'left', style, className }) {
  injectEfCss('ef-css-menu', CSS);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const away = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const key = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <span ref={ref} className={`ef-menu${className ? ' ' + className : ''}`} style={style}>
      <span style={{ display: 'inline-flex' }} onClick={() => setOpen(o => !o)}>{trigger}</span>
      {open && (
        <div role="menu" className={`ef-menu__panel ef-menu__panel--${align}`}>
          {items.map((it, i) => it === 'separator'
            ? <div key={'s' + i} className="ef-menu__sep"></div>
            : (
              <button key={it.id} role="menuitem" disabled={it.disabled} className={`ef-menu__item${it.danger ? ' ef-menu__item--danger' : ''}`}
                onClick={() => { setOpen(false); if (onSelect) onSelect(it.id); if (it.onClick) it.onClick(); }}>
                {it.icon ? <span className="ef-menu__item__icon"><Icon name={it.icon} size={15} /></span> : null}
                {it.label}
                {it.kbd ? <span className="ef-menu__kbd">{it.kbd}</span> : null}
              </button>
            ))}
        </div>
      )}
    </span>
  );
}
