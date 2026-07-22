import React from 'react';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-cal{width:252px;user-select:none}
.ef-cal__head{display:flex;align-items:center;gap:4px;margin-bottom:8px}
.ef-cal__month{flex:1;text-align:center;font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.ef-cal__grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.ef-cal__row{display:contents}
.ef-cal__dow{text-align:center;font-size:10px;font-weight:var(--weight-semibold);letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);padding:4px 0}
.ef-cal__day{height:32px;border:1px solid transparent;border-radius:var(--radius-sm);background:none;cursor:pointer;font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-primary);transition:background var(--dur-fast) var(--ease-out)}
.ef-cal__day:hover{background:var(--sand-100)}
.ef-cal__day:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-cal__day--out{color:var(--sand-400)}
.ef-cal__day--today{border-color:var(--sand-400)}
.ef-cal__day--sel{background:var(--accent);color:var(--accent-contrast);font-weight:var(--weight-semibold)}
.ef-cal__day--sel:hover{background:var(--sand-900)}
`;
const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const DOW_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
export function Calendar({ value, onChange, style, className, ...rest }) {
  injectEfCss('ef-css-cal', CSS);
  const sel = value ? new Date(value + 'T00:00:00') : null;
  const [view, setView] = React.useState(() => { const b = sel || new Date(); return [b.getFullYear(), b.getMonth()]; });
  const [y, m] = view;
  const first = new Date(y, m, 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(y, m, 1 - offset);
  const today = iso(new Date());
  const cells = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const gridRef = React.useRef(null);
  const [focusIso, setFocusIso] = React.useState(() => (sel ? iso(sel) : today));
  const focusTarget = cells.some(d => iso(d) === focusIso) ? focusIso : iso(first);
  const move = days => {
    const base = new Date(focusTarget + 'T00:00:00');
    const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
    setFocusIso(iso(next));
    if (next.getMonth() !== m || next.getFullYear() !== y) setView([next.getFullYear(), next.getMonth()]);
  };
  React.useEffect(() => {
    const g = gridRef.current;
    if (!g) return;
    // A month change unmounts the focused day and drops focus to <body>;
    // reclaiming it from there is restoration, not stealing.
    const ae = document.activeElement;
    if (!(g.contains(ae) || ae === document.body)) return;
    const btn = g.querySelector(`[data-iso="${focusTarget}"]`);
    if (btn) btn.focus();
  }, [focusTarget, y, m]);
  const onGridKey = e => {
    const map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in map) { e.preventDefault(); move(map[e.key]); return; }
    const dow = () => (new Date(focusTarget + 'T00:00:00').getDay() + 6) % 7;
    if (e.key === 'Home') { e.preventDefault(); move(-dow()); }
    else if (e.key === 'End') { e.preventDefault(); move(6 - dow()); }
    else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      const base = new Date(focusTarget + 'T00:00:00');
      const [ty, tm] = e.key === 'PageUp' ? (m === 0 ? [y - 1, 11] : [y, m - 1]) : (m === 11 ? [y + 1, 0] : [y, m + 1]);
      const clamped = Math.min(base.getDate(), new Date(ty, tm + 1, 0).getDate());
      setFocusIso(iso(new Date(ty, tm, clamped)));
      setView([ty, tm]);
    }
  };
  const rows = Array.from({ length: 6 }, (_, r) => cells.slice(r * 7, r * 7 + 7));
  return (
    <div {...rest} className={`ef-cal${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-cal__head">
        <IconButton icon="chevron-left" label="Previous month" size="sm" onClick={() => setView(m === 0 ? [y - 1, 11] : [y, m - 1])} />
        <span className="ef-cal__month" aria-live="polite">{MONTHS[m]} {y}</span>
        <IconButton icon="chevron-right" label="Next month" size="sm" onClick={() => setView(m === 11 ? [y + 1, 0] : [y, m + 1])} />
      </div>
      <div role="grid" ref={gridRef} onKeyDown={onGridKey} aria-label={`${MONTHS[m]} ${y}`} className="ef-cal__grid">
        <div role="row" className="ef-cal__row">
          {DOW.map((d, i) => <span key={d} role="columnheader" aria-label={DOW_FULL[i]} className="ef-cal__dow">{d}</span>)}
        </div>
        {rows.map((row, ri) => (
          <div role="row" className="ef-cal__row" key={ri}>
            {row.map(d => {
              const id = iso(d);
              return (
                <button key={id} role="gridcell" data-iso={id} tabIndex={id === focusTarget ? 0 : -1}
                  aria-selected={sel ? id === iso(sel) : undefined}
                  aria-current={id === today ? 'date' : undefined}
                  aria-label={`${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`}
                  className={`ef-cal__day${d.getMonth() !== m ? ' ef-cal__day--out' : ''}${id === today ? ' ef-cal__day--today' : ''}${sel && id === iso(sel) ? ' ef-cal__day--sel' : ''}`}
                  onClick={() => { setFocusIso(id); if (onChange) onChange(id); }}>{d.getDate()}</button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
