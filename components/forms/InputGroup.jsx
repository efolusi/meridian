import React from 'react';
import { injectEfCss } from './Button.jsx';
import { useFieldProps } from './FormField.jsx';
const CSS = `
.ef-igroup{display:flex;flex-direction:column;gap:6px;width:100%}
.ef-igroup__label{font-size:var(--text-sm);font-weight:600;color:var(--text-primary)}
.ef-igroup__row{display:flex;align-items:stretch;width:100%;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);transition:box-shadow var(--dur-fast) var(--ease-out)}
.ef-igroup__row:focus-within{box-shadow:var(--focus-ring)}
.ef-igroup--invalid .ef-igroup__row{border-color:var(--danger-600)}
.ef-igroup__addon{display:flex;align-items:center;gap:6px;padding:0 11px;background:var(--surface-sunken);color:var(--text-muted);font-size:var(--text-sm);white-space:nowrap;flex:none}
.ef-igroup__addon--lead{border-right:1px solid var(--border-default);border-radius:calc(var(--radius-sm) - 1px) 0 0 calc(var(--radius-sm) - 1px)}
.ef-igroup__addon--trail{border-left:1px solid var(--border-default);border-radius:0 calc(var(--radius-sm) - 1px) calc(var(--radius-sm) - 1px) 0}
.ef-igroup__addon--bare{background:none;border:none;padding:0 4px}
.ef-igroup__input{flex:1;min-width:0;height:34px;padding:0 11px;border:none;background:transparent;font-family:var(--font-sans);font-size:var(--text-md);color:var(--text-primary)}
.ef-igroup__input:focus{outline:none}
.ef-igroup__input::placeholder{color:var(--text-muted)}
.ef-igroup--sm .ef-igroup__input{height:26px;font-size:var(--text-sm)}
.ef-igroup--lg .ef-igroup__input{height:42px}
.ef-igroup__note{font-size:12.5px;color:var(--text-muted)}
.ef-igroup__note--error{color:var(--danger-600)}
`;
export function InputGroup({ label, hint, error, prefix, suffix, size = 'md', style, className, ...rest }) {
  injectEfCss('ef-css-igroup', CSS);
  // Picks up id / aria wiring when nested in a FormField; standalone this is a no-op.
  const field = useFieldProps({ error, id: rest.id, 'aria-describedby': rest['aria-describedby'] });
  const addon = (node, where) => node == null ? null : (
    <span className={`ef-igroup__addon ef-igroup__addon--${where}${typeof node !== 'string' ? ' ef-igroup__addon--bare' : ''}`}>{node}</span>
  );
  return (
    <label className={`ef-igroup ef-igroup--${size}${error ? ' ef-igroup--invalid' : ''}${className ? ' ' + className : ''}`} style={style}>
      {label ? <span className="ef-igroup__label">{label}</span> : null}
      <span className="ef-igroup__row">
        {addon(prefix, 'lead')}
        <input className="ef-igroup__input" aria-invalid={field.invalid || undefined} {...rest} {...field.controlProps} />
        {addon(suffix, 'trail')}
      </span>
      {error ? <span className="ef-igroup__note ef-igroup__note--error">{error}</span> : hint ? <span className="ef-igroup__note">{hint}</span> : null}
    </label>
  );
}
