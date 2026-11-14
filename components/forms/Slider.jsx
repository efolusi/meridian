'use client';
import React from 'react';
import { injectEfCss } from './Button.jsx';
import { useFieldProps } from './Field.jsx';

const CSS = `
.ef-slider{display:flex;flex-direction:column;gap:8px;touch-action:none;user-select:none}
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
function asArray(value, fallback) { return Array.isArray(value) ? value : fallback; }
// value + step in floating point gives 0.30000000000000004 for 0.2 + 0.1; round
// to the step's decimals so keyboard steps land where a native step would.
function stepFrom(value, delta, step) {
  const decimals = (String(step).split('.')[1] || '').length;
  return Number((value + delta).toFixed(decimals));
}

export const Slider = React.forwardRef(function Slider({ min = 0, max = 100, step = 1, value: valueProp, defaultValue, onValueChange, onValueCommit, disabled, orientation = 'horizontal', minStepsBetweenThumbs = 0, inverted = false, dir, style, className, ...rest }, forwardedRef) {
  injectEfCss('ef-css-slider', CSS);
  const field = useFieldProps({ id: rest.id, 'aria-describedby': rest['aria-describedby'] });
  const fallback = [min];
  const [inner, setInner] = React.useState(() => asArray(defaultValue, fallback));
  const values = asArray(valueProp, inner).map(value => clamp(Number(value), min, max));
  const latestRef = React.useRef(values);
  latestRef.current = values;
  const span = max - min || 1;
  const percentages = values.map(value => ((value - min) / span) * 100);
  const low = values.length > 1 ? Math.min(...percentages) : 0;
  const high = values.length > 1 ? Math.max(...percentages) : percentages[0];
  const update = (index, nextNumber) => {
    const next = [...values];
    const gap = minStepsBetweenThumbs * step;
    const lower = index > 0 ? next[index - 1] + gap : min;
    const upper = index < next.length - 1 ? next[index + 1] - gap : max;
    next[index] = clamp(nextNumber, lower, upper);
    latestRef.current = next;
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };

  const rangeStyle = orientation === 'vertical'
    ? { bottom: `${low}%`, height: `${high - low}%`, width: '100%' }
    : { insetInlineStart: `${inverted ? 100 - high : low}%`, width: `${high - low}%` };
  // Every thumb's native min/max is the full range, so each thumb sits on the
  // shared track where the range fill ends. The neighbour limit is enforced by
  // update() and announced through aria-valuemin/aria-valuemax.
  const control = (
    <span className="ef-slider__control">
      <span className="ef-slider__rail" data-slot="slider-track"><span className="ef-slider__range" data-slot="slider-range" style={rangeStyle} /></span>
      {values.map((value, index) => (
        <input
          {...rest}
          {...field.controlProps}
          key={index}
          id={index === 0 ? (field.controlProps.id || rest.id) : undefined}
          type="range"
          data-slot="slider-thumb"
          aria-label={rest['aria-label'] ? `${rest['aria-label']}${values.length > 1 ? ` ${index + 1}` : ''}` : undefined}
          min={min}
          max={max}
          aria-valuemin={index > 0 ? values[index - 1] + minStepsBetweenThumbs * step : min}
          aria-valuemax={index < values.length - 1 ? values[index + 1] - minStepsBetweenThumbs * step : max}
          step={step}
          value={value}
          disabled={disabled}
          dir={inverted ? (dir === 'rtl' ? 'ltr' : 'rtl') : dir}
          className="ef-slider__input"
          onChange={event => update(index, Number(event.target.value))}
          onKeyDown={event => {
            rest.onKeyDown?.(event);
            if (event.defaultPrevented || orientation === 'vertical' || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
            // WebKit steps a native range by key, not by side: ArrowRight raises the
            // value even when the thumb moves left in RTL. Step toward the arrow's
            // side in every engine, as Chromium does natively.
            const rtl = event.currentTarget.closest('[dir]')?.getAttribute('dir') === 'rtl';
            event.preventDefault();
            update(index, stepFrom(value, (event.key === 'ArrowRight') !== rtl ? step : -step, step));
          }}
          onPointerUp={() => onValueCommit?.(latestRef.current)}
          onKeyUp={event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) onValueCommit?.(latestRef.current); }}
        />
      ))}
    </span>
  );
  const rootProps = { 'data-slot': 'slider', 'data-orientation': orientation, 'data-disabled': disabled ? '' : undefined, dir, className: `ef-slider${className ? ' ' + className : ''}`, style };
  return <span {...rootProps} ref={forwardedRef}>{control}</span>;
});
