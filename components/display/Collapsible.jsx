import React from 'react';
import { injectEfCss, mergeRefs } from '../forms/Button.jsx';

const CSS = `
.ef-collapsible__trigger{display:flex;align-items:center;gap:8px;width:100%;padding:7px 0;border:none;background:none;cursor:pointer;text-align:start;font-family:var(--font-sans);font-size:var(--text-md);font-weight:600;color:var(--text-primary);border-radius:var(--radius-sm)}
.ef-collapsible__trigger:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-collapsible__trigger:disabled{opacity:.45;cursor:not-allowed}
.ef-collapsible__content[data-state="open"]{opacity:1}
`;

const CollapsibleStateContext = React.createContext(null);

function useCollapsibleState(part) {
  const context = React.useContext(CollapsibleStateContext);
  if (!context) throw new Error(`${part} must be used inside Collapsible`);
  return context;
}

function composeEventHandlers(childHandler, ownHandler) {
  return event => {
    childHandler?.(event);
    if (!event.defaultPrevented) ownHandler?.(event);
  };
}

export const Collapsible = React.forwardRef(function Collapsible({
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  asChild = false,
  children,
  style,
  className,
  ...rest
}, ref) {
  injectEfCss('ef-css-collapsible', CSS);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;
  const contentId = React.useId();
  const setOpen = React.useCallback(next => {
    if (disabled) return;
    const value = typeof next === 'function' ? next(isOpen) : next;
    if (!isControlled) setUncontrolledOpen(value);
    onOpenChange?.(value);
  }, [disabled, isControlled, isOpen, onOpenChange]);
  const state = isOpen ? 'open' : 'closed';
  const context = React.useMemo(() => ({ contentId, disabled, open: isOpen, setOpen }), [contentId, disabled, isOpen, setOpen]);
  const rootProps = {
    ...rest,
    ref,
    'data-slot': 'collapsible',
    'data-state': state,
    'data-disabled': disabled ? '' : undefined,
    className: `ef-collapsible${className ? ' ' + className : ''}`,
    style,
  };
  const root = asChild ? (() => {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ...rootProps,
      ...child.props,
      ref: mergeRefs(ref, child.ref),
      'data-slot': 'collapsible',
      'data-state': state,
      'data-disabled': disabled ? '' : undefined,
      className: `${rootProps.className}${child.props.className ? ' ' + child.props.className : ''}`,
      style: { ...style, ...child.props.style },
    });
  })() : <div {...rootProps}>{children}</div>;

  return <CollapsibleStateContext.Provider value={context}>{root}</CollapsibleStateContext.Provider>;
});

export const CollapsibleTrigger = React.forwardRef(function CollapsibleTrigger({ asChild = false, children, onClick, ...rest }, ref) {
  const context = useCollapsibleState('CollapsibleTrigger');
  const state = context.open ? 'open' : 'closed';
  const props = {
    ...rest,
    ref,
    type: asChild ? undefined : rest.type || 'button',
    'data-slot': 'collapsible-trigger',
    'data-state': state,
    'data-disabled': context.disabled ? '' : undefined,
    'aria-controls': context.contentId,
    'aria-expanded': context.open,
    disabled: context.disabled || undefined,
    onClick: composeEventHandlers(onClick, () => context.setOpen(value => !value)),
  };

  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      ref: mergeRefs(ref, child.ref),
      'data-slot': 'collapsible-trigger',
      'data-state': state,
      'data-disabled': context.disabled ? '' : undefined,
      'aria-controls': context.contentId,
      'aria-expanded': context.open,
      'aria-disabled': context.disabled || undefined,
      onClick: composeEventHandlers(child.props.onClick, props.onClick),
    });
  }

  return <button {...props}>{children}</button>;
});

export const CollapsibleContent = React.forwardRef(function CollapsibleContent({ asChild = false, forceMount = false, children, ...rest }, ref) {
  const context = useCollapsibleState('CollapsibleContent');
  const state = context.open ? 'open' : 'closed';
  if (!forceMount && !context.open) return null;
  const props = {
    ...rest,
    ref,
    id: context.contentId,
    'data-slot': 'collapsible-content',
    'data-state': state,
    'data-disabled': context.disabled ? '' : undefined,
    hidden: !context.open,
    className: `ef-collapsible__content${rest.className ? ' ' + rest.className : ''}`,
    style: rest.style,
  };
  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      ref: mergeRefs(ref, child.ref),
      id: context.contentId,
      'data-slot': 'collapsible-content',
      'data-state': state,
      'data-disabled': context.disabled ? '' : undefined,
      hidden: !context.open,
      className: `${props.className}${child.props.className ? ' ' + child.props.className : ''}`,
      style: { ...rest.style, ...child.props.style },
    });
  }
  return <div {...props}>{children}</div>;
});
