import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-ctx__panel{position:fixed;min-width:190px;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:4px;z-index:var(--z-dropdown);animation:ef-ctx-in var(--dur-fast) var(--ease-out)}
@keyframes ef-ctx-in{from{opacity:0;transform:scale(.98)}}
.ef-ctx__item{display:flex;align-items:center;gap:9px;width:100%;height:32px;padding:0 10px;border:none;border-radius:var(--radius-sm);background:none;cursor:pointer;text-align:left;font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-primary);transition:background var(--dur-fast) var(--ease-out)}
.ef-ctx__item:hover:not(:disabled){background:var(--surface-sunken)}
.ef-ctx__item:disabled{opacity:.4;cursor:not-allowed}
.ef-ctx__item--danger{color:var(--danger-600)}
.ef-ctx__item__icon{color:var(--text-muted);display:inline-flex}
.ef-ctx__item--danger .ef-ctx__item__icon{color:var(--danger-600)}
.ef-ctx__sep{height:1px;background:var(--border-default);margin:4px 6px}
.ef-ctx__kbd{margin-left:auto;font-family:var(--font-mono);font-size:11px;color:var(--text-muted)}
`;
export function ContextMenu({ items, onSelect, children, style, className }) {
  injectEfCss('ef-css-ctx', CSS);
  const [pos, setPos] = React.useState(null);
  React.useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const key = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', key);
    window.addEventListener('blur', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', key); window.removeEventListener('blur', close); };
  }, [pos]);
  const openAt = e => {
    e.preventDefault();
    setPos({ x: Math.min(e.clientX, window.innerWidth - 210), y: Math.min(e.clientY, window.innerHeight - 40 * items.length - 20) });
  };
  return (
    <span className={className} style={style} onContextMenu={openAt}>
      {children}
      {pos ? (
        <div role="menu" className="ef-ctx__panel" style={{ left: pos.x, top: pos.y }} onMouseDown={e => e.stopPropagation()}>
          {items.map((it, i) => it === 'separator'
            ? <div key={'s' + i} className="ef-ctx__sep"></div>
            : (
              <button key={it.id} type="button" role="menuitem" disabled={it.disabled} className={`ef-ctx__item${it.danger ? ' ef-ctx__item--danger' : ''}`}
                onClick={() => { setPos(null); if (onSelect) onSelect(it.id); if (it.onClick) it.onClick(); }}>
                {it.icon ? <span className="ef-ctx__item__icon"><Icon name={it.icon} size={15} /></span> : null}
                {it.label}
                {it.kbd ? <span className="ef-ctx__kbd">{it.kbd}</span> : null}
              </button>
            ))}
        </div>
      ) : null}
    </span>
  );
}
