import React from 'react';
import { injectEfCss } from './Button.jsx';

const CSS = `
.ef-otp{position:relative;display:inline-flex;align-items:center;cursor:text}
.ef-otp__input{position:absolute;inset:0;width:100%;height:100%;opacity:0;color:transparent;background:transparent;border:0;caret-color:transparent;cursor:text}
.ef-otp__input:focus{outline:none}
.ef-otp[data-disabled]{cursor:not-allowed;opacity:.5}
.ef-otp__group{display:flex;align-items:center}
.ef-otp__slot{position:relative;display:flex;width:40px;height:40px;align-items:center;justify-content:center;border:1px solid var(--border-strong);border-inline-end-width:0;background:var(--surface-card);color:var(--text-primary);font-family:var(--font-mono);font-size:var(--text-md);font-weight:var(--weight-semibold);transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-otp__slot:first-child{border-start-start-radius:var(--radius-md);border-end-start-radius:var(--radius-md)}
.ef-otp__slot:last-child{border-inline-end-width:1px;border-start-end-radius:var(--radius-md);border-end-end-radius:var(--radius-md)}
.ef-otp__slot[data-active]{z-index:1;border-color:var(--accent);box-shadow:var(--focus-ring)}
.ef-otp__slot[aria-invalid="true"]{border-color:var(--danger-600)}
.ef-otp__caret{width:1px;height:18px;background:var(--text-primary);animation:ef-otp-caret 1s step-end infinite}
.ef-otp__separator{display:flex;align-items:center;justify-content:center;width:28px;color:var(--text-muted)}
@keyframes ef-otp-caret{50%{opacity:0}}
@media(prefers-reduced-motion:reduce){.ef-otp__caret{animation:none}}
`;

const InputOTPCtx = React.createContext(null);

function acceptsPattern(value, pattern) {
  if (!pattern || !value) return true;
  try { return new RegExp(`^(?:${pattern})+$`).test(value); } catch { return true; }
}

export const InputOTP = React.forwardRef(function InputOTP({ maxLength, value, defaultValue = '', onChange, onComplete, pattern, disabled, containerClassName, children, className, onFocus, onBlur, ...props }, ref) {
  injectEfCss('ef-css-input-otp', CSS);
  const controlled = value != null;
  const [inner, setInner] = React.useState(() => String(defaultValue).slice(0, maxLength));
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef(null);
  const setInputRef = React.useCallback(element => {
    inputRef.current = element;
    if (typeof ref === 'function') ref(element);
    else if (ref) ref.current = element;
  }, [ref]);
  const current = String(controlled ? value : inner).slice(0, maxLength);
  const commit = nextValue => {
    const next = String(nextValue).slice(0, maxLength);
    if (!acceptsPattern(next, pattern)) return;
    if (!controlled) setInner(next);
    onChange?.(next);
    if (next.length === maxLength) onComplete?.(next);
  };
  const activeIndex = focused ? Math.min(current.length, Math.max(0, maxLength - 1)) : -1;
  const slots = React.useMemo(() => Array.from({ length: maxLength }, (_, index) => ({
    char: current[index] || null,
    hasFakeCaret: index === activeIndex && current.length < maxLength,
    isActive: index === activeIndex,
  })), [activeIndex, current, maxLength]);
  const context = React.useMemo(() => ({ slots }), [slots]);
  return (
    <InputOTPCtx.Provider value={context}>
      <div data-slot="input-otp" data-disabled={disabled ? '' : undefined} className={`ef-otp${containerClassName ? ' ' + containerClassName : ''}`} onClick={() => !disabled && inputRef.current?.focus()}>
        <input {...props} ref={setInputRef} className={`ef-otp__input${className ? ' ' + className : ''}`} value={current} maxLength={maxLength} pattern={pattern} disabled={disabled} autoComplete={props.autoComplete || 'one-time-code'} inputMode={props.inputMode || 'numeric'} onChange={event => commit(event.target.value)} onFocus={event => { setFocused(true); onFocus?.(event); }} onBlur={event => { setFocused(false); onBlur?.(event); }} />
        {children}
      </div>
    </InputOTPCtx.Provider>
  );
});

export const InputOTPGroup = React.forwardRef(function InputOTPGroup({ className, ...props }, ref) {
  return <div {...props} ref={ref} data-slot="input-otp-group" className={`ef-otp__group${className ? ' ' + className : ''}`} />;
});

export const InputOTPSlot = React.forwardRef(function InputOTPSlot({ index, className, ...props }, ref) {
  const slot = React.useContext(InputOTPCtx)?.slots[index] || { char: null, hasFakeCaret: false, isActive: false };
  return <div {...props} ref={ref} data-slot="input-otp-slot" data-active={slot.isActive ? '' : undefined} className={`ef-otp__slot${className ? ' ' + className : ''}`}>{slot.char}{slot.hasFakeCaret ? <span className="ef-otp__caret" aria-hidden="true" /> : null}</div>;
});

export const InputOTPSeparator = React.forwardRef(function InputOTPSeparator({ className, children, ...props }, ref) {
  return <div {...props} ref={ref} role="separator" data-slot="input-otp-separator" className={`ef-otp__separator${className ? ' ' + className : ''}`}>{children || <span aria-hidden="true">−</span>}</div>;
});
