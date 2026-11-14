'use client';
import React from 'react';
import { injectEfCss, cssPct } from '../forms/Button.jsx';
const CSS = `
.ef-linechart{position:relative}
.ef-linechart__sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.ef-linechart__tip{position:absolute;transform:translate(-50%,-130%);background:var(--surface-inverse);color:var(--text-inverse);font-size:11px;font-weight:500;padding:4px 8px;border-radius:6px;white-space:nowrap;pointer-events:none;z-index:5}
`;
// A fixed default locale: the runtime default differs between server and
// browser and would make the first render mismatch on hydration.
export function LineChart({ data = [], height = 150, showArea = true, showDots = false, format, locale = 'en-US', 'aria-label': ariaLabel, style, className, ...rest }) {
  injectEfCss('ef-css-linechart', CSS);
  const [hov, setHov] = React.useState(null);
  const ref = React.useRef(null);
  const W = 600, H = height, PAD = 6;
  const vals = data.map(d => d.value);
  const max = Math.max(...vals), min = Math.min(...vals);
  const span = max - min || 1;
  const n = data.length;
  const nf = new Intl.NumberFormat(locale);
  const fmt = v => format ? format(v) : nf.format(v);
  const name = (d, i) => d.label != null && d.label !== '' ? d.label : String(i + 1);
  const summary = ariaLabel || (n
    ? `Line chart, ${n} point${n === 1 ? '' : 's'}: ${name(data[0], 0)} ${fmt(data[0].value)} to ${name(data[n - 1], n - 1)} ${fmt(data[n - 1].value)}, low ${fmt(min)}, high ${fmt(max)}`
    : 'Line chart, no data');
  const x = i => PAD + (n === 1 ? 0.5 : i / (n - 1)) * (W - PAD * 2);
  const y = v => n === 1 ? H / 2 : H - PAD - ((v - min) / span) * (H - PAD * 2);
  // One reading has no left-to-right span; draw it as a flat line across the
  // middle instead of dividing by zero, which put NaN in the path.
  const path = n === 0 ? '' : n === 1
    ? `M${PAD.toFixed(1)},${y(data[0].value).toFixed(1)} L${(W - PAD).toFixed(1)},${y(data[0].value).toFixed(1)}`
    : data.map((d, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(d.value).toFixed(1)).join(' ');
  const area = n === 0 ? '' : n === 1
    ? `${path} L${(W - PAD).toFixed(1)},${(H - PAD).toFixed(1)} L${PAD.toFixed(1)},${(H - PAD).toFixed(1)} Z`
    : path + ` L${x(data.length - 1).toFixed(1)},${H - PAD} L${x(0).toFixed(1)},${H - PAD} Z`;
  const move = e => {
    if (!n) return;
    const r = ref.current.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left) / r.width) * (data.length - 1));
    setHov(Math.max(0, Math.min(data.length - 1, i)));
  };
  return (
    <div {...rest} ref={ref} className={`ef-linechart${className ? ' ' + className : ''}`} style={style} onMouseMove={move} onMouseLeave={() => setHov(null)}>
      <svg role="img" aria-label={summary} viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: 'block' }}>
        {showArea && area && <path d={area} fill="var(--accent)" opacity=".07" />}
        {path && <path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />}
        {(showDots ? data.map((_, i) => i) : hov != null ? [hov] : []).map(i => (
          <circle key={i} cx={x(i)} cy={y(data[i].value)} r="3" fill="var(--surface-card)" stroke="var(--accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        ))}
        {hov != null && <line x1={x(hov)} x2={x(hov)} y1={PAD} y2={H - PAD} stroke="var(--border-strong)" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
      </svg>
      {n ? (
        <table className="ef-linechart__sr">
          <thead><tr><th scope="col">Label</th><th scope="col">Value</th></tr></thead>
          <tbody>{data.map((d, i) => <tr key={i}><th scope="row">{name(d, i)}</th><td>{fmt(d.value)}</td></tr>)}</tbody>
        </table>
      ) : null}
      {hov != null && (
        <div aria-hidden="true" className="ef-linechart__tip" style={{ left: cssPct(x(hov) / W * 100), top: cssPct(y(data[hov].value) / H * 100) }}>
          {data[hov].label}{data[hov].label ? ' · ' : ''}{fmt(data[hov].value)}
        </div>
      )}
    </div>
  );
}
