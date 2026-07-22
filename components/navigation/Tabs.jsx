import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss, mergeRefs, useIsoLayoutEffect } from '../forms/Button.jsx';
const CSS = `
.ef-tabs{position:relative;display:flex;gap:4px;border-bottom:1px solid var(--border-default)}
.ef-tabs__tab{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 12px;border:none;background:transparent;color:var(--text-secondary);font-family:var(--font-sans);font-size:var(--text-md);font-weight:var(--weight-medium);cursor:pointer;border-radius:var(--radius-sm) var(--radius-sm) 0 0;transition:color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-tabs__tab:hover{color:var(--text-primary);background:var(--surface-sunken)}
.ef-tabs__tab:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-tabs__tab--active{color:var(--text-primary);font-weight:var(--weight-semibold)}
.ef-tabs__ink{position:absolute;bottom:-1px;height:2px;background:var(--accent);border-radius:2px;transition:left var(--dur-med) var(--ease-spring),width var(--dur-med) var(--ease-spring)}
.ef-tabs__count{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.ef-tabs__tab--active .ef-tabs__count{color:var(--text-primary)}
`;
export const Tabs = React.forwardRef(function Tabs({ items, value, onChange, style, className, ...rest }, fRef) {
  injectEfCss('ef-css-tabs', CSS);
  const ref = React.useRef(null);
  const [ink, setInk] = React.useState({ left: 0, width: 0 });
  useIsoLayoutEffect(() => {
    const el = ref.current && ref.current.querySelector('[data-active="true"]');
    if (el) setInk({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value, items]);
  const onKey = e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const ids = items.map(i => i.id);
    const cur = ids.indexOf(value);
    let next = cur;
    if (e.key === 'ArrowLeft') next = (cur - 1 + ids.length) % ids.length;
    if (e.key === 'ArrowRight') next = (cur + 1) % ids.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = ids.length - 1;
    if (onChange) onChange(ids[next]);
    const btns = ref.current ? ref.current.querySelectorAll('[role="tab"]') : [];
    if (btns[next]) btns[next].focus();
  };
  return (
    <div {...rest} ref={mergeRefs(fRef, ref)} role="tablist" onKeyDown={onKey} className={`ef-tabs${className ? ' ' + className : ''}`} style={style}>
      {items.map(it => (
        <button key={it.id} role="tab" aria-selected={value === it.id} tabIndex={value === it.id ? 0 : -1} data-active={value === it.id ? 'true' : 'false'} className={`ef-tabs__tab${value === it.id ? ' ef-tabs__tab--active' : ''}`} onClick={() => onChange && onChange(it.id)}>
          {it.icon ? <Icon name={it.icon} size={16} /> : null}
          {it.label}
          {it.count != null ? <span className="ef-tabs__count">{it.count}</span> : null}
        </button>
      ))}
      <span className="ef-tabs__ink" style={{ left: ink.left, width: ink.width }}></span>
    </div>
  );
});
