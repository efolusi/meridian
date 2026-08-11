import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from './Button.jsx';
import { useFieldProps } from './FormField.jsx';

const CSS = `
.ef-check{display:inline-flex;align-items:flex-start;gap:10px;user-select:none}
.ef-check--disabled{opacity:.45;cursor:not-allowed}
.ef-check__input{position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none}
.ef-check__box{display:inline-flex;align-items:center;justify-content:center;flex:none;width:18px;height:18px;margin-top:1px;padding:0;border:1.5px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);color:var(--accent-contrast);cursor:pointer;transition:background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out),transform var(--dur-med) var(--ease-spring)}
.ef-check__box svg{opacity:0;transform:scale(.5);transition:opacity var(--dur-fast) var(--ease-out),transform var(--dur-med) var(--ease-spring)}
.ef-check__box[data-state="checked"],.ef-check__box[data-state="indeterminate"]{background:var(--accent);border-color:var(--accent)}
.ef-check__box[data-state="checked"] svg,.ef-check__box[data-state="indeterminate"] svg{opacity:1;transform:scale(1)}
.ef-check__box:active:not(:disabled){transform:scale(.95)}
.ef-check__box:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-check__box[aria-invalid="true"]{border-color:var(--danger-600)}
.ef-check__label{font-size:var(--text-md);color:var(--text-primary);line-height:1.4;cursor:pointer}
.ef-check__desc{display:block;font-size:var(--text-sm);color:var(--text-muted)}
`;

function stateName(value) {
  return value === 'indeterminate' ? 'indeterminate' : value ? 'checked' : 'unchecked';
}

export const Checkbox = React.forwardRef(function Checkbox({
  checked,
  defaultChecked = false,
  onCheckedChange,
  onChange,
  label,
  description,
  disabled,
  name,
  value = 'on',
  required,
  form,
  id,
  style,
  className,
  'aria-describedby': ariaDescribedBy,
  'aria-labelledby': ariaLabelledBy,
  'aria-invalid': ariaInvalid,
  onClick,
  ...rest
}, ref) {
  injectEfCss('ef-css-check', CSS);
  const uid = React.useId();
  const controlled = checked !== undefined;
  const [internal, setInternal] = React.useState(defaultChecked);
  const current = controlled ? checked : internal;
  const state = stateName(current);
  const field = useFieldProps({ id, required, 'aria-describedby': ariaDescribedBy, invalid: ariaInvalid });
  const controlId = field.id || id;
  const labelId = label ? `${uid}l` : undefined;
  const descriptionId = description ? `${uid}d` : undefined;
  const describedBy = [...new Set([field.controlProps['aria-describedby'], ariaDescribedBy, descriptionId].filter(Boolean))].join(' ') || undefined;
  const hiddenRef = React.useRef(null);

  React.useEffect(() => {
    if (hiddenRef.current) hiddenRef.current.indeterminate = current === 'indeterminate';
  }, [current]);

  const update = (next) => {
    if (!controlled) setInternal(next);
    onCheckedChange?.(next);
  };
  const toggle = () => {
    if (!disabled) hiddenRef.current?.click();
  };

  return (
    <span className={`ef-check${disabled ? ' ef-check--disabled' : ''}`} style={style}>
      <input
        ref={hiddenRef}
        className="ef-check__input"
        type="checkbox"
        aria-hidden="true"
        tabIndex={-1}
        name={name}
        value={value}
        required={required}
        disabled={disabled}
        form={form}
        checked={current === true}
        onChange={(event) => {
          update(event.target.checked);
          onChange?.(event);
        }}
      />
      <button
        {...rest}
        {...field.controlProps}
        ref={ref}
        id={controlId}
        type="button"
        role="checkbox"
        data-slot="checkbox"
        data-state={state}
        aria-checked={current === 'indeterminate' ? 'mixed' : !!current}
        aria-labelledby={ariaLabelledBy || labelId}
        aria-describedby={describedBy}
        aria-invalid={ariaInvalid || field.invalid || undefined}
        aria-required={required || field.required || undefined}
        disabled={disabled}
        className={`ef-check__box${className ? ' ' + className : ''}`}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) toggle();
        }}
      >
        <Icon name={current === 'indeterminate' ? 'minus' : 'check'} size={13} strokeWidth={3} />
      </button>
      {label ? (
        <span className="ef-check__label" onClick={toggle}>
          <span id={labelId}>{label}</span>
          {description ? <span id={descriptionId} className="ef-check__desc">{description}</span> : null}
        </span>
      ) : null}
    </span>
  );
});
