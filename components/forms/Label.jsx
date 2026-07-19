import React from 'react';
import { injectEfCss } from './Button.jsx';
const CSS = `
.ef-label{display:inline-flex;align-items:baseline;gap:5px;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:600;color:var(--text-primary)}
.ef-label__req{color:var(--danger-600);font-weight:600}
.ef-label__hint{font-weight:400;color:var(--text-muted);font-size:12.5px}
`;
export function Label({ htmlFor, required, hint, children, style, className, ...rest }) {
  injectEfCss('ef-css-label', CSS);
  return (
    <label {...rest} htmlFor={htmlFor} className={`ef-label${className ? ' ' + className : ''}`} style={style}>
      {children}
      {required ? <span className="ef-label__req" aria-hidden="true">*</span> : null}
      {hint ? <span className="ef-label__hint">{hint}</span> : null}
    </label>
  );
}
