import React from 'react';
import { injectEfCss, cssPct, prefersReducedMotion } from '../forms/Button.jsx';
const CSS = `
.ef-usage{display:flex;flex-direction:column;gap:7px}
.ef-usage__row{display:flex;align-items:baseline;gap:8px}
.ef-usage__label{font-size:var(--text-sm);font-weight:600;color:var(--text-primary)}
.ef-usage__figures{margin-left:auto;font-family:var(--font-mono);font-size:12px;color:var(--text-muted)}
.ef-usage__track{height:6px;border-radius:var(--radius-full);background:var(--surface-sunken);overflow:hidden}
.ef-usage__fill{height:100%;border-radius:var(--radius-full);background:var(--accent);transition:width var(--dur-med) var(--ease-out)}
.ef-usage--warn .ef-usage__fill{background:var(--warning-600)}
.ef-usage--over .ef-usage__fill{background:var(--danger-600)}
.ef-usage__foot{display:flex;gap:8px;font-size:12px;color:var(--text-muted)}
.ef-usage__cost{margin-left:auto;font-family:var(--font-mono)}
`;
export function UsageMeter({ used = 0, limit = 100, label = 'Usage', unit = '', cost, hint, warnAt = 0.8, animated, format, style, className, ...rest }) {
  injectEfCss('ef-css-usage', CSS);
  const [shown, setShown] = React.useState(animated ? 0 : used);
  React.useEffect(() => {
    if (!animated || prefersReducedMotion()) { setShown(used); return; }
    let raf, start = null;
    const from = shown, to = used;
    const tick = now => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / 500);
      setShown(from + (to - from) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [used, animated]);
  const ratio = limit > 0 ? used / limit : 0;
  const fmt = format || (v => Math.round(v).toLocaleString());
  const tone = ratio >= 1 ? ' ef-usage--over' : ratio >= warnAt ? ' ef-usage--warn' : '';
  const shownRatio = limit > 0 ? shown / limit : 0;
  return (
    <div {...rest} className={`ef-usage${tone}${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-usage__row">
        <span className="ef-usage__label">{label}</span>
        <span className="ef-usage__figures">{fmt(shown)} / {fmt(limit)}{unit ? ' ' + unit : ''}</span>
      </div>
      <div className="ef-usage__track" role="progressbar" aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <span className="ef-usage__fill" style={{ width: cssPct(Math.min(100, (animated ? shownRatio : ratio) * 100)), display: 'block' }}></span>
      </div>
      {hint || cost ? (
        <div className="ef-usage__foot">
          {hint ? <span>{hint}</span> : null}
          {cost ? <span className="ef-usage__cost">{cost}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
