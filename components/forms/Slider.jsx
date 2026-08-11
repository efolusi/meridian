import React from 'react';
import { injectEfCss } from './Button.jsx';
import { useFieldProps } from './FormField.jsx';
const CSS = `
.ef-slider{display:flex;flex-direction:column;gap:8px}
.ef-slider__row{display:flex;align-items:center;gap:12px}
.ef-slider__label{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary);display:flex;justify-content:space-between}
.ef-slider__val{font-family:var(--font-mono);font-size:var(--text-sm);font-weight:400;color:var(--text-muted)}
.ef-slider__input{-webkit-appearance:none;appearance:none;width:100%;height:24px;background:transparent;cursor:pointer;margin:0}
.ef-slider__input::-webkit-slider-runnable-track{height:2px;border-radius:2px;background:linear-gradient(to right,var(--accent) var(--ef-fill,50%),var(--border-strong) var(--ef-fill,50%))}
.ef-slider__input::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;margin-top:-6px;border-radius:var(--radius-full);background:var(--surface-card);border:1.5px solid var(--accent);transition:transform var(--dur-fast) var(--ease-out)}
.ef-slider__input:active::-webkit-slider-thumb{transform:scale(1.15)}
.ef-slider__input:focus-visible{outline:none}
.ef-slider__input:focus-visible::-webkit-slider-thumb{box-shadow:var(--focus-ring)}
.ef-slider__input:disabled{opacity:.45;cursor:not-allowed}
.ef-slider__input::-moz-range-track{height:2px;border-radius:2px;background:var(--border-strong)}
.ef-slider__input::-moz-range-progress{height:2px;border-radius:2px;background:var(--accent)}
.ef-slider__input::-moz-range-thumb{width:12px;height:12px;border-radius:var(--radius-full);background:var(--surface-card);border:1.5px solid var(--accent)}
`;
export const Slider = React.forwardRef(function Slider({ label, showValue, format, min = 0, max = 100, step = 1, value: valueProp, defaultValue, onValueChange, onValueCommit, onChange, disabled, style, className, ...rest }, ref) {
  injectEfCss('ef-css-slider', CSS);
  // Picks up id / aria wiring when nested in a FormField; standalone this is a no-op.
  const field = useFieldProps({ id: rest.id, 'aria-describedby': rest['aria-describedby'] });
  const arrays = Array.isArray(valueProp) || Array.isArray(defaultValue);
  const initial = defaultValue != null ? defaultValue : (arrays ? [(min + max) / 2] : (min + max) / 2);
  const [inner, setInner] = React.useState(initial);
  const current = valueProp != null ? valueProp : inner;
  const v = Array.isArray(current) ? current[0] : current;
  const pct = ((v - min) / (max - min)) * 100;
  const handle = e => { const n = +e.target.value; const next = arrays ? [n] : n; if (valueProp == null) setInner(next); if (onValueChange) onValueChange(arrays ? [n] : [n]); if (onChange) onChange(n, e); };
  const input = <input ref={ref} type="range" data-slot="slider" className="ef-slider__input" style={{ '--ef-fill': pct + '%' }} min={min} max={max} step={step} value={v} onChange={handle} onPointerUp={() => onValueCommit && onValueCommit(Array.isArray(current) ? current : [current])} disabled={disabled} {...rest} {...field.controlProps} />;
  if (!label && !showValue) return <span className={`ef-slider${className ? ' ' + className : ''}`} style={style}>{input}</span>;
  return (
    <label className={`ef-slider${className ? ' ' + className : ''}`} style={style}>
      {(label || showValue) && <span className="ef-slider__label">{label}<span className="ef-slider__val">{showValue ? (format ? format(v) : v) : ''}</span></span>}
      {input}
    </label>
  );
});
