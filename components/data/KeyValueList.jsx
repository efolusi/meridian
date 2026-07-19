import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-kv{display:flex;flex-direction:column}
.ef-kv__row{display:flex;gap:16px;padding:9px 0;border-bottom:1px solid var(--border-default)}
.ef-kv__row:last-child{border-bottom:none}
.ef-kv__label{width:160px;flex:none;font-size:var(--text-sm);color:var(--text-muted)}
.ef-kv__value{flex:1;font-size:var(--text-sm);color:var(--text-primary);min-width:0;overflow-wrap:break-word}
.ef-kv__value--mono{font-family:var(--font-mono);font-size:13px}
`;
export function KeyValueList({ items, labelWidth = 160, style, className, ...rest }) {
  injectEfCss('ef-css-kv', CSS);
  return (
    <div {...rest} className={`ef-kv${className ? ' ' + className : ''}`} style={style}>
      {items.map((it, i) => (
        <div key={i} className="ef-kv__row">
          <span className="ef-kv__label" style={{ width: labelWidth }}>{it.label}</span>
          <span className={`ef-kv__value${it.mono ? ' ef-kv__value--mono' : ''}`}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}
