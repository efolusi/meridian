import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-todo{border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);font-family:var(--font-sans)}
.ef-todo__head{display:flex;align-items:center;gap:9px;width:100%;padding:10px 14px;border:none;background:none;cursor:pointer;text-align:left;font-family:inherit}
.ef-todo__head:focus-visible{outline:none;box-shadow:var(--focus-ring);border-radius:var(--radius-md)}
.ef-todo__glyph{display:inline-flex;color:var(--text-muted)}
.ef-todo__title{flex:1;min-width:0;font-size:13.5px;font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-todo__count{font-size:12px;color:var(--text-muted);font-variant-numeric:tabular-nums}
.ef-todo__chev{display:inline-flex;color:var(--text-muted);transition:transform var(--dur-med) var(--ease-out)}
.ef-todo--open .ef-todo__chev{transform:rotate(180deg)}
.ef-todo__body{display:grid;grid-template-rows:0fr;transition:grid-template-rows var(--dur-med) var(--ease-out)}
.ef-todo--open .ef-todo__body{grid-template-rows:1fr}
.ef-todo__clip{overflow:hidden;min-height:0}
.ef-todo__list{list-style:none;margin:0;padding:0 6px 6px}
.ef-todo__item{display:flex;align-items:flex-start;gap:10px;padding:6px 8px;font-size:13.5px;border-radius:var(--radius-sm)}
.ef-todo__mark{position:relative;flex:none;width:16px;height:16px;margin-top:2px;border-radius:50%;border:1px solid var(--border-strong);display:inline-flex;align-items:center;justify-content:center;transition:background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out)}
.ef-todo__item--progress .ef-todo__mark{border-color:transparent;color:var(--text-primary)}
.ef-todo__item--done .ef-todo__mark{background:var(--accent);border-color:var(--accent);color:var(--accent-contrast)}
.ef-todo__spin{display:inline-flex;animation:ef-todo-spin 1s linear infinite}
@keyframes ef-todo-spin{to{transform:rotate(360deg)}}
.ef-todo__text{min-width:0;color:var(--text-primary);line-height:1.55;transition:color var(--dur-fast) var(--ease-out)}
.ef-todo__item--done .ef-todo__text{color:var(--text-muted);text-decoration:line-through}
`;
export function Todo({ title = 'Tasks', items = [], defaultOpen = true, style, className, ...rest }) {
  injectEfCss('ef-css-todo', CSS);
  const [open, setOpen] = React.useState(!!defaultOpen);
  const done = items.filter(i => i.status === 'done').length;
  return (
    <div {...rest} className={`ef-todo${open ? ' ef-todo--open' : ''}${className ? ' ' + className : ''}`} style={style}>
      <button type="button" className="ef-todo__head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="ef-todo__glyph"><Icon name="list-todo" size={15} /></span>
        <span className="ef-todo__title">{title}</span>
        <span className="ef-todo__count">{done}/{items.length}</span>
        <span className="ef-todo__chev"><Icon name="chevron-down" size={14} /></span>
      </button>
      <div className="ef-todo__body"><div className="ef-todo__clip">
        <ul className="ef-todo__list">
          {items.map((it, i) => {
            const st = it.status || 'pending';
            return (
              <li key={i} className={`ef-todo__item ef-todo__item--${st}`}>
                <span className="ef-todo__mark" aria-hidden="true">
                  {st === 'progress' ? <span className="ef-todo__spin"><Icon name="loader-circle" size={15} /></span> : null}
                  {st === 'done' ? <Icon name="check" size={10} strokeWidth={3} /> : null}
                </span>
                <span className="ef-todo__text">{it.label}</span>
              </li>
            );
          })}
        </ul>
      </div></div>
    </div>
  );
}
