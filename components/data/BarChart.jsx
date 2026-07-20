import React from 'react';
import { injectEfCss, cssPct } from '../forms/Button.jsx';
const CSS = `
.ef-bars{display:flex;align-items:flex-end;gap:3px;width:100%}
.ef-bars__bar{flex:1;min-width:3px;border-radius:2px 2px 0 0;background:var(--sand-200);transition:background var(--dur-fast) var(--ease-out)}
.ef-bars__bar--hi{background:var(--accent)}
.ef-bars__bar:hover{background:var(--brand-700)}
.ef-bars__labels{display:flex;justify-content:space-between;margin-top:6px;font-family:var(--font-mono);font-size:10px;color:var(--text-muted)}
`;
export function BarChart({ data = [], height = 140, highlightLast = 0, labels, formatValue, style, className, ...rest }) {
  injectEfCss('ef-css-bars', CSS);
  const vals = data.map(d => typeof d === 'number' ? d : d.value);
  const max = Math.max(...vals, 1);
  return (
    <div {...rest} className={className} style={style}>
      <div className="ef-bars" style={{ height }}>
        {vals.map((v, i) => (
          <div key={i} className={`ef-bars__bar${i >= vals.length - highlightLast ? ' ef-bars__bar--hi' : ''}`}
            style={{ height: cssPct(Math.max(2, (v / max) * 100)) }}
            title={(data[i] && data[i].label ? data[i].label + ' · ' : '') + (formatValue ? formatValue(v) : v.toLocaleString())}></div>
        ))}
      </div>
      {labels && labels.length ? <div className="ef-bars__labels">{labels.map((l, i) => <span key={i}>{l}</span>)}</div> : null}
    </div>
  );
}
