import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from './Button.jsx';
import { useFieldProps } from './FormField.jsx';
const CSS = `
.ef-field{display:flex;flex-direction:column;gap:6px}
.ef-field__label{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-field__hint{font-size:var(--text-xs);color:var(--text-muted)}
.ef-field__error{font-size:var(--text-xs);color:var(--danger-600);display:flex;align-items:center;gap:4px}
.ef-input{position:relative;display:flex;align-items:center}
.ef-input__el{width:100%;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);color:var(--text-primary);font-family:var(--font-sans);transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-input__el::placeholder{color:var(--text-muted)}
.ef-input__el:hover:not(:disabled){border-color:var(--sand-400)}
.ef-input__el:focus{outline:none;border-color:var(--accent);box-shadow:var(--focus-ring)}
.ef-input__el:disabled{background:var(--surface-sunken);color:var(--text-muted);cursor:not-allowed}
.ef-input--sm .ef-input__el{height:var(--control-h-sm);padding:0 10px;font-size:var(--text-sm)}
.ef-input--md .ef-input__el{height:var(--control-h-md);padding:0 12px;font-size:var(--text-md)}
.ef-input--lg .ef-input__el{height:var(--control-h-lg);padding:0 14px;font-size:var(--text-lg)}
.ef-input--icon.ef-input--sm .ef-input__el{padding-left:32px}
.ef-input--icon.ef-input--md .ef-input__el{padding-left:36px}
.ef-input--icon.ef-input--lg .ef-input__el{padding-left:40px}
.ef-input__icon{position:absolute;left:11px;color:var(--text-muted);display:inline-flex;pointer-events:none}
.ef-input--invalid .ef-input__el{border-color:var(--danger-600)}
.ef-input--invalid .ef-input__el:focus{box-shadow:var(--focus-ring-danger)}
`;
export function Input({ label, hint, error, iconLeft, size = 'md', invalid, style, className, ...rest }) {
  injectEfCss('ef-css-input', CSS);
  // Picks up id / aria wiring when nested in a FormField; standalone this is a no-op.
  const field = useFieldProps({ invalid, error, id: rest.id, 'aria-describedby': rest['aria-describedby'] });
  const bad = field.invalid;
  const control = (
    <span className={`ef-input ef-input--${size}${iconLeft ? ' ef-input--icon' : ''}${bad ? ' ef-input--invalid' : ''}`}>
      {iconLeft ? <span className="ef-input__icon"><Icon name={iconLeft} size={size === 'lg' ? 18 : 16} /></span> : null}
      <input className="ef-input__el" aria-invalid={bad || undefined} {...rest} {...field.controlProps} />
    </span>
  );
  if (!label && !hint && !error) return React.cloneElement(control, { style, className: (control.props.className + (className ? ' ' + className : '')) });
  return (
    <label className={`ef-field${className ? ' ' + className : ''}`} style={style}>
      {label ? <span className="ef-field__label">{label}</span> : null}
      {control}
      {error ? <span className="ef-field__error"><Icon name="circle-alert" size={12} />{error}</span> : hint ? <span className="ef-field__hint">{hint}</span> : null}
    </label>
  );
}
