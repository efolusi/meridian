import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-donut{display:flex;align-items:center;gap:20px}
.ef-donut__legend{display:flex;flex-direction:column;gap:8px}
.ef-donut__item{display:flex;align-items:center;gap:8px;font-size:var(--text-sm);color:var(--text-secondary);border:none;background:none;padding:0;cursor:default;font-family:var(--font-sans);text-align:left}
.ef-donut__swatch{width:9px;height:9px;border-radius:2px;flex:none}
.ef-donut__val{margin-left:auto;font-family:var(--font-mono);font-size:12px;color:var(--text-primary);padding-left:14px}
`;
const PALETTE = ['var(--brand-950)', 'var(--brand-500)', 'var(--brand-200)', 'var(--sand-400)', 'var(--sand-200)'];
export function DonutChart({ data, size = 140, thickness = 16, centerLabel, centerValue, format, style, className, ...rest }) {
  injectEfCss('ef-css-donut', CSS);
  const [hov, setHov] = React.useState(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 50 - thickness / 100 * 50;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const segs = data.map((d, i) => {
    const frac = d.value / total;
    const seg = { ...d, i, dash: `${Math.max(frac * C - 1.5, 0.5)} ${C}`, offset: -acc * C, color: d.color || PALETTE[i % PALETTE.length] };
    acc += frac;
    return seg;
  });
  return (
    <div {...rest} className={`ef-donut${className ? ' ' + className : ''}`} style={style}>
      <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
        <svg viewBox="0 0 100 100" width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {segs.map(s => (
            <circle key={s.i} cx="50" cy="50" r={R} fill="none" stroke={s.color} strokeWidth={thickness * (hov === s.i ? 1.15 : 1)}
              strokeDasharray={s.dash} strokeDashoffset={s.offset} style={{ transition: 'stroke-width 120ms var(--ease-out)' }}
              onMouseEnter={() => setHov(s.i)} onMouseLeave={() => setHov(null)} />
          ))}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: Math.round(size * 0.16), fontWeight: 600, color: 'var(--text-primary)' }}>
            {hov != null ? (format ? format(segs[hov].value) : segs[hov].value.toLocaleString()) : centerValue}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hov != null ? segs[hov].label : centerLabel}</span>
        </div>
      </div>
      <div className="ef-donut__legend">
        {segs.map(s => (
          <span key={s.i} className="ef-donut__item" onMouseEnter={() => setHov(s.i)} onMouseLeave={() => setHov(null)} style={{ opacity: hov == null || hov === s.i ? 1 : .45, transition: 'opacity 120ms var(--ease-out)' }}>
            <span className="ef-donut__swatch" style={{ background: s.color }}></span>
            {s.label}
            <span className="ef-donut__val">{Math.round(s.value / total * 100)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
