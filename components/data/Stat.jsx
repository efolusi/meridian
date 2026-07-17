import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-stat__label{font-size:var(--text-sm);color:var(--text-muted);font-weight:var(--weight-medium)}
.ef-stat__row{display:flex;align-items:baseline;gap:8px;margin-top:6px}
.ef-stat__value{font-family:var(--font-mono);font-size:26px;font-weight:var(--weight-semibold);letter-spacing:-0.01em;color:var(--text-primary)}
.ef-stat__delta{font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.ef-stat__delta--up{color:var(--success-600)}
.ef-stat__delta--down{color:var(--danger-600)}
.ef-stat__delta--flat{color:var(--text-muted)}
.ef-stat__hint{font-size:var(--text-xs);color:var(--text-muted);margin-top:4px}
`;
export function Stat({ label, value, delta, direction = 'flat', hint, style, className }) {
  injectEfCss('ef-css-stat', CSS);
  const arrow = direction === 'up' ? '↑ ' : direction === 'down' ? '↓ ' : '';
  return (
    <div className={className} style={style}>
      <div className="ef-stat__label">{label}</div>
      <div className="ef-stat__row">
        <span className="ef-stat__value">{value}</span>
        {delta != null ? <span className={`ef-stat__delta ef-stat__delta--${direction}`}>{arrow}{delta}</span> : null}
      </div>
      {hint ? <div className="ef-stat__hint">{hint}</div> : null}
    </div>
  );
}
