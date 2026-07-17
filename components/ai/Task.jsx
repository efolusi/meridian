import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-task{display:flex;flex-direction:column;font-family:var(--font-sans);font-size:13.5px}
.ef-task__row{display:inline-flex;align-items:flex-start;gap:9px;padding:3px 8px;align-self:flex-start;color:var(--text-secondary);border-radius:var(--radius-sm)}
.ef-task__icon{display:inline-flex;width:16px;height:20px;align-items:center;justify-content:center;color:var(--text-muted);flex:none}
.ef-task__dot{width:6px;height:6px;border-radius:50%;background:currentColor}
.ef-task__label{color:var(--text-primary)}
.ef-task__detail{color:var(--text-muted)}
.ef-task__detail code{font-family:var(--font-mono);font-size:12px;background:var(--surface-sunken);border-radius:4px;padding:1px 5px;color:var(--text-secondary)}
.ef-task__rail{width:1px;height:13px;margin-left:16px;background:var(--border-default);flex:none}
.ef-task--streaming .ef-task__row:last-of-type{animation:ef-task-pulse 1.2s var(--ease-out) infinite}
@keyframes ef-task-pulse{0%,100%{opacity:1}50%{opacity:.45}}
`;
export function Task({ items = [], streaming, style, className }) {
  injectEfCss('ef-css-task', CSS);
  return (
    <div className={`ef-task${streaming ? ' ef-task--streaming' : ''}${className ? ' ' + className : ''}`} style={style} role="list">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          <div className="ef-task__row" role="listitem">
            <span className="ef-task__icon">{it.icon ? <Icon name={it.icon} size={14} /> : <span className="ef-task__dot"></span>}</span>
            <span><span className="ef-task__label">{it.label}</span>{it.detail ? <span className="ef-task__detail"> {it.detail}</span> : null}</span>
          </div>
          {i < items.length - 1 ? <span className="ef-task__rail" aria-hidden="true"></span> : null}
        </React.Fragment>
      ))}
    </div>
  );
}
