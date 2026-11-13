import React from 'react';
import { injectEfCss, cssPct } from '../forms/Button.jsx';
const CSS = `
.ef-bars{display:flex;align-items:flex-end;gap:3px;width:100%}
.ef-bars__bar{flex:1;min-width:3px;border-radius:2px 2px 0 0;background:var(--text-muted);transition:background var(--dur-fast) var(--ease-out)}
.ef-bars__bar--hi{background:var(--accent)}
.ef-bars__bar:hover{background:var(--brand-700)}
.ef-bars__sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.ef-bars__labels{display:flex;justify-content:space-between;margin-top:6px;font-family:var(--font-mono);font-size:10px;color:var(--text-muted)}
`;
// Fixed default locale: the runtime default would differ between server and browser.
export function BarChart({ data = [], height = 140, highlightLast = 0, labels, format, locale = 'en-US', 'aria-label': ariaLabel, style, className, ...rest }) {
  injectEfCss('ef-css-bars', CSS);
  const vals = data.map(d => typeof d === 'number' ? d : d.value);
  const max = Math.max(...vals, 1);
  const nf = new Intl.NumberFormat(locale);
  const fmt = v => format ? format(v) : nf.format(v);
  const name = i => (data[i] && data[i].label) || (labels && labels[i]) || String(i + 1);
  const top = vals.reduce((best, v, i) => v > vals[best] ? i : best, 0);
  const summary = ariaLabel || (vals.length
    ? `Bar chart, ${vals.length} bar${vals.length === 1 ? '' : 's'}, highest ${name(top)} ${fmt(vals[top])}`
    : 'Bar chart, no data');
  return (
    <div {...rest} className={className} style={{ position: 'relative', ...style }}>
      <div className="ef-bars" role="img" aria-label={summary} style={{ height }}>
        {vals.map((v, i) => (
          <div key={i} className={`ef-bars__bar${i >= vals.length - highlightLast ? ' ef-bars__bar--hi' : ''}`}
            style={{ height: cssPct(Math.max(2, (v / max) * 100)) }}
            title={(data[i] && data[i].label ? data[i].label + ' · ' : '') + fmt(v)}></div>
        ))}
      </div>
      {vals.length ? (
        <table className="ef-bars__sr">
          <thead><tr><th scope="col">Label</th><th scope="col">Value</th></tr></thead>
          <tbody>{vals.map((v, i) => <tr key={i}><th scope="row">{name(i)}</th><td>{fmt(v)}</td></tr>)}</tbody>
        </table>
      ) : null}
      {labels && labels.length ? <div className="ef-bars__labels" aria-hidden="true">{labels.map((l, i) => <span key={i}>{l}</span>)}</div> : null}
    </div>
  );
}
