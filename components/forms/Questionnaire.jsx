import React from 'react';
import { injectEfCss } from './Button.jsx';

const CSS = `
.ef-questionnaire{display:grid;gap:var(--space-5)}
.ef-questionnaire__progress{font-family:var(--font-mono);font-size:var(--text-sm);color:var(--text-muted)}
.ef-questionnaire__item{min-width:0;margin:0;padding:0;border:0;display:grid;gap:var(--space-3)}
.ef-questionnaire__title{padding:0;font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-questionnaire__description{margin:calc(var(--space-2) * -1) 0 0;color:var(--text-secondary);font-size:var(--text-md)}
.ef-questionnaire__choices{display:grid;gap:var(--space-2)}
.ef-questionnaire__choice{position:relative;display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);color:var(--text-primary);cursor:pointer;transition:border-color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-questionnaire__choice:hover{border-color:var(--border-strong);background:var(--surface-sunken)}
.ef-questionnaire__choice:has(input:checked){border-color:var(--accent);background:var(--accent-subtle)}
.ef-questionnaire__choice:has(input:focus-visible){box-shadow:var(--focus-ring)}
.ef-questionnaire__choice:has(input:disabled){opacity:.45;cursor:not-allowed}
.ef-questionnaire__choice input{width:16px;height:16px;margin:2px 0 0;accent-color:var(--accent);flex:none}
.ef-questionnaire__choice-label{display:grid;gap:2px;flex:1;min-width:0}
.ef-questionnaire__shortcut{font-family:var(--font-mono);font-size:var(--text-xs);color:var(--text-muted)}
.ef-questionnaire__input{width:100%;min-height:var(--control-h-md);padding:0 var(--space-3);border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);color:var(--text-primary);font:inherit;outline:none}
.ef-questionnaire__input:focus-visible{border-color:var(--accent);box-shadow:var(--focus-ring)}
.ef-questionnaire__error{font-size:var(--text-sm);color:var(--danger-600)}
.ef-questionnaire__actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:var(--space-2)}
.ef-questionnaire__button{min-height:var(--control-h-md);padding:0 var(--space-4);border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);color:var(--text-primary);font:inherit;font-weight:var(--weight-medium);cursor:pointer}
.ef-questionnaire__button[data-primary]{border-color:var(--brand-950);background:var(--brand-950);color:var(--text-inverse)}
.ef-questionnaire__button:disabled{opacity:.45;cursor:not-allowed}
`;

const RootContext = React.createContext(null);
const ItemContext = React.createContext(null);
const ChoiceContext = React.createContext(null);
const join = (...parts) => parts.filter(Boolean).join(' ');

function enabledItems(items) { return (items || []).filter(item => !item.disabled); }

export const Questionnaire = React.forwardRef(function Questionnaire({ items = [], item: itemProp, defaultItem, onItemChange, shortcuts, onSubmit, onReset, className, children, ...rest }, ref) {
  injectEfCss('ef-css-questionnaire', CSS);
  const formRef = React.useRef(null);
  const mergedRef = node => { formRef.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; };
  const available = React.useMemo(() => enabledItems(items), [items]);
  const first = defaultItem || available[0]?.name;
  const [innerItem, setInnerItem] = React.useState(first);
  const activeItem = itemProp !== undefined ? itemProp : innerItem;
  const [statuses, setStatuses] = React.useState({});
  const [invalid, setInvalid] = React.useState({});

  React.useEffect(() => {
    if (!activeItem && available[0]) setInnerItem(available[0].name);
  }, [activeItem, available]);

  const setItem = React.useCallback(next => {
    if (!next) return;
    if (itemProp === undefined) setInnerItem(next);
    onItemChange?.(next);
    requestAnimationFrame(() => [...(formRef.current?.querySelectorAll('[data-questionnaire-item]') || [])].find(node => node.getAttribute('data-questionnaire-item') === next)?.focus());
  }, [itemProp, onItemChange]);

  const index = Math.max(0, available.findIndex(entry => entry.name === activeItem));
  const validate = React.useCallback(name => {
    if (statuses[name] === 'skipped') return true;
    const controls = [...(formRef.current?.elements || [])].filter(control => control.name === name && !control.disabled);
    const valid = controls.some(control => (control.type === 'checkbox' || control.type === 'radio') ? control.checked : String(control.value || '').trim());
    setInvalid(state => ({ ...state, [name]: !valid }));
    if (!valid) requestAnimationFrame(() => controls[0]?.focus());
    return valid;
  }, [available, statuses]);

  const move = delta => {
    if (delta > 0 && !validate(activeItem)) return;
    setItem(available[index + delta]?.name);
  };
  const answer = (name, answered) => {
    const status = answered ? 'answered' : 'unanswered';
    setStatuses(state => ({ ...state, [name]: status }));
    if (answered) setInvalid(state => ({ ...state, [name]: false }));
  };
  const skip = () => {
    setStatuses(state => ({ ...state, [activeItem]: 'skipped' }));
    setInvalid(state => ({ ...state, [activeItem]: false }));
    if (available[index + 1]) setItem(available[index + 1].name);
  };
  const submit = event => {
    const firstInvalid = available.find(entry => !validate(entry.name));
    if (firstInvalid) { event.preventDefault(); setItem(firstInvalid.name); return; }
    onSubmit?.(event);
  };
  const reset = event => {
    setStatuses({}); setInvalid({});
    if (itemProp === undefined) setInnerItem(first);
    onReset?.(event);
  };
  const onKeyDown = event => {
    if (!shortcuts || event.metaKey || event.ctrlKey || event.altKey || /input|textarea|select/i.test(event.target.tagName)) return;
    const keyIndex = shortcuts === 'letters' ? event.key.toLowerCase().charCodeAt(0) - 97 : Number(event.key) - 1;
    if (keyIndex < 0) return;
    const controls = [...(formRef.current?.elements || [])].filter(control => control.name === activeItem && !control.disabled && /radio|checkbox/.test(control.type));
    if (controls[keyIndex]) { event.preventDefault(); controls[keyIndex].click(); }
  };
  const context = { items: available, activeItem, index, statuses, invalid, setItem, move, answer, skip, validate, shortcuts };
  return <RootContext.Provider value={context}><form {...rest} ref={mergedRef} className={join('ef-questionnaire', className)} onSubmit={submit} onReset={reset} onKeyDown={onKeyDown}>{children}</form></RootContext.Provider>;
});

export const QuestionnaireProgress = React.forwardRef(function QuestionnaireProgress({ children, className, ...rest }, ref) {
  const root = React.useContext(RootContext);
  const value = root?.items.length ? root.index + 1 : 0;
  return <div {...rest} ref={ref} role="progressbar" aria-label="Questionnaire progress" aria-valuemin={0} aria-valuemax={root?.items.length || 0} aria-valuenow={value} className={join('ef-questionnaire__progress', className)}>{children ?? `Question ${value} of ${root?.items.length || 0}`}</div>;
});

export const QuestionnaireItem = React.forwardRef(function QuestionnaireItem({ name, required, multiple, disabled, invalid: invalidProp, onStatusChange, className, children, ...rest }, ref) {
  const root = React.useContext(RootContext);
  const active = root?.activeItem === name;
  const status = root?.statuses[name] || 'unanswered';
  React.useEffect(() => { onStatusChange?.(status); }, [onStatusChange, status]);
  const invalid = invalidProp || root?.invalid[name];
  const context = { name, required, multiple, disabled, invalid, status };
  return <ItemContext.Provider value={context}><fieldset {...rest} ref={ref} tabIndex={-1} name={name} disabled={disabled} hidden={!active} aria-required={required || undefined} aria-invalid={invalid || undefined} data-questionnaire-item={name} data-status={status} className={join('ef-questionnaire__item', className)}>{children}</fieldset></ItemContext.Provider>;
});

export const QuestionnaireTitle = React.forwardRef(function QuestionnaireTitle({ className, ...rest }, ref) { return <legend {...rest} ref={ref} className={join('ef-questionnaire__title', className)} />; });
export const QuestionnaireDescription = React.forwardRef(function QuestionnaireDescription({ className, ...rest }, ref) { return <p {...rest} ref={ref} className={join('ef-questionnaire__description', className)} />; });
export const QuestionnaireChoices = React.forwardRef(function QuestionnaireChoices({ className, ...rest }, ref) { return <div {...rest} ref={ref} className={join('ef-questionnaire__choices', className)} />; });

export const QuestionnaireChoice = React.forwardRef(function QuestionnaireChoice({ value, checked, defaultChecked, disabled, onChange, className, children, ...rest }, ref) {
  const root = React.useContext(RootContext); const item = React.useContext(ItemContext);
  const inputRef = React.useRef(null);
  const mergedRef = node => { inputRef.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; };
  const controls = item?.name ? [...(root?.items.find(entry => entry.name === item.name)?.choices || [])].filter(choice => !choice.disabled) : [];
  const shortcutIndex = Math.max(0, controls.findIndex(choice => choice.value === value));
  const shortcut = root?.shortcuts === 'letters' ? String.fromCharCode(65 + shortcutIndex) : root?.shortcuts === 'numbers' ? String(shortcutIndex + 1) : '';
  const handleChange = event => {
    if (item?.multiple) {
      const form = event.currentTarget.form;
      const answered = [...(form?.elements || [])].some(control => control.name === item.name && control.checked);
      root?.answer(item.name, answered);
    } else root?.answer(item?.name, event.currentTarget.checked);
    onChange?.(event);
  };
  const context = { shortcut };
  return <ChoiceContext.Provider value={context}><label {...rest} className={join('ef-questionnaire__choice', className)}><input ref={mergedRef} type={item?.multiple ? 'checkbox' : 'radio'} name={item?.name} value={value} checked={checked} defaultChecked={defaultChecked} disabled={disabled || item?.disabled} required={item?.required && !item?.multiple} aria-invalid={item?.invalid || undefined} onChange={handleChange} /><span className="ef-questionnaire__choice-label">{children}</span>{shortcut ? <span className="ef-questionnaire__shortcut" aria-hidden="true">{shortcut}</span> : null}</label></ChoiceContext.Provider>;
});

export const QuestionnaireInput = React.forwardRef(function QuestionnaireInput({ onChange, className, ...rest }, ref) {
  const root = React.useContext(RootContext); const item = React.useContext(ItemContext);
  return <input {...rest} ref={ref} type="text" name={item?.name} aria-invalid={item?.invalid || undefined} className={join('ef-questionnaire__input', className)} onChange={event => { root?.answer(item?.name, !!event.currentTarget.value.trim()); onChange?.(event); }} />;
});
export const QuestionnaireError = React.forwardRef(function QuestionnaireError({ children, className, ...rest }, ref) { const item = React.useContext(ItemContext); if (!item?.invalid) return null; return <p {...rest} ref={ref} role="alert" className={join('ef-questionnaire__error', className)}>{children || 'Choose an answer to continue.'}</p>; });
export const QuestionnaireActions = React.forwardRef(function QuestionnaireActions({ className, ...rest }, ref) { return <div {...rest} ref={ref} className={join('ef-questionnaire__actions', className)} />; });

const ActionButton = React.forwardRef(function ActionButton({ action, primary, children, className, ...rest }, ref) {
  const root = React.useContext(RootContext);
  const last = root?.index === (root?.items.length || 1) - 1;
  const props = action === 'previous' ? { type: 'button', onClick: () => root?.move(-1), disabled: root?.index <= 0 }
    : action === 'skip' ? { type: 'button', onClick: root?.skip }
    : action === 'next' ? { type: 'button', onClick: () => root?.move(1), hidden: last }
    : { type: 'submit', hidden: !last };
  return <button {...props} {...rest} ref={ref} data-primary={primary ? '' : undefined} className={join('ef-questionnaire__button', className)}>{children}</button>;
});
export const QuestionnairePrevious = React.forwardRef(function QuestionnairePrevious({ children = 'Previous', ...props }, ref) { return <ActionButton {...props} ref={ref} action="previous">{children}</ActionButton>; });
export const QuestionnaireSkip = React.forwardRef(function QuestionnaireSkip({ children = 'Skip', ...props }, ref) { return <ActionButton {...props} ref={ref} action="skip">{children}</ActionButton>; });
export const QuestionnaireNext = React.forwardRef(function QuestionnaireNext({ children = 'Next', ...props }, ref) { return <ActionButton {...props} ref={ref} action="next" primary>{children}</ActionButton>; });
export const QuestionnaireSubmit = React.forwardRef(function QuestionnaireSubmit({ children = 'Submit', ...props }, ref) { return <ActionButton {...props} ref={ref} action="submit" primary>{children}</ActionButton>; });
