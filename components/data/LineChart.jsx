import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-linechart{position:relative}
.ef-linechart__tip{position:absolute;transform:translate(-50%,-130%);background:var(--surface-inverse);color:var(--text-inverse);font-size:11px;font-weight:500;padding:4px 8px;border-radius:6px;white-space:nowrap;pointer-events:none;z-index:5}
`;
export function LineChart({ data, height = 150, showArea = true, showDots = false, format, style, className }) {
  injectEfCss('ef-css-linechart', CSS);
  const [hov, setHov] = React.useState(null);
  const ref = React.useRef(null);
  const W = 600, H = height, PAD = 6;
  const vals = data.map(d => d.value);
  const max = Math.max(...vals), min = Math.min(...vals);
  const span = max - min || 1;
  const x = i => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const y = v => H - PAD - ((v - min) / span) * (H - PAD * 2);
  const path = data.map((d, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(d.value).toFixed(1)).join(' ');
  const area = path + ` L${x(data.length - 1).toFixed(1)},${H - PAD} L${x(0).toFixed(1)},${H - PAD} Z`;
  const move = e => {
    const r = ref.current.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left) / r.width) * (data.length - 1));
    setHov(Math.max(0, Math.min(data.length - 1, i)));
  };
  return (
    <div ref={ref} className={`ef-linechart${className ? ' ' + className : ''}`} style={style} onMouseMove={move} onMouseLeave={() => setHov(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: 'block' }}>
        {showArea && <path d={area} fill="var(--accent)" opacity=".07" />}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {(showDots ? data.map((_, i) => i) : hov != null ? [hov] : []).map(i => (
          <circle key={i} cx={x(i)} cy={y(data[i].value)} r="3" fill="var(--surface-card)" stroke="var(--accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        ))}
        {hov != null && <line x1={x(hov)} x2={x(hov)} y1={PAD} y2={H - PAD} stroke="var(--border-strong)" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
      </svg>
      {hov != null && (
        <div className="ef-linechart__tip" style={{ left: (x(hov) / W * 100) + '%', top: (y(data[hov].value) / H * 100) + '%' }}>
          {data[hov].label}{data[hov].label ? ' · ' : ''}{format ? format(data[hov].value) : data[hov].value.toLocaleString()}
        </div>
      )}
    </div>
  );
}
