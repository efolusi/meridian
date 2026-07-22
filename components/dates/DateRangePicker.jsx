import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { Calendar } from './Calendar.jsx';
import { injectEfCss } from '../forms/Button.jsx';
import { useFieldProps } from '../forms/FormField.jsx';
import { Portal, useAnchoredStyle } from '../overlay/Portal.jsx';
const CSS = `
.ef-daterange{position:relative;display:inline-flex;flex-direction:column;gap:6px}
.ef-daterange__label{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-daterange__hint{font-size:var(--text-xs);color:var(--text-muted)}
.ef-daterange__wrap{position:relative;display:inline-flex}
.ef-daterange__btn{flex:1;min-width:0;display:inline-flex;align-items:center;gap:8px;height:var(--control-h-md);padding:0 32px 0 12px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);font-family:var(--font-sans);font-size:var(--text-md);color:var(--text-primary);cursor:pointer;white-space:nowrap;transition:border-color var(--dur-fast) var(--ease-out)}
.ef-daterange__btn:hover:not(:disabled){border-color:var(--sand-400)}
.ef-daterange__btn:focus-visible{outline:none;border-color:var(--accent);box-shadow:var(--focus-ring)}
.ef-daterange__btn:disabled{background:var(--surface-sunken);color:var(--text-muted);cursor:not-allowed}
.ef-daterange__btn--empty{color:var(--text-muted)}
.ef-daterange__chevron{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:inline-flex;color:var(--text-muted);pointer-events:none}
.ef-daterange__clear{position:absolute;right:6px;top:50%;transform:translateY(-50%);display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:none;border-radius:var(--radius-sm);background:none;color:var(--text-muted);cursor:pointer}
.ef-daterange__clear:hover{background:var(--surface-sunken);color:var(--text-primary)}
.ef-daterange__clear:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-daterange__pop{background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:12px;z-index:var(--z-dropdown);animation:ef-drp-in var(--dur-fast) var(--ease-out)}
@keyframes ef-drp-in{from{opacity:0;transform:translateY(-3px)}}
`;
const fmt = v => { if (!v) return null; const d = new Date(v + 'T00:00:00'); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
const EMPTY = { from: null, to: null };
export function DateRangePicker({ label, hint, value, onChange, min, max, placeholder = 'Pick a date range', disabled, style, className, ...rest }) {
  injectEfCss('ef-css-daterange', CSS);
  // Picks up id / aria wiring when nested in a FormField; standalone this is a no-op.
  const field = useFieldProps({ id: rest.id, 'aria-describedby': rest['aria-describedby'] });
  const [inner, setInner] = React.useState(EMPTY);
  const v = value != null ? value : inner;
  const from = v && v.from ? v.from : null;
  const to = v && v.to ? v.to : null;
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const btnRef = React.useRef(null);
  const panelRef = React.useRef(null);
  const { style: anchored } = useAnchoredStyle(wrapRef, panelRef, { open, placement: 'bottom', align: 'start' });
  React.useEffect(() => {
    if (!open) return;
    // the calendar is portaled out of `rootRef`, so look for it in the panel
    const day = panelRef.current && panelRef.current.querySelector('[role="gridcell"][tabindex="0"]');
    if (day) day.focus();
    const away = e => {
      const inTrigger = rootRef.current && rootRef.current.contains(e.target);
      const inPanel = panelRef.current && panelRef.current.contains(e.target);
      if (!inTrigger && !inPanel) setOpen(false);
    };
    const key = e => { if (e.key === 'Escape') { setOpen(false); if (btnRef.current) btnRef.current.focus(); } };
    document.addEventListener('mousedown', away); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', key); };
  }, [open]);
  const commit = r => { if (value == null) setInner(r); if (onChange) onChange(r); };
  // The Calendar itself has no bounds, so a pick outside [min, max] is dropped
  // here: any change whose ends stray out of the window never commits.
  const inBounds = d => !d || ((!min || d >= min) && (!max || d <= max));
  const handlePick = r => {
    if (!inBounds(r.from) || !inBounds(r.to)) return;
    commit(r);
    if (r.from && r.to) { setOpen(false); if (btnRef.current) btnRef.current.focus(); }
  };
  const clear = () => { commit(EMPTY); if (btnRef.current) btnRef.current.focus(); };
  const text = from || to ? `${fmt(from) || '…'} — ${fmt(to) || '…'}` : null;
  return (
    <span {...rest} ref={rootRef} className={`ef-daterange${className ? ' ' + className : ''}`} style={style}>
      {label ? <span className="ef-daterange__label">{label}</span> : null}
      <span ref={wrapRef} className="ef-daterange__wrap">
        <button {...field.controlProps} type="button" ref={btnRef} disabled={disabled} aria-haspopup="dialog" aria-expanded={open}
          className={`ef-daterange__btn${text ? '' : ' ef-daterange__btn--empty'}`} onClick={() => setOpen(o => !o)}>
          <Icon name="calendar" size={15} style={{ color: 'var(--text-muted)' }} />{text || placeholder}
        </button>
        {text && !disabled
          ? <button type="button" className="ef-daterange__clear" aria-label="Clear date range" onClick={clear}><Icon name="x" size={13} /></button>
          : <span className="ef-daterange__chevron"><Icon name="chevron-down" size={14} /></span>}
      </span>
      {hint ? <span className="ef-daterange__hint">{hint}</span> : null}
      {open && (
        <Portal>
          <div ref={panelRef} className="ef-daterange__pop" style={anchored}>
            <Calendar range value={{ from, to }} onChange={handlePick} />
          </div>
        </Portal>
      )}
    </span>
  );
}
