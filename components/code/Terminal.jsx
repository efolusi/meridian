import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-term{background:var(--surface-code);border:1px solid var(--border-code);border-radius:var(--radius-md);overflow:hidden}
.ef-term__head{display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid var(--code-divider)}
.ef-term__host{font-family:var(--font-mono);font-size:11px;color:var(--code-ink-subtle)}
.ef-term__dot{width:7px;height:7px;border-radius:var(--radius-full);background:var(--success-on-dark)}
.ef-term__body{padding:12px 16px;font-family:var(--font-mono);font-size:12.5px;line-height:1.7;overflow-x:auto}
.ef-term__line{white-space:pre-wrap;color:var(--code-ink)}
.ef-term__line--cmd{color:var(--cream-50)}
.ef-term__line--cmd::before{content:'$ ';color:var(--caramel-500)}
.ef-term__line--ok{color:var(--success-on-dark)}
.ef-term__line--err{color:var(--danger-on-dark)}
.ef-term__line--info{color:var(--code-ink-subtle)}
.ef-term__time{color:var(--code-ink-faint);margin-right:10px}
@keyframes ef-term-caret{0%,100%{opacity:1}50%{opacity:0}}
.ef-term__caret{display:inline-block;width:7px;height:13px;background:var(--cream-50);vertical-align:-2px;animation:ef-term-caret 1s steps(1) infinite}
`;
export function Terminal({ host, lines = [], live, maxHeight = 260, style, className, ...rest }) {
  injectEfCss('ef-css-term', CSS);
  return (
    <div {...rest} className={`ef-term${className ? ' ' + className : ''}`} style={style}>
      {host ? <div className="ef-term__head"><span className="ef-term__dot"></span><span className="ef-term__host">{host}</span></div> : null}
      <div className="ef-term__body" role="log" aria-live="polite" style={{ maxHeight, overflowY: 'auto' }}>
        {lines.map((l, i) => {
          const item = typeof l === 'string' ? { text: l } : l;
          return (
            <div key={i} className={`ef-term__line${item.type ? ' ef-term__line--' + item.type : ''}`}>
              {item.time ? <span className="ef-term__time">{item.time}</span> : null}{item.text}
            </div>
          );
        })}
        {live ? <span className="ef-term__caret"></span> : null}
      </div>
    </div>
  );
}
