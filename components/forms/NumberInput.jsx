import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from './Button.jsx';
import { useFieldProps } from './FormField.jsx';
const CSS = `
.ef-field{display:flex;flex-direction:column;gap:6px}
.ef-field__label{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-field__hint{font-size:var(--text-xs);color:var(--text-muted)}
.ef-field__error{font-size:var(--text-xs);color:var(--danger-600);display:flex;align-items:center;gap:4px}
.ef-number{display:flex;align-items:stretch;overflow:hidden;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-number:hover:not(.ef-number--disabled){border-color:var(--sand-400)}
.ef-number:focus-within{border-color:var(--accent);box-shadow:var(--focus-ring)}
.ef-number.ef-number--invalid{border-color:var(--danger-600)}
.ef-number.ef-number--invalid:focus-within{box-shadow:var(--focus-ring-danger)}
.ef-number--disabled{background:var(--surface-sunken)}
.ef-number__el{flex:1;min-width:0;border:none;background:transparent;color:var(--text-primary);font-family:var(--font-sans);font-variant-numeric:tabular-nums}
.ef-number__el:focus{outline:none}
.ef-number__el::placeholder{color:var(--text-muted)}
.ef-number__el:disabled{color:var(--text-muted);cursor:not-allowed}
.ef-number--sm .ef-number__el{height:calc(var(--control-h-sm) - 2px);padding:0 10px;font-size:var(--text-sm)}
.ef-number--md .ef-number__el{height:calc(var(--control-h-md) - 2px);padding:0 12px;font-size:var(--text-md)}
.ef-number--lg .ef-number__el{height:calc(var(--control-h-lg) - 2px);padding:0 14px;font-size:var(--text-lg)}
.ef-number__steps{display:flex;flex-direction:column;flex:none;align-self:stretch;border-left:1px solid var(--border-default)}
.ef-number__step{flex:1 1 0;display:flex;align-items:center;justify-content:center;width:24px;padding:0;border:none;background:transparent;color:var(--text-muted);cursor:pointer;transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.ef-number__step:hover:not(:disabled){background:var(--surface-sunken);color:var(--text-primary)}
.ef-number__step:disabled{opacity:.45;cursor:not-allowed}
.ef-number__step:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-number__step+.ef-number__step{border-top:1px solid var(--border-default)}
.ef-number--sm .ef-number__step{width:22px}
.ef-number--lg .ef-number__step{width:28px}
`;
// How many decimal places a number carries, so a commit can round away float
// noise: 0.1 + 0.2 must land as 0.3, not 0.30000000000000004.
function decimalsOf(n) {
  if (!Number.isFinite(n)) return 0;
  const s = String(n);
  const e = s.search(/e-/i);
  const i = s.indexOf('.');
  if (e !== -1) return (+s.slice(e + 2) || 0) + (i !== -1 ? e - i - 1 : 0);
  return i === -1 ? 0 : s.length - i - 1;
}
const defaultParse = t => {
  const n = Number(t.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
};
/**
 * A numeric field with stepper buttons — a text input with inputmode="decimal"
 * rather than type=number, so typing stays free-form and the value only
 * commits (parse → clamp → snap to step) on blur. Empty commits null.
 * ArrowUp/Down step, Shift multiplies by 10, Home/End jump to finite rails.
 */
export function NumberInput({ label, hint, error, invalid, value, defaultValue, onChange, min, max, step = 1, size = 'md', disabled, placeholder, format, parse, style, className, ...rest }) {
  injectEfCss('ef-css-number', CSS);
  // Picks up id / aria wiring when nested in a FormField; standalone this is a no-op.
  const field = useFieldProps({ invalid, error, id: rest.id, 'aria-describedby': rest['aria-describedby'] });
  const uid = React.useId();
  const inputId = field.id || (label ? uid + 'n' : undefined);
  const bad = field.invalid;

  const [inner, setInner] = React.useState(defaultValue !== undefined ? defaultValue : null);
  const v = value !== undefined ? value : inner;
  // The text being edited; null means "not editing, show the formatted value".
  const [draft, setDraft] = React.useState(null);

  const fmt = n => (format ? format(n) : String(n));
  const parseText = t => {
    const s = t.trim();
    if (s === '') return null;
    const n = (parse || defaultParse)(s);
    return n != null && Number.isFinite(n) ? n : undefined; // undefined = unparseable
  };
  const normalize = n => {
    let x = n;
    if (step > 0) {
      const base = Number.isFinite(min) ? min : 0;
      const d = Math.max(decimalsOf(step), decimalsOf(base));
      x = base + Math.round((x - base) / step) * step;
      x = Number(x.toFixed(Math.min(d, 20)));
    }
    if (Number.isFinite(min) && x < min) x = min;
    if (Number.isFinite(max) && x > max) x = max;
    return x;
  };
  const emit = (next, e) => {
    if (value === undefined) setInner(next);
    if (onChange && !Object.is(next, v)) onChange(next, e);
  };
  const commit = e => {
    if (draft == null) return;
    const n = parseText(draft);
    setDraft(null);
    if (n === undefined) return; // unparseable: revert to the last committed value
    emit(n === null ? null : normalize(n), e);
  };
  const stepBy = (dir, mult, e) => {
    const parsed = draft != null ? parseText(draft) : v;
    const cur = parsed === undefined ? v : parsed;
    let next;
    if (cur == null) next = Number.isFinite(min) ? min : Number.isFinite(max) && dir < 0 ? max : 0;
    else next = cur + dir * step * mult;
    setDraft(null);
    emit(normalize(next), e);
  };
  const keys = e => {
    if (disabled) return;
    if (e.key === 'ArrowUp') { e.preventDefault(); stepBy(1, e.shiftKey ? 10 : 1, e); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); stepBy(-1, e.shiftKey ? 10 : 1, e); }
    else if (e.key === 'Home' && Number.isFinite(min)) { e.preventDefault(); setDraft(null); emit(normalize(min), e); }
    else if (e.key === 'End' && Number.isFinite(max)) { e.preventDefault(); setDraft(null); emit(normalize(max), e); }
  };

  const shown = draft != null ? draft : v == null ? '' : fmt(v);
  const upStuck = disabled || (v != null && Number.isFinite(max) && v >= max);
  const downStuck = disabled || (v != null && Number.isFinite(min) && v <= min);

  const control = (
    <span className={`ef-number ef-number--${size}${bad ? ' ef-number--invalid' : ''}${disabled ? ' ef-number--disabled' : ''}`}>
      <input {...rest} {...field.controlProps} id={inputId} className="ef-number__el" type="text" inputMode="decimal" autoComplete="off"
        placeholder={placeholder} disabled={disabled} value={shown} aria-invalid={bad || undefined}
        onChange={e => setDraft(e.target.value)} onKeyDown={keys} onBlur={commit} />
      <span className="ef-number__steps">
        <button type="button" className="ef-number__step" aria-label="Increase" tabIndex={-1} disabled={upStuck}
          onMouseDown={e => e.preventDefault()} onClick={e => stepBy(1, 1, e)}><Icon name="chevron-up" size={size === 'lg' ? 14 : 12} /></button>
        <button type="button" className="ef-number__step" aria-label="Decrease" tabIndex={-1} disabled={downStuck}
          onMouseDown={e => e.preventDefault()} onClick={e => stepBy(-1, 1, e)}><Icon name="chevron-down" size={size === 'lg' ? 14 : 12} /></button>
      </span>
    </span>
  );
  if (!label && !hint && !error) return React.cloneElement(control, { style, className: control.props.className + (className ? ' ' + className : '') });
  return (
    <div className={`ef-field${className ? ' ' + className : ''}`} style={style}>
      {label ? <label htmlFor={inputId} className="ef-field__label">{label}</label> : null}
      {control}
      {error ? <span className="ef-field__error"><Icon name="circle-alert" size={12} />{error}</span> : hint ? <span className="ef-field__hint">{hint}</span> : null}
    </div>
  );
}
