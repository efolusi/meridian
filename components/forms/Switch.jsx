import React from 'react';
import { injectEfCss } from './Button.jsx';
import { useFieldProps } from './Field.jsx';
const CSS = `
.ef-switch-field{display:inline-flex;align-items:center;gap:10px;cursor:pointer;user-select:none}.ef-switch{--ef-switch-shift:15px;position:relative;display:inline-flex;flex:none;width:36px;height:21px;padding:0;border:0;border-radius:var(--radius-full);background:var(--border-strong);cursor:pointer;transition:background var(--dur-med) var(--ease-out)}
.ef-switch--disabled{opacity:.45;cursor:not-allowed}
.ef-switch:dir(rtl){--ef-switch-shift:-15px}.ef-switch[data-state="checked"]{background:var(--accent)}
.ef-switch__track::after{content:'';position:absolute;top:2.5px;inset-inline-start:2.5px;width:16px;height:16px;border-radius:var(--radius-full);background:var(--surface-card);box-shadow:var(--shadow-sm);transition:transform var(--dur-med) var(--ease-spring)}
.ef-switch[data-state="checked"] .ef-switch__track::after{transform:translateX(var(--ef-switch-shift))}.ef-switch:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-switch--sm{--ef-switch-shift:12px;width:30px;height:18px}.ef-switch--sm:dir(rtl){--ef-switch-shift:-12px}.ef-switch--sm .ef-switch__track::after{width:13px;height:13px;top:2.5px}
.ef-switch__label{font-size:var(--text-md);color:var(--text-primary)}
`;
export const Switch = React.forwardRef(function Switch({ label, size = 'md', disabled, checked: checkedProp, defaultChecked, onCheckedChange, onClick, name, value = 'on', required, style, className, ...rest }, ref) {
  injectEfCss('ef-css-switch', CSS);
  // Picks up id / aria wiring when nested in a Field; standalone this is a no-op.
  const field = useFieldProps({ id: rest.id, 'aria-describedby': rest['aria-describedby'] });
  const [inner, setInner] = React.useState(!!defaultChecked);
  const checked = checkedProp !== undefined ? checkedProp : inner;
  const control = <button ref={ref} type="button" role="switch" aria-checked={checked} aria-required={required || undefined} disabled={disabled} data-slot="switch" data-state={checked ? 'checked' : 'unchecked'} className={`ef-switch ef-switch--${size}${disabled ? ' ef-switch--disabled' : ''}${className ? ' ' + className : ''}`} style={style} onClick={e => { if (onClick) onClick(e); if (!e.defaultPrevented) { const next = !checked; if (checkedProp === undefined) setInner(next); if (onCheckedChange) onCheckedChange(next); } }} {...rest} {...field.controlProps}><span data-slot="switch-thumb" data-state={checked ? 'checked' : 'unchecked'} className="ef-switch__track" /></button>;
  const formValue = name && checked ? <input type="hidden" name={name} value={value} /> : null;
  if (!label) return <>{control}{formValue}</>;
  return <span className="ef-switch-field">{control}<span className="ef-switch__label">{label}</span>{formValue}</span>;
});
