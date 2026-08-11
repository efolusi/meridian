import React from 'react';
import { injectEfCss } from './Button.jsx';
import { Icon } from '../icons/Icon.jsx';

const CSS = `
.ef-toggle{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-width:36px;height:36px;padding:0 10px;border:1px solid transparent;border-radius:var(--radius-sm);background:transparent;cursor:pointer;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:500;color:var(--text-secondary);transition:background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.ef-toggle:hover:not(:disabled):not(.ef-toggle--on){background:var(--surface-sunken);color:var(--text-primary)}
.ef-toggle--on{background:var(--accent-subtle);color:var(--brand-700)}
.ef-toggle:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-toggle:disabled{opacity:.45;cursor:not-allowed}
.ef-toggle--outline{border-color:var(--border-strong)}
.ef-toggle--sm{height:32px;min-width:32px;padding:0 8px;font-size:var(--text-xs)}
.ef-toggle--lg{height:40px;min-width:40px;padding:0 16px;font-size:var(--text-md)}
.ef-toggle--md{height:32px;min-width:32px}
.ef-toggle-group{display:inline-flex;gap:2px;padding:2px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card)}
`;

const GroupCtx = React.createContext(null);

export function toggleVariants({ variant = 'default', size = 'default', className = '' } = {}) {
  const mappedSize = size === 'default' ? 'default' : size;
  return `ef-toggle ef-toggle--${variant} ef-toggle--${mappedSize}${className ? ' ' + className : ''}`;
}

export const Toggle = React.forwardRef(function Toggle(
  {
    pressed,
    defaultPressed,
    onPressedChange,
    onClick,
    value,
    icon,
    variant = 'default',
    size = 'default',
    disabled,
    children,
    className,
    ...rest
  },
  ref,
) {
  injectEfCss('ef-css-toggle', CSS);
  const context = React.useContext(GroupCtx);
  const [uncontrolled, setUncontrolled] = React.useState(!!defaultPressed);
  const isOn = context ? context.isOn(value) : (pressed !== undefined ? pressed : uncontrolled);
  const press = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (context) context.toggle(value);
    else {
      if (pressed === undefined) setUncontrolled(!isOn);
      onPressedChange?.(!isOn);
    }
  };
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      data-slot="toggle"
      data-state={isOn ? 'on' : 'off'}
      aria-pressed={isOn}
      disabled={disabled}
      onClick={press}
      className={`${toggleVariants({ variant, size, className })}${isOn ? ' ef-toggle--on' : ''}`}
    >
      {icon ? <Icon name={icon} size={iconSize} /> : null}
      {children}
    </button>
  );
});

export function ToggleGroup({ type = 'single', value, defaultValue, onChange, children, style, className, ...rest }) {
  injectEfCss('ef-css-toggle', CSS);
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue !== undefined ? defaultValue : (type === 'multiple' ? [] : null));
  const current = value !== undefined ? value : uncontrolled;
  const isOn = itemValue => type === 'multiple' ? (current || []).includes(itemValue) : current === itemValue;
  const toggle = itemValue => {
    let next;
    if (type === 'multiple') {
      const selected = current || [];
      next = selected.includes(itemValue) ? selected.filter(item => item !== itemValue) : [...selected, itemValue];
    } else next = current === itemValue ? null : itemValue;
    if (value === undefined) setUncontrolled(next);
    onChange?.(next);
  };
  return <div {...rest} role="group" className={`ef-toggle-group${className ? ' ' + className : ''}`} style={style}><GroupCtx.Provider value={{ isOn, toggle }}>{children}</GroupCtx.Provider></div>;
}
