import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss, mergeRefs } from '../forms/Button.jsx';

const CSS = `
.ef-acc{display:flex;flex-direction:column}
.ef-acc[data-orientation="horizontal"]{flex-direction:row}
.ef-acc__item{border-bottom:1px solid var(--border-default)}
.ef-acc__item:first-child{border-top:1px solid var(--border-default)}
.ef-acc__header{display:flex;margin:0}
.ef-acc__trigger{display:flex;align-items:center;gap:10px;width:100%;padding:14px 2px;border:none;background:none;cursor:pointer;text-align:start;font-family:var(--font-sans);font-size:var(--text-md);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-acc__trigger:hover{color:var(--brand-700)}
.ef-acc__trigger:focus-visible{outline:none;box-shadow:var(--focus-ring);border-radius:var(--radius-sm)}
.ef-acc__trigger:disabled{opacity:.45;cursor:not-allowed}
.ef-acc__chev{margin-inline-start:auto;color:var(--text-muted);display:inline-flex;transition:transform var(--dur-med) var(--ease-out)}
.ef-acc__trigger[data-state="open"] .ef-acc__chev{transform:rotate(180deg)}
.ef-acc__content{overflow:hidden;font-size:var(--text-md);line-height:var(--leading-relaxed);color:var(--text-secondary)}
.ef-acc__content-inner{padding:0 2px 16px;max-width:640px}
`;

const AccordionRootContext = React.createContext(null);
const AccordionItemContext = React.createContext(null);

function useAccordionRoot(part) {
  const context = React.useContext(AccordionRootContext);
  if (!context) throw new Error(`${part} must be used inside Accordion`);
  return context;
}

function useAccordionItem(part) {
  const context = React.useContext(AccordionItemContext);
  if (!context) throw new Error(`${part} must be used inside AccordionItem`);
  return context;
}

function composeEventHandlers(childHandler, ownHandler) {
  return event => {
    childHandler?.(event);
    if (!event.defaultPrevented) ownHandler?.(event);
  };
}

export const Accordion = React.forwardRef(function Accordion({
  type,
  value,
  defaultValue,
  onValueChange,
  collapsible = false,
  disabled = false,
  orientation = 'vertical',
  dir = 'ltr',
  loop = true,
  asChild = false,
  children,
  className,
  style,
  ...rest
}, forwardedRef) {
  injectEfCss('ef-css-acc', CSS);
  const resolvedType = type || 'single';
  const initialValue = defaultValue !== undefined ? defaultValue : (resolvedType === 'multiple' ? [] : '');
  const [uncontrolledValue, setUncontrolledValue] = React.useState(initialValue);
  const controlled = value !== undefined;
  const currentValue = controlled ? value : uncontrolledValue;
  const rootRef = React.useRef(null);
  const setValue = React.useCallback(next => {
    if (disabled) return;
    if (!controlled) setUncontrolledValue(next);
    onValueChange?.(next);
  }, [controlled, disabled, onValueChange]);
  const isOpen = React.useCallback(itemValue => resolvedType === 'multiple'
    ? (Array.isArray(currentValue) && currentValue.includes(itemValue))
    : currentValue === itemValue, [currentValue, resolvedType]);
  const toggle = React.useCallback(itemValue => {
    if (resolvedType === 'multiple') {
      const values = Array.isArray(currentValue) ? currentValue : [];
      setValue(values.includes(itemValue) ? values.filter(entry => entry !== itemValue) : [...values, itemValue]);
      return;
    }
    if (currentValue === itemValue) {
      if (collapsible) setValue('');
      return;
    }
    setValue(itemValue);
  }, [collapsible, currentValue, resolvedType, setValue]);
  const moveFocus = React.useCallback((event, trigger) => {
    const triggers = [...rootRef.current.querySelectorAll('[data-slot="accordion-trigger"]:not(:disabled)')];
    const index = triggers.indexOf(trigger);
    if (index < 0 || !triggers.length) return;
    let nextIndex;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = triggers.length - 1;
    else {
      let delta = 0;
      if (orientation === 'vertical' && event.key === 'ArrowDown') delta = 1;
      else if (orientation === 'vertical' && event.key === 'ArrowUp') delta = -1;
      else if (orientation === 'horizontal' && event.key === 'ArrowRight') delta = dir === 'rtl' ? -1 : 1;
      else if (orientation === 'horizontal' && event.key === 'ArrowLeft') delta = dir === 'rtl' ? 1 : -1;
      if (delta) {
        const candidate = index + delta;
        nextIndex = loop ? (candidate + triggers.length) % triggers.length : candidate;
        if (nextIndex < 0 || nextIndex >= triggers.length) return;
      }
    }
    if (nextIndex === undefined) return;
    event.preventDefault();
    triggers[nextIndex].focus();
  }, [dir, loop, orientation]);
  const context = React.useMemo(() => ({ disabled, dir, isOpen, moveFocus, orientation, toggle }), [disabled, dir, isOpen, moveFocus, orientation, toggle]);
  const content = children;
  const rootProps = {
    ...rest,
    ref: mergeRefs(forwardedRef, rootRef),
    dir,
    'data-slot': 'accordion',
    'data-orientation': orientation,
    className: `ef-acc${className ? ' ' + className : ''}`,
    style,
  };
  const root = asChild ? (() => {
    const child = React.Children.only(content);
    return React.cloneElement(child, {
      ...rootProps,
      ...child.props,
      ref: mergeRefs(forwardedRef, rootRef, child.ref),
      dir,
      'data-slot': 'accordion',
      'data-orientation': orientation,
      className: `${rootProps.className}${child.props.className ? ' ' + child.props.className : ''}`,
      style: { ...style, ...child.props.style },
    });
  })() : <div {...rootProps}>{content}</div>;

  return <AccordionRootContext.Provider value={context}>{root}</AccordionRootContext.Provider>;
});

export const AccordionItem = React.forwardRef(function AccordionItem({ value, disabled = false, asChild = false, children, className, ...rest }, ref) {
  const root = useAccordionRoot('AccordionItem');
  const open = root.isOpen(value);
  const itemDisabled = root.disabled || disabled;
  const uid = React.useId();
  const triggerId = `${uid}-trigger`;
  const contentId = `${uid}-content`;
  const state = open ? 'open' : 'closed';
  const context = React.useMemo(() => ({ contentId, disabled: itemDisabled, open, triggerId, value }), [contentId, itemDisabled, open, triggerId, value]);
  const props = {
    ...rest,
    ref,
    'data-slot': 'accordion-item',
    'data-state': state,
    'data-disabled': itemDisabled ? '' : undefined,
    'data-orientation': root.orientation,
    className: `ef-acc__item${className ? ' ' + className : ''}`,
  };
  const item = asChild ? (() => {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      ref: mergeRefs(ref, child.ref),
      'data-slot': 'accordion-item',
      'data-state': state,
      'data-disabled': itemDisabled ? '' : undefined,
      'data-orientation': root.orientation,
      className: `${props.className}${child.props.className ? ' ' + child.props.className : ''}`,
    });
  })() : <div {...props}>{children}</div>;
  return <AccordionItemContext.Provider value={context}>{item}</AccordionItemContext.Provider>;
});

export const AccordionTrigger = React.forwardRef(function AccordionTrigger({ asChild = false, children, onClick, onKeyDown, className, ...rest }, ref) {
  const root = useAccordionRoot('AccordionTrigger');
  const item = useAccordionItem('AccordionTrigger');
  const state = item.open ? 'open' : 'closed';
  const triggerRef = React.useRef(null);
  const props = {
    ...rest,
    ref: mergeRefs(ref, triggerRef),
    id: item.triggerId,
    type: asChild ? undefined : rest.type || 'button',
    'data-slot': 'accordion-trigger',
    'data-state': state,
    'data-disabled': item.disabled ? '' : undefined,
    'data-orientation': root.orientation,
    'aria-controls': item.contentId,
    'aria-expanded': item.open,
    disabled: item.disabled || undefined,
    className: `ef-acc__trigger${className ? ' ' + className : ''}`,
    onClick: composeEventHandlers(onClick, () => root.toggle(item.value)),
    onKeyDown: composeEventHandlers(onKeyDown, event => root.moveFocus(event, triggerRef.current)),
  };
  const trigger = asChild ? (() => {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      ref: mergeRefs(ref, triggerRef, child.ref),
      id: item.triggerId,
      'data-slot': 'accordion-trigger',
      'data-state': state,
      'data-disabled': item.disabled ? '' : undefined,
      'data-orientation': root.orientation,
      'aria-controls': item.contentId,
      'aria-expanded': item.open,
      'aria-disabled': item.disabled || undefined,
      className: `${props.className}${child.props.className ? ' ' + child.props.className : ''}`,
      onClick: composeEventHandlers(child.props.onClick, props.onClick),
      onKeyDown: composeEventHandlers(child.props.onKeyDown, props.onKeyDown),
    });
  })() : <button {...props}>{children}<span className="ef-acc__chev"><Icon name="chevron-down" size={16} /></span></button>;
  return <h3 className="ef-acc__header">{trigger}</h3>;
});

export const AccordionContent = React.forwardRef(function AccordionContent({ asChild = false, forceMount = false, children, className, ...rest }, ref) {
  const root = useAccordionRoot('AccordionContent');
  const item = useAccordionItem('AccordionContent');
  const state = item.open ? 'open' : 'closed';
  if (!forceMount && !item.open) return null;
  const props = {
    ...rest,
    ref,
    id: item.contentId,
    role: 'region',
    'aria-labelledby': item.triggerId,
    'data-slot': 'accordion-content',
    'data-state': state,
    'data-disabled': item.disabled ? '' : undefined,
    'data-orientation': root.orientation,
    hidden: !item.open,
    className: `ef-acc__content${className ? ' ' + className : ''}`,
  };
  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      ref: mergeRefs(ref, child.ref),
      id: item.contentId,
      role: 'region',
      'aria-labelledby': item.triggerId,
      'data-slot': 'accordion-content',
      'data-state': state,
      'data-disabled': item.disabled ? '' : undefined,
      'data-orientation': root.orientation,
      hidden: !item.open,
      className: `${props.className}${child.props.className ? ' ' + child.props.className : ''}`,
    });
  }
  return <div {...props}><div className="ef-acc__content-inner">{children}</div></div>;
});
