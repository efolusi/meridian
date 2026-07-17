import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { Kbd } from '../display/Kbd.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-cmdk__overlay{position:fixed;inset:0;background:rgba(31,26,20,.4);display:flex;justify-content:center;align-items:flex-start;padding:100px 24px 24px;z-index:120;animation:ef-cmdk-fade var(--dur-fast) var(--ease-out)}
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
export function CommandPalette({ open, onClose, groups, onSelect, placeholder = 'Type a command or search…' }) {
  injectEfCss('ef-css-cmdk', CSS);
  const [q, setQ] = React.useState('');
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => { if (open) { setQ(''); setIdx(0); } }, [open]);
  const flat = [];
  const shown = (groups || []).map(g => {
    const items = g.items.filter(it => !q || (it.label + ' ' + (it.hint || '')).toLowerCase().includes(q.toLowerCase()));
    items.forEach(it => flat.push(it));
    return { ...g, items };
  }).filter(g => g.items.length);
  React.useEffect(() => { setIdx(0); }, [q]);
  React.useEffect(() => {
    if (!open) return;
    const key = e => {
      if (e.key === 'Escape') onClose && onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, flat.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && flat[idx]) { onSelect && onSelect(flat[idx].id); onClose && onClose(); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  });
  if (!open) return null;
  return (
    <div className="ef-cmdk__overlay" onMouseDown={e => { if (e.target === e.currentTarget && onClose) onClose(); }}>
      <div className="ef-cmdk" role="dialog" aria-modal="true">
        <div className="ef-cmdk__inputrow">
          <Icon name="search" size={17} style={{ color: 'var(--text-muted)' }} />
          <input className="ef-cmdk__input" autoFocus placeholder={placeholder} value={q} onChange={e => setQ(e.target.value)} />
          <Kbd>Esc</Kbd>
        </div>
        <div className="ef-cmdk__list">
          {shown.length === 0 && <div className="ef-cmdk__empty">Nothing matches "{q}" — try a product or action name.</div>}
          {shown.map(g => (
            <React.Fragment key={g.group}>
              <div className="ef-cmdk__group">{g.group}</div>
              {g.items.map(it => {
                const active = flat.indexOf(it) === idx;
                return (
                  <button key={it.id} className={`ef-cmdk__item${active ? ' ef-cmdk__item--active' : ''}`}
                    onMouseEnter={() => setIdx(flat.indexOf(it))}
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
