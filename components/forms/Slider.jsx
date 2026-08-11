import React from 'react';
import { injectEfCss, mergeRefs } from './Button.jsx';
import { useFieldProps } from './FormField.jsx';

const CSS = `
.ef-slider{display:flex;flex-direction:column;gap:8px;touch-action:none;user-select:none}
.ef-slider__row{display:flex;align-items:center;gap:12px}
.ef-slider__label{display:flex;justify-content:space-between;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-slider__val{font-family:var(--font-mono);font-size:var(--text-sm);font-weight:400;color:var(--text-muted)}
.ef-slider__control{position:relative;display:flex;align-items:center;width:100%;height:24px}
.ef-slider__rail{position:absolute;inset-inline:0;height:3px;border-radius:var(--radius-full);background:var(--border-strong);overflow:hidden}
.ef-slider__range{position:absolute;inset-block:0;border-radius:inherit;background:var(--accent)}
.ef-slider__input{position:absolute;inset:0;width:100%;height:24px;margin:0;background:transparent;pointer-events:none;-webkit-appearance:none;appearance:none}
.ef-slider__input::-webkit-slider-runnable-track{height:3px;background:transparent}
.ef-slider__input::-webkit-slider-thumb{width:16px;height:16px;margin-top:-6.5px;border:1.5px solid var(--accent);border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-xs);pointer-events:auto;cursor:grab;-webkit-appearance:none;transition:transform var(--dur-fast) var(--ease-out)}
.ef-slider__input::-moz-range-track{height:3px;background:transparent}
.ef-slider__input::-moz-range-thumb{width:13px;height:13px;border:1.5px solid var(--accent);border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-xs);pointer-events:auto;cursor:grab}
.ef-slider__input:active::-webkit-slider-thumb{cursor:grabbing;transform:scale(1.12)}
.ef-slider__input:focus-visible{outline:none}
.ef-slider__input:focus-visible::-webkit-slider-thumb{box-shadow:var(--focus-ring)}
.ef-slider__input:focus-visible::-moz-range-thumb{box-shadow:var(--focus-ring)}
.ef-slider[data-disabled]{opacity:.45;cursor:not-allowed}
.ef-slider[data-disabled] .ef-slider__input::-webkit-slider-thumb{cursor:not-allowed}
.ef-slider[data-orientation="vertical"]{display:inline-flex;height:180px}
.ef-slider[data-orientation="vertical"] .ef-slider__control{width:24px;height:100%}
.ef-slider[data-orientation="vertical"] .ef-slider__rail{inset-block:0;inset-inline:auto;width:3px;height:auto;inset-inline-start:50%;transform:translateX(-50%)}
.ef-slider[data-orientation="vertical"] .ef-slider__input{width:24px;height:100%;writing-mode:vertical-lr;direction:rtl}
`;

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function asArray(value, fallback) { return Array.isArray(value) ? value : value == null ? fallback : [value]; }

export const Slider = React.forwardRef(function Slider({ label, showValue, format, min = 0, max = 100, step = 1, value: valueProp, defaultValue, onValueChange, onValueCommit, onChange, disabled, orientation = 'horizontal', minStepsBetweenThumbs = 0, inverted = false, dir, style, className, ...rest }, forwardedRef) {
  injectEfCss('ef-css-slider', CSS);
  const field = useFieldProps({ id: rest.id, 'aria-describedby': rest['aria-describedby'] });
  const canonical = Array.isArray(valueProp) || Array.isArray(defaultValue);
  const fallback = [(min + max) / 2];
  const [inner, setInner] = React.useState(() => asArray(defaultValue, fallback));
  const values = asArray(valueProp, inner).map(value => clamp(Number(value), min, max));
  const latestRef = React.useRef(values);
  latestRef.current = values;
  const inputRefs = React.useRef([]);
  const span = max - min || 1;
  const percentages = values.map(value => ((value - min) / span) * 100);
  const low = values.length > 1 ? Math.min(...percentages) : 0;
  const high = values.length > 1 ? Math.max(...percentages) : percentages[0];
  const displayValue = values.map(value => format ? format(value) : value).join(', ');

  const update = (index, nextNumber, event) => {
    const next = [...values];
    const gap = minStepsBetweenThumbs * step;
    const lower = index > 0 ? next[index - 1] + gap : min;
    const upper = index < next.length - 1 ? next[index + 1] - gap : max;
    next[index] = clamp(nextNumber, lower, upper);
    latestRef.current = next;
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
    onChange?.(canonical ? next : next[0], event);
  };

  const rangeStyle = orientation === 'vertical'
    ? { bottom: `${low}%`, height: `${high - low}%`, width: '100%' }
    : { insetInlineStart: `${inverted ? 100 - high : low}%`, width: `${high - low}%` };
  const control = (
    <span className="ef-slider__control">
      <span className="ef-slider__rail" data-slot="slider-track"><span className="ef-slider__range" data-slot="slider-range" style={rangeStyle} /></span>
      {values.map((value, index) => (
        <input
          {...rest}
          {...field.controlProps}
          key={index}
          ref={mergeRefs(index === 0 ? forwardedRef : null, node => { inputRefs.current[index] = node; })}
          type="range"
          data-slot="slider-thumb"
          aria-label={rest['aria-label'] ? `${rest['aria-label']}${values.length > 1 ? ` ${index + 1}` : ''}` : undefined}
          min={index > 0 ? values[index - 1] + minStepsBetweenThumbs * step : min}
          max={index < values.length - 1 ? values[index + 1] - minStepsBetweenThumbs * step : max}
          step={step}
          value={value}
          disabled={disabled}
          dir={inverted ? (dir === 'rtl' ? 'ltr' : 'rtl') : dir}
          className="ef-slider__input"
          onChange={event => update(index, Number(event.target.value), event)}
          onPointerUp={() => onValueCommit?.(latestRef.current)}
          onKeyUp={event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) onValueCommit?.(latestRef.current); }}
        />
      ))}
    </span>
  );
  const rootProps = { 'data-slot': 'slider', 'data-orientation': orientation, 'data-disabled': disabled ? '' : undefined, dir, className: `ef-slider${className ? ' ' + className : ''}`, style };
  if (!label && !showValue) return <span {...rootProps}>{control}</span>;
  return <label {...rootProps}>{(label || showValue) ? <span className="ef-slider__label">{label}<span className="ef-slider__val">{showValue ? displayValue : ''}</span></span> : null}{control}</label>;
});
