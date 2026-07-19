import React from 'react';
import { injectEfCss } from './Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-toggle{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:32px;min-width:32px;padding:0 10px;border:1px solid transparent;border-radius:var(--radius-sm);background:transparent;cursor:pointer;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:500;color:var(--text-secondary);transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out)}
.ef-toggle:hover:not(:disabled):not(.ef-toggle--on){background:var(--surface-sunken);color:var(--text-primary)}
.ef-toggle--on{background:var(--accent-subtle);color:var(--brand-700)}
.ef-toggle:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-toggle:disabled{opacity:.45;cursor:not-allowed}
.ef-toggle--sm{height:26px;min-width:26px;padding:0 7px;font-size:12.5px}
.ef-toggle-group{display:inline-flex;gap:2px;padding:2px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card)}
`;
const GroupCtx = React.createContext(null);
export function Toggle({ pressed, defaultPressed, onPressedChange, value, icon, size = 'md', disabled, children, style, className, ...rest }) {
  injectEfCss('ef-css-toggle', CSS);
  const ctx = React.useContext(GroupCtx);
  const [un, setUn] = React.useState(!!defaultPressed);
  const isOn = ctx ? ctx.isOn(value) : (pressed !== undefined ? pressed : un);
  const press = () => {
    if (ctx) { ctx.toggle(value); return; }
    if (pressed === undefined) setUn(!isOn);
    if (onPressedChange) onPressedChange(!isOn);
  };
  return (
    <button type="button" aria-pressed={isOn} disabled={disabled} onClick={press} style={style}
      className={`ef-toggle ef-toggle--${size}${isOn ? ' ef-toggle--on' : ''}${className ? ' ' + className : ''}`} {...rest}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 14 : 16} /> : null}
      {children}
    </button>
  );
}
export function ToggleGroup({ type = 'single', value, defaultValue, onChange, children, style, className, ...rest }) {
  injectEfCss('ef-css-toggle', CSS);
  const [un, setUn] = React.useState(defaultValue !== undefined ? defaultValue : (type === 'multiple' ? [] : null));
  const cur = value !== undefined ? value : un;
  const isOn = v => type === 'multiple' ? (cur || []).includes(v) : cur === v;
  const toggle = v => {
    let next;
    if (type === 'multiple') { const c = cur || []; next = c.includes(v) ? c.filter(x => x !== v) : [...c, v]; }
    else next = cur === v ? null : v;
    if (value === undefined) setUn(next);
    if (onChange) onChange(next);
  };
  return <div {...rest} role="group" className={`ef-toggle-group${className ? ' ' + className : ''}`} style={style}><GroupCtx.Provider value={{ isOn, toggle }}>{children}</GroupCtx.Provider></div>;
}
