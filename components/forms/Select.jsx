import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from './Button.jsx';
import { useFieldProps } from './FormField.jsx';
const CSS = `
.ef-field{display:flex;flex-direction:column;gap:6px}
.ef-field__label{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-field__hint{font-size:var(--text-xs);color:var(--text-muted)}
.ef-select{position:relative;display:flex;align-items:center}
.ef-select__el{width:100%;appearance:none;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);color:var(--text-primary);font-family:var(--font-sans);cursor:pointer;transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-select__el:hover:not(:disabled){border-color:var(--sand-400)}
.ef-select__el:focus{outline:none;border-color:var(--accent);box-shadow:var(--focus-ring)}
.ef-select__el:disabled{background:var(--surface-sunken);color:var(--text-muted);cursor:not-allowed}
.ef-select--sm .ef-select__el{height:var(--control-h-sm);padding:0 28px 0 10px;font-size:var(--text-sm)}
.ef-select--md .ef-select__el{height:var(--control-h-md);padding:0 32px 0 12px;font-size:var(--text-md)}
.ef-select--lg .ef-select__el{height:var(--control-h-lg);padding:0 36px 0 14px;font-size:var(--text-lg)}
.ef-select__chevron{position:absolute;right:10px;color:var(--text-muted);pointer-events:none;display:inline-flex}
.ef-select--invalid .ef-select__el{border-color:var(--danger-600)}
`;
export function Select({ label, hint, options, size = 'md', invalid, children, style, className, ...rest }) {
  injectEfCss('ef-css-select', CSS);
  // Picks up id / aria wiring when nested in a FormField; standalone this is a no-op.
  const field = useFieldProps({ invalid, id: rest.id, 'aria-describedby': rest['aria-describedby'] });
  const control = (
    <span className={`ef-select ef-select--${size}${field.invalid ? ' ef-select--invalid' : ''}`}>
      <select className="ef-select__el" aria-invalid={field.invalid || undefined} {...rest} {...field.controlProps}>
        {options ? options.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>) : children}
      </select>
      <span className="ef-select__chevron"><Icon name="chevron-down" size={16} /></span>
    </span>
  );
  if (!label && !hint) return React.cloneElement(control, { style, className: control.props.className + (className ? ' ' + className : '') });
  return (
    <label className={`ef-field${className ? ' ' + className : ''}`} style={style}>
      {label ? <span className="ef-field__label">{label}</span> : null}
      {control}
      {hint ? <span className="ef-field__hint">{hint}</span> : null}
    </label>
  );
}
