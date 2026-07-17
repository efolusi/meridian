import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from './Button.jsx';
const CSS = `
.ef-tilegroup{display:grid;gap:10px}
.ef-tile{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:16px;border:1px solid var(--border-strong);border-radius:var(--radius-md);background:var(--surface-card);cursor:pointer;text-align:left;font-family:var(--font-sans);color:var(--text-primary);transition:border-color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-tile:hover:not(:disabled){border-color:var(--sand-400)}
.ef-tile:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-tile:disabled{opacity:.45;cursor:not-allowed}
.ef-tile--on{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}
.ef-tile__icon{display:inline-flex;color:var(--text-secondary)}
.ef-tile--on .ef-tile__icon{color:var(--text-primary)}
.ef-tile__title{font-size:var(--text-md);font-weight:var(--weight-semibold)}
.ef-tile__desc{font-size:var(--text-sm);color:var(--text-muted);line-height:1.45}
.ef-tile__check{position:absolute;top:12px;right:12px;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:var(--radius-full);background:var(--accent);color:var(--accent-contrast);opacity:0;transform:scale(.6);transition:opacity var(--dur-fast) var(--ease-out),transform var(--dur-med) var(--ease-spring)}
.ef-tile--on .ef-tile__check{opacity:1;transform:scale(1)}
`;
export function ButtonTile({ icon, title, description, selected, disabled, onClick, style, className }) {
  injectEfCss('ef-css-tile', CSS);
  return (
    <button className={`ef-tile${selected ? ' ef-tile--on' : ''}${className ? ' ' + className : ''}`} disabled={disabled} aria-pressed={!!selected} onClick={onClick} style={style}>
      {icon ? <span className="ef-tile__icon"><Icon name={icon} size={20} /></span> : null}
      <span className="ef-tile__title">{title}</span>
      {description ? <span className="ef-tile__desc">{description}</span> : null}
      <span className="ef-tile__check"><Icon name="check" size={11} strokeWidth={3} /></span>
    </button>
  );
}
export function ButtonTileGroup({ columns = 3, children, style, className }) {
  injectEfCss('ef-css-tile', CSS);
  return <div className={`ef-tilegroup${className ? ' ' + className : ''}`} style={{ gridTemplateColumns: `repeat(${columns},1fr)`, ...style }}>{children}</div>;
}
