import React from 'react';
import { injectEfCss } from './Button.jsx';

const CSS = `
.ef-field-set{min-width:0;margin:0;padding:0;border:0;display:grid;gap:14px}
.ef-field-legend{padding:0;color:var(--text-primary);font-size:var(--text-lg);font-weight:var(--weight-semibold)}
.ef-field-legend[data-variant="label"]{font-size:var(--text-sm)}
.ef-field-group{display:grid;gap:18px}
.ef-field{display:flex;min-width:0;gap:6px;color:var(--text-primary)}
.ef-field[data-orientation="vertical"]{flex-direction:column}
.ef-field[data-orientation="horizontal"]{align-items:flex-start;flex-direction:row;gap:12px}
.ef-field[data-orientation="responsive"]{flex-direction:column}
@media (min-width: 640px){.ef-field[data-orientation="responsive"]{align-items:flex-start;flex-direction:row;gap:18px}.ef-field[data-orientation="responsive"]>.ef-field-content{flex:1}}
.ef-field-content{display:flex;min-width:0;flex:1;flex-direction:column;gap:4px}
.ef-field-label,.ef-field-title{color:var(--text-primary);font-size:var(--text-sm);font-weight:var(--weight-semibold);line-height:1.35}
.ef-field-label{display:flex;align-items:center;gap:8px;cursor:pointer}
.ef-field[data-disabled] .ef-field-label{cursor:not-allowed;opacity:.55}
.ef-field-description{margin:0;color:var(--text-muted);font-size:var(--text-xs);line-height:1.45}
.ef-field-error{margin:0;color:var(--danger-600);font-size:var(--text-xs);line-height:1.45}
.ef-field-separator{display:flex;align-items:center;gap:10px;color:var(--text-muted);font-size:var(--text-xs)}
.ef-field-separator::before,.ef-field-separator::after{content:"";height:1px;flex:1;background:var(--border-default)}
.ef-field[data-invalid] .ef-field-label,.ef-field[data-invalid] .ef-field-title{color:var(--danger-600)}
`;
const FieldCtx = React.createContext(null);

export function useFieldProps(own = {}) {
  const ctx = React.useContext(FieldCtx);
  const invalid = !!(own.invalid || own.error || ctx?.invalid);
  const required = own.required != null ? !!own.required : !!ctx?.required;
  const controlProps = {};
  if (own.id) controlProps.id = own.id;
  if (own['aria-describedby']) controlProps['aria-describedby'] = own['aria-describedby'];
  if (invalid) controlProps['aria-invalid'] = true;
  if (required) controlProps['aria-required'] = true;
  return { inField: !!ctx, id: own.id || null, invalid, required, controlProps };
}

function slot(Component, name, base) {
  return React.forwardRef(function FieldSlot({ className, ...props }, ref) {
    injectEfCss('ef-css-field', CSS);
    return <Component {...props} ref={ref} data-slot={name} className={`${base}${className ? ` ${className}` : ''}`} />;
  });
}

export const Field = React.forwardRef(function Field({ orientation = 'vertical', className, ...props }, ref) {
  injectEfCss('ef-css-field', CSS);
  const value = React.useMemo(() => ({ invalid: !!props['data-invalid'], required: !!props['data-required'] }), [props['data-invalid'], props['data-required']]);
  return <FieldCtx.Provider value={value}><div {...props} ref={ref} role="group" data-slot="field" data-orientation={orientation} className={`ef-field${className ? ` ${className}` : ''}`} /></FieldCtx.Provider>;
});

export const FieldSet = slot('fieldset', 'field-set', 'ef-field-set');
export const FieldGroup = slot('div', 'field-group', 'ef-field-group');
export const FieldContent = slot('div', 'field-content', 'ef-field-content');
export const FieldLabel = slot('label', 'field-label', 'ef-field-label');
export const FieldTitle = slot('div', 'field-title', 'ef-field-title');
export const FieldDescription = slot('p', 'field-description', 'ef-field-description');

export const FieldLegend = React.forwardRef(function FieldLegend({ variant = 'legend', className, ...props }, ref) {
  injectEfCss('ef-css-field', CSS);
  return <legend {...props} ref={ref} data-slot="field-legend" data-variant={variant} className={`ef-field-legend${className ? ` ${className}` : ''}`} />;
});

export const FieldSeparator = React.forwardRef(function FieldSeparator({ children, className, ...props }, ref) {
  injectEfCss('ef-css-field', CSS);
  return <div {...props} ref={ref} role="separator" data-slot="field-separator" className={`ef-field-separator${className ? ` ${className}` : ''}`}>{children ? <span>{children}</span> : null}</div>;
});

export const FieldError = React.forwardRef(function FieldError({ children, errors, className, ...props }, ref) {
  injectEfCss('ef-css-field', CSS);
  const messages = (errors || []).map(error => error?.message).filter(Boolean);
  if (!children && !messages.length) return null;
  return (
    <div {...props} ref={ref} role="alert" data-slot="field-error" className={`ef-field-error${className ? ` ${className}` : ''}`}>
      {children || (messages.length === 1 ? messages[0] : <ul>{[...new Set(messages)].map(message => <li key={message}>{message}</li>)}</ul>)}
    </div>
  );
});
