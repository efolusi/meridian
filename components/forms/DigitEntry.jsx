import React from 'react';
import { injectEfCss } from './Button.jsx';
const CSS = `
.ef-digits{display:flex;gap:8px}
.ef-digits__cell{width:44px;height:52px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);color:var(--text-primary);font-family:var(--font-mono);font-size:22px;font-weight:600;text-align:center;transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-digits__cell:hover:not(:disabled){border-color:var(--sand-400)}
.ef-digits__cell:focus{outline:none;border-color:var(--accent);box-shadow:var(--focus-ring)}
.ef-digits__cell:disabled{background:var(--surface-sunken);cursor:not-allowed}
.ef-digits--invalid .ef-digits__cell{border-color:var(--danger-600)}
`;
export function DigitEntry({ length = 6, value, onChange, onComplete, label, invalid, disabled, style, className, ...rest }) {
  injectEfCss('ef-css-digits', CSS);
  const [inner, setInner] = React.useState('');
  const v = value != null ? value : inner;
  const refs = React.useRef([]);
  const set = next => {
    next = next.replace(/\D/g, '').slice(0, length);
    if (value == null) setInner(next);
    if (onChange) onChange(next);
    if (next.length === length && onComplete) onComplete(next);
  };
  const keyAt = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (v[i]) set(v.slice(0, i) + v.slice(i + 1));
      else if (i > 0) { set(v.slice(0, i - 1) + v.slice(i)); refs.current[i - 1] && refs.current[i - 1].focus(); }
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1].focus();
    else if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1].focus();
  };
  const inputAt = (i, e) => {
    const ch = e.target.value.replace(/\D/g, '');
    if (!ch) return;
    const next = (v.slice(0, i) + ch + v.slice(i + ch.length)).slice(0, length);
    set(next);
    const to = Math.min(i + ch.length, length - 1);
    refs.current[to] && refs.current[to].focus();
  };
  const cells = Array.from({ length }, (_, i) => (
    <input key={i} ref={el => refs.current[i] = el} className="ef-digits__cell" inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'}
      maxLength={length} value={v[i] || ''} disabled={disabled} aria-label={`Digit ${i + 1} of ${length}`}
      onChange={e => inputAt(i, e)} onKeyDown={e => keyAt(i, e)} onFocus={e => e.target.select()} />
  ));
  const group = <div className={`ef-digits${invalid ? ' ef-digits--invalid' : ''}`}>{cells}</div>;
  if (!label) return <div {...rest} className={className} style={style}>{group}</div>;
  return (
    <div className={`ef-field${className ? ' ' + className : ''}`} style={style}>
      <span className="ef-field__label">{label}</span>
      {group}
    </div>
  );
}
