'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';
import { useFieldProps } from './Field.jsx';

const CSS = `
.ef-field{display:flex;flex-direction:column;gap:var(--space-2)}
.ef-field__label{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-field__hint{font-size:var(--text-xs);color:var(--text-muted)}
.ef-field__error{font-size:var(--text-xs);color:var(--status-danger-text);display:flex;align-items:center;gap:var(--space-1)}
.ef-input{position:relative;display:flex;align-items:center}
.ef-input__el{width:100%;height:var(--control-h-md);padding:0 var(--space-3);border:1px solid var(--border-control,var(--border-strong));border-radius:var(--radius-sm);background:var(--surface-sunken);color:var(--text-primary);font-family:var(--font-sans);font-size:var(--text-md);transition:border-color var(--dur-fast) var(--ease-enter),box-shadow var(--dur-fast) var(--ease-enter)}
.ef-input__el::placeholder{color:var(--text-muted)}
.ef-input__el.ef-glass{background-color:color-mix(in srgb,var(--material-tint) calc(var(--material-clear) * 100%),transparent);border-color:var(--border-control,var(--border-strong));border-radius:var(--radius-full)}
.ef-input__el:hover:not(:disabled){border-color:var(--border-control-hover)}
.ef-input__el:focus-visible{outline:2px solid transparent;border-color:var(--accent);box-shadow:var(--focus-ring)}
.ef-input__el:disabled{background:var(--surface-subtle);color:var(--text-muted);cursor:not-allowed;opacity:.5}
.ef-file-input{position:relative;display:flex;width:100%;height:var(--control-h-md);align-items:center;gap:var(--space-3);padding:var(--space-1) var(--space-3) var(--space-1) var(--space-1);overflow:hidden;border:1px solid var(--border-control,var(--border-strong));border-radius:var(--radius-sm);background:var(--surface-sunken);color:var(--text-muted);font-family:var(--font-sans);font-size:var(--text-md);transition:border-color var(--dur-fast) var(--ease-enter),box-shadow var(--dur-fast) var(--ease-enter)}
.ef-file-input:hover{border-color:var(--border-control-hover)}.ef-file-input:focus-within{border-color:var(--accent);box-shadow:var(--focus-ring)}.ef-file-input:has(.ef-input__el:disabled){background:var(--surface-subtle);cursor:not-allowed;opacity:.5}
.ef-file-input__button{display:inline-flex;height:var(--control-h-sm);align-items:center;gap:var(--space-2);padding-inline:var(--space-3);border-radius:var(--radius-sm);background:var(--accent);color:var(--accent-contrast);font-size:var(--text-sm);font-weight:var(--weight-semibold);white-space:nowrap;transition:background var(--dur-fast) var(--ease-enter),transform var(--dur-base) var(--ease-emphasised)}
.ef-file-input:hover:not(:has(.ef-input__el:disabled)) .ef-file-input__button{background:var(--accent-hover)}.ef-file-input:active:not(:has(.ef-input__el:disabled)) .ef-file-input__button{background:var(--accent-active);transform:scale(.985)}
.ef-file-input__name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ef-file-input>.ef-input__el[type="file"]{position:absolute;inset:0;width:100%;height:100%;padding:0;border:0;opacity:0;cursor:pointer}.ef-file-input>.ef-input__el[type="file"]:disabled{cursor:not-allowed}
.ef-input__el--sm{height:var(--control-h-sm);padding-inline:var(--space-3);font-size:var(--text-sm)}
.ef-input__el--lg{height:var(--control-h-lg);padding-inline:var(--space-4);font-size:var(--text-lg)}
.ef-input--icon .ef-input__el{padding-inline-start:calc(var(--space-3) + var(--icon-md) + var(--space-2))}
.ef-input--icon .ef-input__el--sm{padding-inline-start:calc(var(--space-2) + var(--icon-md) + var(--space-2))}
.ef-input--icon .ef-input__el--lg{padding-inline-start:calc(var(--space-3) + var(--icon-lg) + var(--space-2))}
.ef-input__icon{position:absolute;inset-inline-start:11px;color:var(--text-muted);display:inline-flex;pointer-events:none}
.ef-input__reveal{position:absolute;inset-inline-end:var(--space-1);display:inline-flex;align-items:center;justify-content:center;width:var(--control-h-sm);height:var(--control-h-sm);padding:0;border:none;border-radius:var(--radius-sm);background:none;color:var(--text-muted);cursor:pointer}
.ef-input__reveal:hover{color:var(--text-primary)}
.ef-input__reveal:focus-visible{outline:2px solid transparent;box-shadow:var(--focus-ring)}
.ef-input--reveal .ef-input__el{padding-inline-end:calc(var(--space-1) + var(--control-h-sm) + var(--space-1))}


.ef-input__el[aria-invalid="true"]{border-color:var(--status-danger-solid)}
.ef-input__el[aria-invalid="true"]:focus-visible{box-shadow:var(--focus-ring-danger)}
/* Touch: fixed-size targets grow to --tap-min; small glyph buttons keep their look and get a centred --tap-min hit area instead. */
@media (pointer:coarse){.ef-input__reveal::before{content:"";position:absolute;inset:calc(50% - var(--tap-min) / 2)}}
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
  glass,
  ...rest
}, ref) {
  injectEfCss('ef-css-input', CSS);
  const uid = React.useId();
  const [revealed, setRevealed] = React.useState(false);
  const [fileName, setFileName] = React.useState('No file chosen');
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
      className={classes('ef-input__el', customSize !== 'md' && `ef-input__el--${customSize}`, glass && 'ef-glass ef-glass--clear', className)}
      {...(rest.type === 'file' ? null : { style })}
      onChange={rest.type === 'file' ? (event) => {
        setFileName(event.currentTarget.files?.[0]?.name || 'No file chosen');
        rest.onChange?.(event);
      } : rest.onChange}
    />
  );
  const decorated = rest.type === 'file'
    ? (
      <span className="ef-file-input" style={style}>
        {input}
        <span className="ef-file-input__button" aria-hidden="true"><Icon name="upload" size={16} />Choose file</span>
        <span className="ef-file-input__name" aria-hidden="true">{fileName}</span>
      </span>
    )
    : iconLeft || showToggle
    ? (
      <span className={classes('ef-input', iconLeft && 'ef-input--icon', showToggle && 'ef-input--reveal')}>
        {iconLeft ? <span className="ef-input__icon" aria-hidden="true"><Icon name={iconLeft} size={customSize === 'lg' ? 20 : 16} /></span> : null}
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
