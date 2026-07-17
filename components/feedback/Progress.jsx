import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-progress{display:flex;flex-direction:column;gap:6px}
.ef-progress__head{display:flex;justify-content:space-between;align-items:baseline}
.ef-progress__label{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-primary)}
.ef-progress__val{font-family:var(--font-mono);font-size:var(--text-xs);color:var(--text-muted)}
.ef-progress__track{height:4px;border-radius:var(--radius-full);background:var(--sand-200);overflow:hidden}
.ef-progress__fill{height:100%;border-radius:var(--radius-full);background:var(--accent);transition:width var(--dur-slow) var(--ease-out)}
.ef-progress--warning .ef-progress__fill{background:var(--warning-600)}
.ef-progress--danger .ef-progress__fill{background:var(--danger-600)}
`;
export function Progress({ value = 0, max = 100, label, showValue, format, tone = 'default', style, className }) {
  injectEfCss('ef-css-progress', CSS);
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`ef-progress ef-progress--${tone}${className ? ' ' + className : ''}`} style={style} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      {(label || showValue) && (
        <div className="ef-progress__head">
          <span className="ef-progress__label">{label}</span>
          {showValue ? <span className="ef-progress__val">{format ? format(value, max) : Math.round(pct) + '%'}</span> : null}
        </div>
      )}
      <div className="ef-progress__track"><div className="ef-progress__fill" style={{ width: pct + '%' }}></div></div>
    </div>
  );
}
