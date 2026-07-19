import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from './Button.jsx';
const CSS = `
.ef-field{display:flex;flex-direction:column;gap:6px}
.ef-field__label{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-field__req{color:var(--danger-600);margin-left:2px}
.ef-field__hint{font-size:var(--text-xs);color:var(--text-muted)}
.ef-field__error{font-size:var(--text-xs);color:var(--danger-600);display:flex;align-items:center;gap:4px}
`;

// Module-private, never exported: a control outside a FormField simply sees
// null and behaves standalone. Same shape as GroupCtx in Toggle.jsx.
const FieldCtx = React.createContext(null);

/**
 * How a control joins an enclosing FormField.
 *
 * Lowercase, so it stays off the public namespace. That is deliberate: no
 * consumer needs it — design-system controls are wired by their own props, and
 * anything else is wired through FormField's render prop — and keeping it
 * unreachable stops a seventh field dialect being invented in a showcase.
 */
export function useFieldProps(own = {}) {
  const ctx = React.useContext(FieldCtx);
  const invalid = !!(own.invalid || own.error || (ctx && ctx.invalid));
  const required = own.required != null ? !!own.required : !!(ctx && ctx.required);
  const describedBy = [own['aria-describedby'], ctx && ctx.describedBy].filter(Boolean).join(' ');
  const id = own.id || (ctx && ctx.id) || undefined;
  // Keys are added conditionally, never assigned undefined: a control spreads
  // {...rest} and then {...controlProps}, and an always-present key would reset
  // a caller's own aria-invalid back to absent.
  const controlProps = {};
  if (id) controlProps.id = id;
  if (describedBy) controlProps['aria-describedby'] = describedBy;
  if (invalid) controlProps['aria-invalid'] = true;
  if (required) controlProps['aria-required'] = true;
  return { inField: !!ctx, id: id || null, invalid, required, controlProps };
}

/**
 * Label, hint, error and required chrome around any control, and the owner of
 * the id that ties them together.
 *
 * Wrap a control as children and design-system controls pick the wiring up
 * automatically. For anything else — a third-party input, a control with no
 * label prop — pass a function and spread the wiring yourself.
 */
export function FormField({ label, hint, error, invalid, required, group, id, children, style, className, ...rest }) {
  injectEfCss('ef-css-field', CSS);
  const uid = React.useId();
  const controlId = id || uid + 'c';
  const labelId = uid + 'l';
  const noteId = uid + 'n';
  const hasError = error != null && error !== false && error !== '';
  const hasHint = !hasError && hint != null && hint !== false && hint !== '';
  const note = hasError ? 'error' : hasHint ? 'hint' : null;
  const bad = !!(invalid || hasError);

  const ctx = React.useMemo(() => ({
    // In group mode no single child owns the id — five radios cannot share one —
    // so the group element carries the label and description instead.
    id: group ? null : controlId,
    describedBy: note && !group ? noteId : undefined,
    invalid: bad,
    required: !!required,
  }), [group, controlId, note, noteId, bad, required]);

  const wiring = React.useMemo(() => {
    const p = {};
    if (ctx.id) p.id = ctx.id;
    if (ctx.describedBy) p['aria-describedby'] = ctx.describedBy;
    if (bad) p['aria-invalid'] = true;
    if (required) p['aria-required'] = true;
    return { id: ctx.id, invalid: bad, required: !!required, controlProps: p };
  }, [ctx, bad, required]);

  const star = required ? <span className="ef-field__req" aria-hidden="true">*</span> : null;

  return (
    <div {...rest}
      role={group ? 'group' : undefined}
      aria-labelledby={group && label ? labelId : undefined}
      aria-describedby={group && note ? noteId : undefined}
      className={`ef-field${className ? ' ' + className : ''}`} style={style}>
      {label ? (group
        ? <span id={labelId} className="ef-field__label">{label}{star}</span>
        : <label htmlFor={controlId} className="ef-field__label">{label}{star}</label>) : null}
      <FieldCtx.Provider value={ctx}>
        {typeof children === 'function' ? children(wiring) : children}
      </FieldCtx.Provider>
      {hasError
        ? <span id={noteId} className="ef-field__error"><Icon name="circle-alert" size={13} />{error}</span>
        : hasHint
          ? <span id={noteId} className="ef-field__hint">{hint}</span>
          : null}
    </div>
  );
}
