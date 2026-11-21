'use client';
import React from 'react';
import { injectEfCss, useIsoLayoutEffect } from '../runtime/runtime.jsx';
const CSS = `
.ef-donut{position:relative;display:flex;align-items:center;gap:var(--space-5)}
.ef-donut__legend{display:flex;flex-direction:column;gap:var(--space-2)}
.ef-donut__item{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-secondary);border:none;background:none;padding:0;cursor:default;font-family:var(--font-sans);text-align:start}
.ef-donut__swatch{width:9px;height:9px;border-radius:var(--radius-xs);flex:none;overflow:hidden}
.ef-donut__figure{position:relative;flex:none}
.ef-donut__figure>svg{display:block;overflow:visible;transform:rotate(-90deg)}
.ef-donut__seg{transition:stroke-width 120ms var(--ease-out)}
.ef-donut__center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}
.ef-donut__value{font-family:var(--font-mono);font-size:var(--ef-donut-value-size,var(--text-2xl));font-weight:600;color:var(--text-primary)}
.ef-donut__label{font-size:var(--text-2xs);color:var(--text-muted)}
.ef-donut__item{transition:opacity 120ms var(--ease-out)}
.ef-donut__item[data-dim]{opacity:.45}
@media (prefers-reduced-motion:reduce){.ef-donut__seg,.ef-donut__item{transition:none}}
.ef-donut__sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.ef-donut__val{margin-inline-start:auto;font-family:var(--font-mono);font-size:var(--text-xs);color:var(--text-primary);padding-inline-start:var(--space-4)}
`;
// Categorical slots from tokens/colors.css, in fixed order. A sixth slice reuses
// slot 1, so keep a donut to five slices or fold the rest into "Other".
const PALETTE = [1, 2, 3, 4, 5].map(n => `var(--chart-${n})`);
// Fixed default locale: the runtime default would differ between server and browser.
export function DonutChart({ data = [], size = 140, thickness = 16, centerLabel, centerValue, format, locale = 'en-US', 'aria-label': ariaLabel, style, className, ...rest }) {
  injectEfCss('ef-css-donut', CSS);
  const [hov, setHov] = React.useState(null);
  // The centre figure scales with the chart; set through the CSSOM, not a style attribute (strict CSP).
  const rootRef = React.useRef(null);
  useIsoLayoutEffect(() => {
    rootRef.current?.style.setProperty('--ef-donut-value-size', `${Math.round(size * 0.16)}px`);
  }, [size]);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const nf = new Intl.NumberFormat(locale);
  const fmt = v => format ? format(v) : nf.format(v);
  const pct = v => Math.round(v / total * 100) + '%';
  const summary = ariaLabel || (data.length
    ? 'Donut chart' + (centerLabel ? ', ' + centerLabel : '') + ': ' + data.map(d => `${d.label} ${pct(d.value)}`).join(', ')
    : 'Donut chart, no data');
  const R = 50 - thickness / 100 * 50;
  const C = 2 * Math.PI * R;
  // A 2px surface gap between segments at any size (viewBox is 100 units wide).
  const gap = 2 * 100 / size;
  let acc = 0;
  const segs = data.map((d, i) => {
    const frac = d.value / total;
    const seg = { ...d, i, dash: `${Math.max(frac * C - gap, 0.5)} ${C}`, offset: -acc * C, color: d.color || PALETTE[i % PALETTE.length] };
    acc += frac;
    return seg;
  });
  return (
    <div {...rest} ref={rootRef} className={`ef-donut${className ? ' ' + className : ''}`} style={style}>
      <div role="img" aria-label={summary} className="ef-donut__figure">
        <svg viewBox="0 0 100 100" width={size} height={size}>
          {segs.map(s => (
            <circle key={s.i} cx="50" cy="50" r={R} fill="none" stroke={s.color} strokeWidth={thickness * (hov === s.i ? 1.15 : 1)}
              strokeDasharray={s.dash} strokeDashoffset={s.offset} className="ef-donut__seg"
              onMouseEnter={() => setHov(s.i)} onMouseLeave={() => setHov(null)} />
          ))}
        </svg>
        <div className="ef-donut__center">
          <span className="ef-donut__value">
            {hov != null ? fmt(segs[hov].value) : centerValue}
          </span>
          <span className="ef-donut__label">{hov != null ? segs[hov].label : centerLabel}</span>
        </div>
      </div>
      {data.length ? (
        <table className="ef-donut__sr">
          <thead><tr><th scope="col">Label</th><th scope="col">Value</th><th scope="col">Share</th></tr></thead>
          <tbody>{segs.map(sg => <tr key={sg.i}><th scope="row">{sg.label}</th><td>{fmt(sg.value)}</td><td>{pct(sg.value)}</td></tr>)}</tbody>
        </table>
      ) : null}
      {/* The table above carries the same figures for assistive tech. */}
      <div className="ef-donut__legend" aria-hidden="true">
        {segs.map(s => (
          <span key={s.i} className="ef-donut__item" onMouseEnter={() => setHov(s.i)} onMouseLeave={() => setHov(null)} data-dim={hov == null || hov === s.i ? undefined : ''}>
            <svg className="ef-donut__swatch" viewBox="0 0 1 1" aria-hidden="true" focusable="false"><rect width="1" height="1" fill={s.color} /></svg>
            {s.label}
            <span className="ef-donut__val">{pct(s.value)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
