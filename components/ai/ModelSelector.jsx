import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Portal, useAnchoredStyle } from '../overlay/Portal.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-modelsel{position:relative;display:inline-flex}
.ef-modelsel__btn{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 10px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);cursor:pointer;font-family:var(--font-sans);font-size:13px;font-weight:500;color:var(--text-primary);transition:border-color var(--dur-fast) var(--ease-out)}
.ef-modelsel__btn:hover{border-color:var(--text-muted)}
.ef-modelsel__btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-modelsel__provider{font-size:11.5px;color:var(--text-muted);font-weight:400}
.ef-modelsel__chev{display:inline-flex;color:var(--text-muted)}
.ef-modelsel__panel{position:absolute;bottom:calc(100% + 6px);left:0;min-width:260px;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:4px;z-index:var(--z-dropdown);animation:ef-modelsel-in var(--dur-fast) var(--ease-out)}
.ef-modelsel--down .ef-modelsel__panel{bottom:auto;top:calc(100% + 6px)}
@keyframes ef-modelsel-in{from{opacity:0;transform:translateY(3px)}}
.ef-modelsel__item{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;border:none;border-radius:var(--radius-sm);background:none;cursor:pointer;text-align:left;font-family:var(--font-sans);transition:background var(--dur-fast) var(--ease-out)}
.ef-modelsel__item:hover{background:var(--surface-sunken)}
.ef-modelsel__item:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-modelsel__name{font-size:13.5px;font-weight:500;color:var(--text-primary)}
.ef-modelsel__hint{font-size:12px;color:var(--text-muted);margin-top:1px}
.ef-modelsel__badge{margin-left:auto;flex:none;font-size:10.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-700);background:var(--accent-subtle);border-radius:var(--radius-sm);padding:2px 6px}
.ef-modelsel__check{margin-left:auto;flex:none;display:inline-flex;color:var(--brand-700)}
.ef-modelsel__badge+.ef-modelsel__check{margin-left:8px}
`;
export function ModelSelector({ models = [], value, onChange, side = 'up', style, className, ...rest }) {
  injectEfCss('ef-css-modelsel', CSS);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const panelRef = React.useRef(null);
  const { style: anchored } = useAnchoredStyle(ref, panelRef, { open, placement: side === 'down' ? 'bottom' : 'top', align: 'start' });
  React.useEffect(() => {
    if (!open) return;
    const away = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const key = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', key); };
  }, [open]);
  const cur = models.find(m => m.id === value) || models[0] || {};
  return (
    <span {...rest} ref={ref} className={`ef-modelsel${side === 'down' ? ' ef-modelsel--down' : ''}${className ? ' ' + className : ''}`} style={style}>
      <button type="button" className="ef-modelsel__btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name="sparkles" size={13} />
        {cur.name || 'Choose model'}
        {cur.provider ? <span className="ef-modelsel__provider">{cur.provider}</span> : null}
        <span className="ef-modelsel__chev"><Icon name={side === 'down' ? 'chevron-down' : 'chevron-up'} size={13} /></span>
      </button>
      {open ? (
        <Portal><div role="listbox" ref={panelRef} className="ef-modelsel__panel" style={anchored}>
          {models.map(m => (
            <button key={m.id} type="button" role="option" aria-selected={m.id === cur.id} className="ef-modelsel__item"
              onClick={() => { setOpen(false); if (onChange) onChange(m.id); }}>
              <span style={{ minWidth: 0 }}>
                <span className="ef-modelsel__name">{m.name}</span>
                {m.hint ? <div className="ef-modelsel__hint">{m.hint}</div> : null}
              </span>
              {m.badge ? <span className="ef-modelsel__badge">{m.badge}</span> : null}
              {m.id === cur.id ? <span className="ef-modelsel__check"><Icon name="check" size={14} /></span> : null}
            </button>
          ))}
        </div></Portal>
      ) : null}
    </span>
  );
}
