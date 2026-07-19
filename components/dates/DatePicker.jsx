import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { Calendar } from './Calendar.jsx';
import { injectEfCss } from '../forms/Button.jsx';
import { Portal, useAnchoredStyle } from '../overlay/Portal.jsx';
const CSS = `
.ef-datepicker{position:relative;display:inline-flex;flex-direction:column;gap:6px}
.ef-datepicker__label{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-datepicker__btn{display:inline-flex;align-items:center;gap:8px;height:var(--control-h-md);padding:0 12px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);font-family:var(--font-sans);font-size:var(--text-md);color:var(--text-primary);cursor:pointer;transition:border-color var(--dur-fast) var(--ease-out)}
.ef-datepicker__btn:hover{border-color:var(--sand-400)}
.ef-datepicker__btn:focus-visible{outline:none;border-color:var(--accent);box-shadow:var(--focus-ring)}
.ef-datepicker__btn--empty{color:var(--text-muted)}
.ef-datepicker__pop{position:absolute;top:calc(100% + 6px);left:0;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:12px;z-index:var(--z-dropdown);animation:ef-dp-in var(--dur-fast) var(--ease-out)}
@keyframes ef-dp-in{from{opacity:0;transform:translateY(-3px)}}
`;
const fmt = v => { if (!v) return null; const d = new Date(v + 'T00:00:00'); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
export function DatePicker({ label, value, defaultValue, onChange, placeholder = 'Pick a date', style, className }) {
  injectEfCss('ef-css-datepicker', CSS);
  const [inner, setInner] = React.useState(defaultValue || '');
  const v = value != null ? value : inner;
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const btnRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const anchored = useAnchoredStyle(ref, panelRef, { open, placement: 'bottom', align: 'start' });
  React.useEffect(() => {
    if (!open) return;
    // the calendar is portaled out of `ref`, so look for it in the panel
    const day = panelRef.current && panelRef.current.querySelector('[role="gridcell"][tabindex="0"]');
    if (day) day.focus();
    const away = e => {
      const inTrigger = ref.current && ref.current.contains(e.target);
      const inPanel = panelRef.current && panelRef.current.contains(e.target);
      if (!inTrigger && !inPanel) setOpen(false);
    };
    const key = e => { if (e.key === 'Escape') { setOpen(false); if (btnRef.current) btnRef.current.focus(); } };
    document.addEventListener('mousedown', away); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <span ref={ref} className={`ef-datepicker${className ? ' ' + className : ''}`} style={style}>
      {label ? <span className="ef-datepicker__label">{label}</span> : null}
      <button type="button" ref={btnRef} aria-haspopup="dialog" aria-expanded={open} className={`ef-datepicker__btn${v ? '' : ' ef-datepicker__btn--empty'}`} onClick={() => setOpen(o => !o)}>
        <Icon name="calendar" size={15} style={{ color: 'var(--text-muted)' }} />{fmt(v) || placeholder}
        <Icon name="chevron-down" size={14} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
      </button>
      {open && (
        <Portal>
          <div ref={panelRef} className="ef-datepicker__pop" style={anchored}>
            <Calendar value={v || undefined} onChange={d => { if (value == null) setInner(d); if (onChange) onChange(d); setOpen(false); if (btnRef.current) btnRef.current.focus(); }} />
          </div>
        </Portal>
      )}
    </span>
  );
}
