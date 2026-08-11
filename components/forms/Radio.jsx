import React from 'react';
import { injectEfCss } from './Button.jsx';
import { useFieldProps } from './FormField.jsx';
const CSS = `
.ef-radio-group{display:grid;gap:var(--space-3)}
.ef-radio-group[data-orientation="horizontal"]{display:flex;align-items:center;flex-wrap:wrap}
.ef-radio{display:inline-flex;align-items:flex-start;gap:10px;cursor:pointer;user-select:none}
.ef-radio--disabled{opacity:.45;cursor:not-allowed}
.ef-radio__input{position:absolute;opacity:0;width:0;height:0}
.ef-radio__dot{display:inline-flex;align-items:center;justify-content:center;flex:none;width:18px;height:18px;margin-top:1px;border:1.5px solid var(--border-strong);border-radius:var(--radius-full);background:var(--surface-card);transition:border-color var(--dur-fast) var(--ease-out),transform var(--dur-med) var(--ease-spring)}
.ef-radio__dot::after{content:'';width:8px;height:8px;border-radius:var(--radius-full);background:var(--accent);opacity:0;transform:scale(.4);transition:opacity var(--dur-fast) var(--ease-out),transform var(--dur-med) var(--ease-spring)}
.ef-radio__input:checked+.ef-radio__dot{border-color:var(--accent)}
.ef-radio__input:checked+.ef-radio__dot::after{opacity:1;transform:scale(1)}
.ef-radio:active .ef-radio__dot{transform:scale(.95)}
.ef-radio__input:focus-visible+.ef-radio__dot{box-shadow:var(--focus-ring)}
.ef-radio__input[aria-invalid="true"]+.ef-radio__dot{border-color:var(--danger-600)}
.ef-radio__label{font-size:var(--text-md);color:var(--text-primary);line-height:1.4}
.ef-radio__desc{display:block;font-size:var(--text-sm);color:var(--text-muted)}
`;
const RadioGroupContext = React.createContext(null);
export const RadioGroup = React.forwardRef(function RadioGroup({ value: valueProp, defaultValue, onValueChange, name, required, disabled, orientation = 'vertical', className, style, children, ...rest }, ref) {
  injectEfCss('ef-css-radio', CSS);
  const [inner, setInner] = React.useState(defaultValue);
  const value = valueProp !== undefined ? valueProp : inner;
  const generatedName = React.useId();
  const change = next => { if (valueProp === undefined) setInner(next); onValueChange?.(next); };
  return <RadioGroupContext.Provider value={{ value, change, name: name || generatedName, required, disabled }}><div {...rest} ref={ref} role="radiogroup" aria-orientation={orientation} data-slot="radio-group" data-orientation={orientation} data-disabled={disabled ? '' : undefined} className={`ef-radio-group${className ? ' ' + className : ''}`} style={style}>{children}</div></RadioGroupContext.Provider>;
});
export const RadioGroupItem = React.forwardRef(function RadioGroupItem({ value, disabled, onChange, className, style, ...rest }, ref) {
  const group = React.useContext(RadioGroupContext);
  const unavailable = disabled || group?.disabled;
  return <Radio ref={ref} value={value} name={group?.name} required={group?.required} disabled={unavailable} checked={group ? group.value === value : rest.checked} data-disabled={unavailable ? '' : undefined} onChange={e => { if (group) group.change(value); onChange?.(e); }} className={className} style={style} {...rest} />;
});
export const Radio = React.forwardRef(function Radio({ label, description, disabled, style, className, ...rest }, ref) {
  injectEfCss('ef-css-radio', CSS);
  // Picks up id / aria wiring when nested in a FormField; standalone this is a no-op.
  const field = useFieldProps({ id: rest.id, 'aria-describedby': rest['aria-describedby'] });
  return (
    <label className={`ef-radio${disabled ? ' ef-radio--disabled' : ''}${className ? ' ' + className : ''}`} style={style}>
      <input ref={ref} type="radio" data-slot="radio-group-item" data-state={rest.checked ? 'checked' : 'unchecked'} className="ef-radio__input" disabled={disabled} {...rest} {...field.controlProps} />
      <span className="ef-radio__dot" aria-hidden="true"></span>
      {label ? <span className="ef-radio__label">{label}{description ? <span className="ef-radio__desc">{description}</span> : null}</span> : null}
    </label>
  );
});
