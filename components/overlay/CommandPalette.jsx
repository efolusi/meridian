import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { Kbd } from '../display/Kbd.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-cmdk__overlay{position:fixed;inset:0;background:var(--overlay-scrim);display:flex;justify-content:center;align-items:flex-start;padding:100px 24px 24px;z-index:var(--z-modal);animation:ef-cmdk-fade var(--dur-fast) var(--ease-out)}
@keyframes ef-cmdk-fade{from{opacity:0}}
.ef-cmdk{width:100%;max-width:560px;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-lg);box-shadow:var(--shadow-pop);overflow:hidden;animation:ef-cmdk-in var(--dur-med) var(--ease-out)}
@keyframes ef-cmdk-in{from{opacity:0;transform:translateY(-6px)}}
.ef-cmdk__inputrow{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border-default)}
.ef-cmdk__input{flex:1;border:none;outline:none;background:none;font-family:var(--font-sans);font-size:var(--text-lg);color:var(--text-primary)}
.ef-cmdk__input::placeholder{color:var(--text-muted)}
.ef-cmdk__list{max-height:320px;overflow-y:auto;padding:6px}
.ef-cmdk__group{font-size:10px;font-weight:var(--weight-semibold);letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);padding:10px 10px 4px}
.ef-cmdk__item{display:flex;align-items:center;gap:10px;width:100%;padding:9px 10px;border:none;border-radius:var(--radius-sm);background:none;cursor:pointer;text-align:left;font-family:var(--font-sans);font-size:var(--text-md);color:var(--text-primary)}
.ef-cmdk__item--active{background:var(--surface-sunken)}
.ef-cmdk__item__icon{color:var(--text-muted);display:inline-flex}
.ef-cmdk__item__hint{margin-left:auto;font-size:var(--text-xs);color:var(--text-muted)}
.ef-cmdk__empty{padding:32px;text-align:center;color:var(--text-muted);font-size:var(--text-sm)}
.ef-cmdk__foot{display:flex;align-items:center;gap:14px;padding:9px 14px;border-top:1px solid var(--border-default);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.ef-cmdk__foot span{display:inline-flex;align-items:center;gap:5px}
`;
export function CommandPalette({ open, onClose, groups, onSelect, placeholder = 'Type a command or search…', style, className, ...rest }) {
  injectEfCss('ef-css-cmdk', CSS);
  const [q, setQ] = React.useState('');
  const [idx, setIdx] = React.useState(0);
  const listId = React.useId();
  const prevFocus = React.useRef(null);
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    setQ(''); setIdx(0);
    prevFocus.current = document.activeElement;
    if (inputRef.current) inputRef.current.focus();
    return () => { if (prevFocus.current && prevFocus.current.focus) prevFocus.current.focus(); };
  }, [open]);
  const flat = [];
  const shown = (groups || []).map(g => {
    const items = g.items.filter(it => !q || (it.label + ' ' + (it.hint || '')).toLowerCase().includes(q.toLowerCase()));
    items.forEach(it => flat.push(it));
    return { ...g, items };
  }).filter(g => g.items.length);
  React.useEffect(() => { setIdx(0); }, [q]);
  const flatRef = React.useRef(flat); flatRef.current = flat;
  const idxRef = React.useRef(idx); idxRef.current = idx;
  React.useEffect(() => {
    if (!open) return;
    const key = e => {
      if (e.key === 'Escape') onClose && onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, flatRef.current.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') { const it = flatRef.current[idxRef.current]; if (it) { onSelect && onSelect(it.id); onClose && onClose(); } }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, onClose, onSelect]);
  React.useEffect(() => {
    if (!open) return;
    const el = document.getElementById(listId + '-opt-' + idx);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [open, idx, listId]);
  if (!open) return null;
  return (
    <div {...rest} className={`ef-cmdk__overlay${className ? ' ' + className : ''}`} style={style} onMouseDown={e => { if (e.target === e.currentTarget && onClose) onClose(); }}>
      <div className="ef-cmdk" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="ef-cmdk__inputrow">
          <Icon name="search" size={17} style={{ color: 'var(--text-muted)' }} />
          <input className="ef-cmdk__input" ref={inputRef} placeholder={placeholder} value={q} onChange={e => setQ(e.target.value)}
            role="combobox" aria-expanded="true" aria-controls={listId} aria-autocomplete="list" aria-label={placeholder}
            aria-activedescendant={flat.length ? `${listId}-opt-${idx}` : undefined} />
          <Kbd>Esc</Kbd>
        </div>
        <div className="ef-cmdk__list" role="listbox" id={listId}>
          {shown.length === 0 && <div className="ef-cmdk__empty">Nothing matches "{q}" — try a product or action name.</div>}
          {shown.map(g => (
            <React.Fragment key={g.group}>
              <div className="ef-cmdk__group">{g.group}</div>
              {g.items.map(it => {
                const fi = flat.indexOf(it);
                const active = fi === idx;
                return (
                  <button key={it.id} role="option" id={`${listId}-opt-${fi}`} aria-selected={active}
                    className={`ef-cmdk__item${active ? ' ef-cmdk__item--active' : ''}`}
                    onMouseEnter={() => setIdx(fi)}
                    onClick={() => { onSelect && onSelect(it.id); onClose && onClose(); }}>
                    {it.icon ? <span className="ef-cmdk__item__icon"><Icon name={it.icon} size={16} /></span> : null}
                    {it.label}
                    {it.hint ? <span className="ef-cmdk__item__hint">{it.hint}</span> : null}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div className="ef-cmdk__foot">
          <span><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
          <span><Kbd>↵</Kbd> run</span>
          <span style={{ marginLeft: 'auto' }}><Kbd>⌘</Kbd><Kbd>K</Kbd> anywhere</span>
        </div>
      </div>
    </div>
  );
}
