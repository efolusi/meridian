import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from './Button.jsx';
import { useFieldProps } from './Field.jsx';

const CSS = `
.ef-field{display:flex;flex-direction:column;gap:6px}
.ef-field__label{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-field__hint{font-size:var(--text-xs);color:var(--text-muted)}
.ef-field__error{font-size:var(--text-xs);color:var(--danger-600);display:flex;align-items:center;gap:4px}
.ef-input{position:relative;display:flex;align-items:center}
.ef-input__el{width:100%;height:var(--control-h-md);padding:0 12px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-sunken);color:var(--text-primary);font-family:var(--font-sans);font-size:var(--text-md);transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-input__el::placeholder{color:var(--text-muted)}
.ef-input__el:hover:not(:disabled){border-color:var(--sand-400)}
.ef-input__el:focus-visible{outline:none;border-color:var(--accent);box-shadow:var(--focus-ring)}
.ef-input__el:disabled{background:var(--surface-subtle);color:var(--text-muted);cursor:not-allowed;opacity:.5}
.ef-input__el[type="file"]{padding-block:7px;line-height:1}
.ef-input__el[type="file"]::file-selector-button{margin-inline-end:10px;border:0;background:transparent;color:var(--text-primary);font:inherit;font-weight:var(--weight-medium)}
.ef-input__el--sm{height:var(--control-h-sm);padding-inline:10px;font-size:var(--text-sm)}
.ef-input__el--lg{height:var(--control-h-lg);padding-inline:14px;font-size:var(--text-lg)}
.ef-input--icon .ef-input__el{padding-inline-start:36px}
.ef-input--icon .ef-input__el--sm{padding-inline-start:32px}
.ef-input--icon .ef-input__el--lg{padding-inline-start:40px}
.ef-input__icon{position:absolute;inset-inline-start:11px;color:var(--text-muted);display:inline-flex;pointer-events:none}
.ef-input__reveal{position:absolute;inset-inline-end:6px;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:none;border-radius:var(--radius-sm);background:none;color:var(--text-muted);cursor:pointer}
.ef-input__reveal:hover{color:var(--text-primary)}
.ef-input__reveal:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-input--reveal .ef-input__el{padding-inline-end:38px}
.ef-input--reveal .ef-input__el--sm{padding-inline-end:34px}
.ef-input--reveal .ef-input__el--lg{padding-inline-end:42px}
.ef-input__el[aria-invalid="true"]{border-color:var(--danger-600)}
.ef-input__el[aria-invalid="true"]:focus-visible{box-shadow:var(--focus-ring-danger)}
`;

function classes(...values) {
  return values.filter(Boolean).join(' ');
}

export const Input = React.forwardRef(function Input({
  label,
  hint,
  error,
  iconLeft,
  size,
  invalid,
  revealable,
  revealLabel = 'Show password',
  hideLabel = 'Hide password',
  style,
  className,
  ...rest
}, ref) {
  injectEfCss('ef-css-input', CSS);
  const uid = React.useId();
  const [revealed, setRevealed] = React.useState(false);
  const customSize = typeof size === 'string' && ['sm', 'md', 'lg'].includes(size) ? size : 'md';
  const nativeSize = typeof size === 'number' ? size : undefined;
  const showToggle = !!(revealable && rest.type === 'password');
  const field = useFieldProps({ invalid, error, id: rest.id, 'aria-describedby': rest['aria-describedby'], required: rest.required });
  const bad = field.invalid;
  const controlId = field.id || rest.id || ((label || hint || error) ? `${uid}c` : undefined);
  const noteId = (hint || error) ? `${uid}n` : undefined;
  const describedBy = [...new Set([field.controlProps['aria-describedby'], rest['aria-describedby'], noteId].filter(Boolean))].join(' ') || undefined;
  const input = (
    <input
      {...rest}
      {...field.controlProps}
      ref={ref}
      id={controlId}
      size={nativeSize}
      data-slot="input"
      aria-describedby={describedBy}
      aria-invalid={bad || rest['aria-invalid'] || undefined}
      type={showToggle && revealed ? 'text' : rest.type}
      className={classes('ef-input__el', customSize !== 'md' && `ef-input__el--${customSize}`, className)}
      style={style}
    />
  );
  const decorated = iconLeft || showToggle
    ? (
      <span className={classes('ef-input', iconLeft && 'ef-input--icon', showToggle && 'ef-input--reveal')}>
        {iconLeft ? <span className="ef-input__icon" aria-hidden="true"><Icon name={iconLeft} size={customSize === 'lg' ? 18 : 16} /></span> : null}
        {input}
        {showToggle ? (
          <button
            type="button"
            className="ef-input__reveal"
            aria-label={revealed ? hideLabel : revealLabel}
            aria-pressed={revealed}
            onClick={() => setRevealed((current) => !current)}
          >
            <Icon name={revealed ? 'eye-off' : 'eye'} size={16} />
          </button>
        ) : null}
      </span>
    )
    : input;

  if (!label && !hint && !error) return decorated;
  return (
    <div className="ef-field">
      {label ? <label className="ef-field__label" htmlFor={controlId}>{label}</label> : null}
      {decorated}
      {error
        ? <span id={noteId} role="alert" className="ef-field__error"><Icon name="circle-alert" size={12} />{error}</span>
        : hint ? <span id={noteId} className="ef-field__hint">{hint}</span> : null}
    </div>
  );
});
