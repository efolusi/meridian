import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from './Button.jsx';
const CSS = `
.ef-field{display:flex;flex-direction:column;gap:6px}
.ef-field__label{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-field__hint{font-size:var(--text-xs);color:var(--text-muted)}
.ef-field__error{font-size:var(--text-xs);color:var(--danger-600);display:flex;align-items:center;gap:4px}
.ef-textarea{width:100%;min-height:80px;padding:10px 12px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);color:var(--text-primary);font-family:var(--font-sans);font-size:var(--text-md);line-height:var(--leading-normal);resize:vertical;transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-textarea::placeholder{color:var(--text-muted)}
.ef-textarea:hover:not(:disabled){border-color:var(--sand-400)}
.ef-textarea:focus{outline:none;border-color:var(--accent);box-shadow:var(--focus-ring)}
.ef-textarea:disabled{background:var(--surface-sunken);color:var(--text-muted);cursor:not-allowed}
.ef-textarea--invalid{border-color:var(--danger-600)}
.ef-textarea--invalid:focus{box-shadow:var(--focus-ring-danger)}
`;
export function Textarea({ label, hint, error, invalid, style, className, ...rest }) {
  injectEfCss('ef-css-textarea', CSS);
  const bad = invalid || !!error;
  const el = <textarea className={`ef-textarea${bad ? ' ef-textarea--invalid' : ''}`} aria-invalid={bad || undefined} {...rest} />;
  if (!label && !hint && !error) return React.cloneElement(el, { style, className: el.props.className + (className ? ' ' + className : '') });
  return (
    <label className={`ef-field${className ? ' ' + className : ''}`} style={style}>
      {label ? <span className="ef-field__label">{label}</span> : null}
      {el}
      {error ? <span className="ef-field__error"><Icon name="circle-alert" size={12} />{error}</span> : hint ? <span className="ef-field__hint">{hint}</span> : null}
    </label>
  );
}
