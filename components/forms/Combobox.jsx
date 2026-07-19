import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { Tag } from '../display/Tag.jsx';
import { injectEfCss } from './Button.jsx';
import { useFieldProps } from './FormField.jsx';
import { Portal, useAnchoredStyle } from '../overlay/Portal.jsx';
const CSS = `
.ef-combo{position:relative}
.ef-combo__control{display:flex;align-items:center;flex-wrap:wrap;gap:6px;min-height:var(--control-h-md);padding:4px 32px 4px 8px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);cursor:text;transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-combo__control:hover{border-color:var(--sand-400)}
.ef-combo--open .ef-combo__control{border-color:var(--accent);box-shadow:var(--focus-ring)}
.ef-combo__input{flex:1;min-width:80px;border:none;outline:none;background:none;font-family:var(--font-sans);font-size:var(--text-md);color:var(--text-primary);height:26px;padding:0 4px}
.ef-combo__input::placeholder{color:var(--text-muted)}
.ef-combo__chevron{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:var(--text-muted);display:inline-flex;pointer-events:none}
.ef-combo__panel{position:absolute;top:calc(100% + 6px);left:0;right:0;max-height:240px;overflow-y:auto;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:4px;z-index:var(--z-dropdown);animation:ef-combo-in var(--dur-fast) var(--ease-out)}
@keyframes ef-combo-in{from{opacity:0;transform:translateY(-3px)}}
.ef-combo__opt{display:flex;align-items:center;gap:9px;width:100%;padding:7px 10px;border:none;border-radius:var(--radius-sm);background:none;cursor:pointer;text-align:left;font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-primary)}
.ef-combo__opt--hi{background:var(--surface-sunken)}
.ef-combo__opt__check{margin-left:auto;color:var(--accent);display:inline-flex}
.ef-combo__empty{padding:14px 10px;font-size:var(--text-sm);color:var(--text-muted);text-align:center}
`;
export function Combobox({ label, hint, options, value, onChange, multiple, placeholder = 'Search…', style, className, ...rest }) {
  injectEfCss('ef-css-combo', CSS);
  // Picks up id / aria wiring when nested in a FormField; standalone this is a no-op.
  const field = useFieldProps({ id: rest.id, 'aria-describedby': rest['aria-describedby'] });
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [hi, setHi] = React.useState(0);
  const ref = React.useRef(null);
  const panelRef = React.useRef(null);
  const { style: anchored } = useAnchoredStyle(ref, panelRef, { open, placement: 'bottom', align: 'start', matchWidth: true });
  const sel = multiple ? (value || []) : (value != null ? [value] : []);
  const opts = options.map(o => typeof o === 'string' ? { value: o, label: o } : o);
  const shown = opts.filter(o => o.label.toLowerCase().includes(q.toLowerCase()) && (!multiple || !sel.includes(o.value)));
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
  const pick = v => {
    if (multiple) { onChange && onChange([...sel, v]); setQ(''); }
    else { onChange && onChange(v); setQ(''); setOpen(false); }
  };
  const unpick = v => onChange && onChange(multiple ? sel.filter(x => x !== v) : null);
  const key = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, shown.length - 1)); setOpen(true); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter' && open && shown[hi]) { e.preventDefault(); pick(shown[hi].value); }
    else if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'Backspace' && !q && multiple && sel.length) unpick(sel[sel.length - 1]);
  };
  const control = (
    <div ref={ref} className={`ef-combo${open ? ' ef-combo--open' : ''}`}>
      <div className="ef-combo__control" onClick={() => { setOpen(true); ref.current.querySelector('input').focus(); }}>
        {multiple && sel.map(v => {
          const o = opts.find(x => x.value === v);
          return <Tag key={v} onRemove={() => unpick(v)}>{o ? o.label : v}</Tag>;
        })}
        <input {...field.controlProps} className="ef-combo__input" role="combobox" aria-expanded={open}
          placeholder={sel.length && multiple ? '' : !multiple && sel.length ? (opts.find(x => x.value === sel[0]) || {}).label : placeholder}
          value={q} onChange={e => { setQ(e.target.value); setOpen(true); setHi(0); }} onFocus={() => setOpen(true)} onKeyDown={key} />
        <span className="ef-combo__chevron"><Icon name="chevron-down" size={16} /></span>
      </div>
      {open && (
        <Portal>
        <div ref={panelRef} className="ef-combo__panel" role="listbox" style={anchored}>
          {shown.length === 0 && <div className="ef-combo__empty">Nothing matches “{q}”.</div>}
          {shown.map((o, i) => (
            <button key={o.value} role="option" aria-selected={!multiple && sel.includes(o.value)} className={`ef-combo__opt${i === hi ? ' ef-combo__opt--hi' : ''}`}
              onMouseEnter={() => setHi(i)} onClick={() => pick(o.value)}>
              {o.icon ? <Icon name={o.icon} size={15} /> : null}
              {o.label}
              {!multiple && sel.includes(o.value) ? <span className="ef-combo__opt__check"><Icon name="check" size={15} /></span> : null}
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
