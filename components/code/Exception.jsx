'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-exception{border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);font-family:var(--font-sans);overflow:hidden}
.ef-exception__head{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3) var(--space-4)}
.ef-exception__type{flex:none;margin-top:1px;padding:var(--space-0-5) var(--space-2);border-radius:var(--radius-sm);background:var(--status-danger-bg);color:var(--status-danger-text);font-family:var(--font-mono);font-size:var(--text-2xs);font-weight:var(--weight-semibold)}
.ef-exception__msg{flex:1;min-width:0;font-size:var(--text-md);line-height:1.5;color:var(--text-primary)}
.ef-exception__toggle{flex:none;display:inline-flex;align-items:center;gap:var(--space-1);border:none;background:none;cursor:pointer;padding:var(--space-1) var(--space-2);border-radius:var(--radius-sm);font-family:var(--font-sans);font-size:var(--text-xs);color:var(--text-muted);transition:color var(--dur-fast) var(--ease-enter),background var(--dur-fast) var(--ease-enter)}
.ef-exception__toggle:hover{color:var(--text-primary);background:var(--surface-subtle)}
.ef-exception__toggle:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-exception__chev{display:inline-flex;transition:transform var(--dur-fast) var(--ease-enter)}
.ef-exception--open .ef-exception__chev{transform:rotate(90deg)}
.ef-exception__body{display:grid;grid-template-rows:0fr;transition:grid-template-rows var(--dur-base) var(--ease-enter)}
.ef-exception--open .ef-exception__body{grid-template-rows:1fr}
.ef-exception__clip{overflow:hidden;min-height:0}
.ef-exception__frames{margin:0 var(--space-4) var(--space-3);padding:0;list-style:none;border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--surface-subtle);overflow:hidden;font-family:var(--font-mono);font-size:var(--text-xs);line-height:1.5}
.ef-exception__frame{display:flex;align-items:baseline;gap:var(--space-3);padding:var(--space-1) var(--space-3);border-inline-start:2px solid transparent}
.ef-exception__frame--active{border-inline-start-color:var(--status-danger-solid);background:var(--status-danger-bg)}
.ef-exception__frame--internal,.ef-exception__frame--internal .ef-exception__fn,.ef-exception__frame--internal .ef-exception__loc{color:var(--text-muted)}
.ef-exception__fn{flex:none;color:var(--text-primary)}
.ef-exception__loc{margin-inline-start:auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-muted)}
.ef-exception__src{margin:0 var(--space-4) var(--space-3);border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--surface-subtle);overflow:hidden}
.ef-exception__srchead{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--border-default);font-family:var(--font-mono);font-size:var(--text-2xs);color:var(--text-muted)}
.ef-exception__code{margin:0;padding:var(--space-2) 0;font-family:var(--font-mono);font-size:var(--text-xs);line-height:1.7;color:var(--text-secondary);overflow-x:auto}
.ef-exception__ln{display:flex;padding:0 var(--space-3);border-inline-start:2px solid transparent;white-space:pre}
.ef-exception__ln--active{border-inline-start-color:var(--status-danger-solid);background:var(--status-danger-bg);color:var(--status-danger-text)}
.ef-exception__no{flex:none;width:34px;color:var(--text-muted);user-select:none}
`;
export function Exception({ type = 'Error', message, frames = [], source, defaultOpen = false, style, className, ...rest }) {
  injectEfCss('ef-css-exception', CSS);
  const [open, setOpen] = React.useState(!!defaultOpen);
  return (
    <div {...rest} className={`ef-exception${open ? ' ef-exception--open' : ''}${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-exception__head">
        <span className="ef-exception__type">{type}</span>
        <span className="ef-exception__msg">{message}</span>
        {frames.length || source ? (
          <button type="button" className="ef-exception__toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
            {frames.length ? frames.length + ' frames' : 'Source'}
            <span className="ef-exception__chev"><Icon name="chevron-right" size={12} /></span>
          </button>
        ) : null}
      </div>
      <div className="ef-exception__body"><div className="ef-exception__clip">
        {frames.length ? (
          <ol className="ef-exception__frames">
            {frames.map((f, i) => (
              <li key={i} className={`ef-exception__frame${f.active ? ' ef-exception__frame--active' : ''}${f.internal ? ' ef-exception__frame--internal' : ''}`}>
                <span className="ef-exception__fn">{f.fn}</span>
                <span className="ef-exception__loc">{f.loc}</span>
              </li>
            ))}
          </ol>
        ) : null}
        {source ? (
          <div className="ef-exception__src">
            <div className="ef-exception__srchead"><Icon name="file-text" size={12} />{source.title}</div>
            <pre className="ef-exception__code">
              {(source.lines || []).map((l, i) => (
                <span key={i} className={`ef-exception__ln${l.active ? ' ef-exception__ln--active' : ''}`}>
                  <span className="ef-exception__no">{l.no}</span>{l.text}{'\n'}
                </span>
              ))}
            </pre>
          </div>
        ) : null}
      </div></div>
    </div>
  );
}
