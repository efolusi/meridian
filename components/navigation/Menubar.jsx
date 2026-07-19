import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-menubar{display:inline-flex;gap:2px;padding:2px;border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--surface-card)}
.ef-menubar__wrap{position:relative}
.ef-menubar__btn{height:28px;padding:0 10px;border:none;border-radius:calc(var(--radius-sm) - 1px);background:none;cursor:pointer;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:500;color:var(--text-primary);transition:background var(--dur-fast) var(--ease-out)}
.ef-menubar__btn:hover,.ef-menubar__btn--on{background:var(--surface-sunken)}
.ef-menubar__btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-menubar__panel{position:absolute;top:calc(100% + 6px);left:0;min-width:200px;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:4px;z-index:var(--z-dropdown);animation:ef-menubar-in var(--dur-fast) var(--ease-out)}
@keyframes ef-menubar-in{from{opacity:0;transform:translateY(-3px)}}
.ef-menubar__item{display:flex;align-items:center;gap:9px;width:100%;height:32px;padding:0 10px;border:none;border-radius:var(--radius-sm);background:none;cursor:pointer;text-align:left;font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-primary);transition:background var(--dur-fast) var(--ease-out)}
.ef-menubar__item:hover:not(:disabled){background:var(--surface-sunken)}
.ef-menubar__item:disabled{opacity:.4;cursor:not-allowed}
.ef-menubar__item--danger{color:var(--danger-600)}
.ef-menubar__item__icon{color:var(--text-muted);display:inline-flex}
.ef-menubar__item--danger .ef-menubar__item__icon{color:var(--danger-600)}
.ef-menubar__sep{height:1px;background:var(--border-default);margin:4px 6px}
.ef-menubar__kbd{margin-left:auto;font-family:var(--font-mono);font-size:11px;color:var(--text-muted)}
`;
export function Menubar({ menus, onSelect, style, className, ...rest }) {
  injectEfCss('ef-css-menubar', CSS);
  const [open, setOpen] = React.useState(null);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (open === null) return;
    const away = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(null); };
    const key = e => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', key); };
  }, [open]);
  const kbdOpen = React.useRef(false);
  React.useEffect(() => {
    if (open === null || !kbdOpen.current) return;
    const panel = ref.current && ref.current.querySelector('.ef-menubar__panel');
    const first = panel && panel.querySelector('[role="menuitem"]:not(:disabled)');
    if (first) first.focus();
    kbdOpen.current = false;
  }, [open]);
  const btns = () => (ref.current ? Array.from(ref.current.querySelectorAll('.ef-menubar__btn')) : []);
  const focusBtn = i => { const b = btns(); const t = b[(i + b.length) % b.length]; if (t) t.focus(); };
  const panelItems = () => { const p = ref.current && ref.current.querySelector('.ef-menubar__panel'); return p ? Array.from(p.querySelectorAll('[role="menuitem"]:not(:disabled)')) : []; };
  const focusItem = which => { const nodes = panelItems(); if (!nodes.length) return; const i = nodes.indexOf(document.activeElement); const n = which === 'first' ? 0 : which === 'last' ? nodes.length - 1 : (i + which + nodes.length) % nodes.length; nodes[n].focus(); };
  const typeahead = e => {
    const nodes = panelItems(), cur = nodes.indexOf(document.activeElement), ch = e.key.toLowerCase();
    for (let k = 1; k <= nodes.length; k++) { const n = nodes[(cur + k) % nodes.length]; if ((n.textContent || '').trim().toLowerCase().startsWith(ch)) { e.preventDefault(); n.focus(); break; } }
  };
  const onBtnKey = (e, i) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); if (open !== null) { kbdOpen.current = true; setOpen((i + 1) % menus.length); } focusBtn(i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (open !== null) { kbdOpen.current = true; setOpen((i - 1 + menus.length) % menus.length); } focusBtn(i - 1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); kbdOpen.current = true; setOpen(i); }
  };
  const onPanelKey = (e, i) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); focusItem(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusItem(-1); }
    else if (e.key === 'Home') { e.preventDefault(); focusItem('first'); }
    else if (e.key === 'End') { e.preventDefault(); focusItem('last'); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); kbdOpen.current = true; setOpen((i + 1) % menus.length); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); kbdOpen.current = true; setOpen((i - 1 + menus.length) % menus.length); }
    else if (e.key.length === 1 && /\S/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) typeahead(e);
  };
  return (
    <div {...rest} ref={ref} role="menubar" className={`ef-menubar${className ? ' ' + className : ''}`} style={style}>
      {menus.map((m, i) => (
        <span key={m.label} className="ef-menubar__wrap">
          <button type="button" aria-haspopup="menu" aria-expanded={open === i} className={`ef-menubar__btn${open === i ? ' ef-menubar__btn--on' : ''}`}
            onKeyDown={e => onBtnKey(e, i)}
            onClick={() => setOpen(open === i ? null : i)} onMouseEnter={() => { if (open !== null) setOpen(i); }}>{m.label}</button>
          {open === i ? (
            <div role="menu" className="ef-menubar__panel" onKeyDown={e => onPanelKey(e, i)}>
              {m.items.map((it, j) => it === 'separator'
                ? <div key={'s' + j} className="ef-menubar__sep"></div>
                : (
                  <button key={it.id} type="button" role="menuitem" disabled={it.disabled} className={`ef-menubar__item${it.danger ? ' ef-menubar__item--danger' : ''}`}
                    onClick={() => { setOpen(null); if (onSelect) onSelect(it.id); if (it.onClick) it.onClick(); }}>
                    {it.icon ? <span className="ef-menubar__item__icon"><Icon name={it.icon} size={15} /></span> : null}
                    {it.label}
                    {it.kbd ? <span className="ef-menubar__kbd">{it.kbd}</span> : null}
                  </button>
                ))}
            </div>
          ) : null}
        </span>
      ))}
    </div>
  );
}
