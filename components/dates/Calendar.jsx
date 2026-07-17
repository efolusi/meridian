import React from 'react';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-cal{width:252px;user-select:none}
.ef-cal__head{display:flex;align-items:center;gap:4px;margin-bottom:8px}
.ef-cal__month{flex:1;text-align:center;font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.ef-cal__grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.ef-cal__dow{text-align:center;font-size:10px;font-weight:var(--weight-semibold);letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);padding:4px 0}
.ef-cal__day{height:32px;border:1px solid transparent;border-radius:var(--radius-sm);background:none;cursor:pointer;font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-primary);transition:background var(--dur-fast) var(--ease-out)}
.ef-cal__day:hover{background:var(--sand-100)}
.ef-cal__day:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-cal__day--out{color:var(--sand-400)}
.ef-cal__day--today{border-color:var(--sand-400)}
.ef-cal__day--sel{background:var(--sand-950);color:var(--sand-50);font-weight:var(--weight-semibold)}
.ef-cal__day--sel:hover{background:var(--sand-900)}
`;
const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
export function Calendar({ value, onChange, style, className }) {
  injectEfCss('ef-css-cal', CSS);
  const sel = value ? new Date(value + 'T00:00:00') : null;
  const [view, setView] = React.useState(() => { const b = sel || new Date(); return [b.getFullYear(), b.getMonth()]; });
  const [y, m] = view;
  const first = new Date(y, m, 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(y, m, 1 - offset);
  const today = iso(new Date());
  const cells = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  return (
    <div className={`ef-cal${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-cal__head">
        <IconButton icon="chevron-left" label="Previous month" size="sm" onClick={() => setView(m === 0 ? [y - 1, 11] : [y, m - 1])} />
        <span className="ef-cal__month">{MONTHS[m]} {y}</span>
        <IconButton icon="chevron-right" label="Next month" size="sm" onClick={() => setView(m === 11 ? [y + 1, 0] : [y, m + 1])} />
      </div>
      <div className="ef-cal__grid">
        {DOW.map(d => <span key={d} className="ef-cal__dow">{d}</span>)}
        {cells.map(d => {
          const id = iso(d);
          return (
            <button key={id} className={`ef-cal__day${d.getMonth() !== m ? ' ef-cal__day--out' : ''}${id === today ? ' ef-cal__day--today' : ''}${sel && id === iso(sel) ? ' ef-cal__day--sel' : ''}`}
              onClick={() => onChange && onChange(id)}>{d.getDate()}</button>
          );
        })}
      </div>
    </div>
  );
}
