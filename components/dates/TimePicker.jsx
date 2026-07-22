import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
import { useFieldProps } from '../forms/FormField.jsx';
import { Portal, useAnchoredStyle } from '../overlay/Portal.jsx';
const CSS = `
.ef-field{display:flex;flex-direction:column;gap:6px}
.ef-field__label{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-field__hint{font-size:var(--text-xs);color:var(--text-muted)}
.ef-timepicker{position:relative;display:flex;align-items:center}
.ef-timepicker__input{width:100%;height:var(--control-h-md);padding:0 34px 0 12px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);font-family:var(--font-sans);font-size:var(--text-md);color:var(--text-primary);transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-timepicker__input::placeholder{color:var(--text-muted)}
.ef-timepicker__input:hover:not(:disabled){border-color:var(--sand-400)}
.ef-timepicker__input:focus{outline:none;border-color:var(--accent);box-shadow:var(--focus-ring)}
.ef-timepicker__input:disabled{background:var(--surface-sunken);color:var(--text-muted);cursor:not-allowed}
.ef-timepicker--invalid .ef-timepicker__input{border-color:var(--danger-600)}
.ef-timepicker--invalid .ef-timepicker__input:focus{box-shadow:var(--focus-ring-danger)}
.ef-timepicker__icon{position:absolute;right:11px;color:var(--text-muted);display:inline-flex;pointer-events:none}
.ef-timepicker__panel{max-height:240px;overflow-y:auto;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:4px;z-index:var(--z-dropdown);animation:ef-tp-in var(--dur-fast) var(--ease-out)}
@keyframes ef-tp-in{from{opacity:0;transform:translateY(-3px)}}
.ef-timepicker__opt{display:flex;align-items:center;gap:9px;width:100%;padding:7px 10px;border:none;border-radius:var(--radius-sm);background:none;cursor:pointer;text-align:left;font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-primary)}
.ef-timepicker__opt--hi{background:var(--surface-sunken)}
.ef-timepicker__opt__check{margin-left:auto;color:var(--accent);display:inline-flex}
.ef-timepicker__empty{padding:14px 10px;font-size:var(--text-sm);color:var(--text-muted);text-align:center}
`;
const toMin = t => { const p = t.split(':'); return Number(p[0]) * 60 + Number(p[1] || 0); };
const toHM = n => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
const label12 = t => { const p = t.split(':').map(Number); const ap = p[0] < 12 ? 'AM' : 'PM'; return (p[0] % 12 || 12) + ':' + String(p[1]).padStart(2, '0') + ' ' + ap; };
// '9:5' -> '09:05', '14' -> '14:00', '9:05 pm' -> '21:05'; null when not a time.
const parseTyped = raw => {
  const m = /^\s*(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?\s*$/i.exec(raw);
  if (!m) return null;
  let h = Number(m[1]);
  const mm = Number(m[2] || 0);
  const ap = m[3] ? m[3].toLowerCase() : null;
  if (ap) {
    if (h < 1 || h > 12) return null;
    if (ap === 'pm' && h !== 12) h += 12;
    if (ap === 'am' && h === 12) h = 0;
  }
  if (h > 23 || mm > 59) return null;
  return toHM(h * 60 + mm);
};
export function TimePicker({ label, hint, value, onChange, stepMinutes = 30, minTime, maxTime, format24 = true, placeholder = 'Pick a time', disabled, invalid, style, className, ...rest }) {
  injectEfCss('ef-css-timepicker', CSS);
  // Picks up id / aria wiring when nested in a FormField; standalone this is a no-op.
  const field = useFieldProps({ invalid, id: rest.id, 'aria-describedby': rest['aria-describedby'] });
  const bad = field.invalid;
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState(null); // null = not editing, input mirrors `value`
  const [hi, setHi] = React.useState(0);
  const listId = React.useId();
  const ref = React.useRef(null);
  const panelRef = React.useRef(null);
  const { style: anchored } = useAnchoredStyle(ref, panelRef, { open, placement: 'bottom', align: 'start', matchWidth: true });
  const lo = toMin(minTime || '00:00');
  const end = toMin(maxTime || '23:59');
  const step = Math.max(1, stepMinutes);
  const slots = [];
  for (let t = lo; t <= end; t += step) slots.push(toHM(t));
  const fmtSlot = t => (format24 ? t : label12(t));
  const query = q ? q.trim().toLowerCase() : '';
  const shown = query ? slots.filter(s => fmtSlot(s).toLowerCase().includes(query) || s.includes(query)) : slots;
  // Keep the highlighted option visible to sighted users the same way
  // aria-activedescendant keeps it visible to screen readers.
  React.useEffect(() => {
    if (!open) return;
    const el = document.getElementById(`${listId}-opt-${hi}`);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [open, hi, listId]);
  React.useEffect(() => {
    if (!open) return;
    const away = e => {
      const inControl = ref.current && ref.current.contains(e.target);
      const inPanel = panelRef.current && panelRef.current.contains(e.target);
      if (!inControl && !inPanel) setOpen(false);
    };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);
  const openList = () => {
    if (disabled) return;
    setOpen(true);
    const idx = value ? slots.indexOf(value) : -1;
    setHi(idx >= 0 ? idx : 0);
  };
  const pick = t => { if (onChange) onChange(t); setQ(null); setOpen(false); };
  // A typed valid time commits on blur even when it is not a listed slot,
  // clamped into [minTime, maxTime]; an emptied input commits null.
  const commitTyped = () => {
    if (q == null) return;
    if (q.trim() === '') { if (onChange) onChange(null); }
    else {
      const t = parseTyped(q);
      if (t) { if (onChange) onChange(toHM(Math.min(Math.max(toMin(t), lo), end))); }
    }
    setQ(null);
  };
  const onBlur = () => { commitTyped(); setOpen(false); };
  const onKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) openList(); else setHi(h => Math.min(h + 1, shown.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter' && open && shown[hi]) { e.preventDefault(); pick(shown[hi]); }
    else if (e.key === 'Escape') { setOpen(false); setQ(null); }
  };
  const control = (
    <div ref={ref} className={`ef-timepicker${bad ? ' ef-timepicker--invalid' : ''}`}>
      <input {...field.controlProps} className="ef-timepicker__input" role="combobox" aria-expanded={open}
        aria-controls={listId} aria-autocomplete="list" aria-invalid={bad || undefined}
        aria-activedescendant={open && shown.length ? `${listId}-opt-${hi}` : undefined}
        placeholder={placeholder} disabled={disabled}
        value={q != null ? q : value ? fmtSlot(value) : ''}
        onChange={e => { setQ(e.target.value); setOpen(true); setHi(0); }}
        onClick={openList} onFocus={openList} onBlur={onBlur} onKeyDown={onKey} />
      <span className="ef-timepicker__icon"><Icon name="clock" size={15} /></span>
      {open && (
        <Portal>
          {/* mousedown is swallowed so an option click never blurs the input into a stray typed-commit */}
          <div ref={panelRef} className="ef-timepicker__panel" role="listbox" id={listId} style={anchored} onMouseDown={e => e.preventDefault()}>
            {shown.length === 0 && <div className="ef-timepicker__empty">No matching time.</div>}
            {shown.map((t, i) => (
              <button key={t} type="button" role="option" id={`${listId}-opt-${i}`} tabIndex={-1} aria-selected={t === value}
                className={`ef-timepicker__opt${i === hi ? ' ef-timepicker__opt--hi' : ''}`}
                onMouseEnter={() => setHi(i)} onClick={() => pick(t)}>
                {fmtSlot(t)}
                {t === value ? <span className="ef-timepicker__opt__check"><Icon name="check" size={15} /></span> : null}
              </button>
            ))}
          </div>
        </Portal>
      )}
    </div>
  );
  if (!label && !hint) return <div {...rest} className={className} style={style}>{control}</div>;
  return (
    <div {...rest} className={`ef-field${className ? ' ' + className : ''}`} style={style}>
      {label ? <span className="ef-field__label">{label}</span> : null}
      {control}
      {hint ? <span className="ef-field__hint">{hint}</span> : null}
    </div>
  );
}
