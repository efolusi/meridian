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
.ef-toggle-group{display:inline-flex;gap:var(--ef-toggle-gap,8px);align-items:center}
.ef-toggle-group[data-orientation="vertical"]{flex-direction:column;align-items:stretch}
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
  const actualVariant = context?.variant ?? variant;
  const actualSize = context?.size ?? size;
  const iconSize = actualSize === 'sm' ? 14 : actualSize === 'lg' ? 18 : 16;

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      data-slot={context ? 'toggle-group-item' : 'toggle'}
      data-state={isOn ? 'on' : 'off'}
      aria-pressed={isOn}
      disabled={disabled || context?.disabled}
      onClick={press}
      className={`${toggleVariants({ variant: actualVariant, size: actualSize, className })}${isOn ? ' ef-toggle--on' : ''}`}
    >
      {icon ? <Icon name={icon} size={iconSize} /> : null}
      {children}
    </button>
  );
});

export const ToggleGroup = React.forwardRef(function ToggleGroup({ type = 'single', value, defaultValue, onValueChange, onChange, variant = 'default', size = 'default', spacing = 2, orientation = 'horizontal', disabled = false, dir, children, style, className, onKeyDown, ...rest }, ref) {
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
    onValueChange?.(next);
    onChange?.(next);
  };
  const keyNav = event => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const rtl = (dir || document.documentElement.dir) === 'rtl';
    const previous = orientation === 'vertical' ? event.key === 'ArrowUp' : event.key === (rtl ? 'ArrowRight' : 'ArrowLeft');
    const next = orientation === 'vertical' ? event.key === 'ArrowDown' : event.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
    if (!previous && !next && event.key !== 'Home' && event.key !== 'End') return;
    const items = [...event.currentTarget.querySelectorAll('[data-slot="toggle-group-item"]:not(:disabled)')];
    if (!items.length) return;
    event.preventDefault();
    const index = items.indexOf(document.activeElement);
    const target = event.key === 'Home' ? items[0] : event.key === 'End' ? items.at(-1) : items[(index + (previous ? -1 : 1) + items.length) % items.length];
    target?.focus();
  };
  const ctx = React.useMemo(() => ({ isOn, toggle, variant, size, disabled }), [current, type, variant, size, disabled]);
  return (
    <div {...rest} ref={ref} role="group" data-slot="toggle-group" data-orientation={orientation} dir={dir}
      className={`ef-toggle-group${className ? ' ' + className : ''}`}
      style={{ '--ef-toggle-gap': `${spacing * 4}px`, ...style }} onKeyDown={keyNav}>
      <GroupCtx.Provider value={ctx}>{children}</GroupCtx.Provider>
    </div>
  );
});

export const ToggleGroupItem = React.forwardRef(function ToggleGroupItem(props, ref) {
  return <Toggle {...props} ref={ref} data-slot="toggle-group-item" />;
});
