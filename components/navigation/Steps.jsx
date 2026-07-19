import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-steps{display:flex;flex-direction:column;gap:0}
.ef-steps__item{display:flex;gap:12px}
.ef-steps__rail{display:flex;flex-direction:column;align-items:center;flex:none}
.ef-steps__marker{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:var(--radius-full);border:1.5px solid var(--sand-300);background:var(--surface-card);color:var(--text-muted);font-size:11px;font-weight:var(--weight-semibold);font-family:var(--font-mono);flex:none;transition:background var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out)}
.ef-steps__item--done .ef-steps__marker{background:var(--accent);border-color:var(--accent);color:var(--accent-contrast)}
.ef-steps__item--active .ef-steps__marker{border-color:var(--accent);color:var(--text-primary)}
.ef-steps__line{width:1.5px;flex:1;min-height:16px;background:var(--sand-200);margin:3px 0}
.ef-steps__item--done .ef-steps__line{background:var(--accent)}
.ef-steps__content{padding-bottom:20px;min-width:0}
.ef-steps__item:last-child .ef-steps__content{padding-bottom:0}
.ef-steps__title{font-size:var(--text-md);font-weight:var(--weight-semibold);color:var(--text-muted);line-height:24px}
.ef-steps__item--active .ef-steps__title,.ef-steps__item--done .ef-steps__title{color:var(--text-primary)}
.ef-steps__desc{font-size:var(--text-sm);color:var(--text-muted);margin-top:2px;line-height:1.5}
.ef-steps--h{flex-direction:row;gap:8px}
.ef-steps--h .ef-steps__item{flex:1;flex-direction:column;gap:8px}
.ef-steps--h .ef-steps__rail{flex-direction:row;width:100%}
.ef-steps--h .ef-steps__line{width:auto;flex:1;height:1.5px;min-height:0;margin:0 6px;align-self:center}
.ef-steps--h .ef-steps__item:last-child .ef-steps__line{display:none}
.ef-steps--h .ef-steps__content{padding-bottom:0}
`;
export function Steps({ items, current = 0, orientation = 'vertical', style, className, ...rest }) {
  injectEfCss('ef-css-steps', CSS);
  return (
    <div {...rest} className={`ef-steps${orientation === 'horizontal' ? ' ef-steps--h' : ''}${className ? ' ' + className : ''}`} style={style}>
      {items.map((it, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'todo';
        return (
          <div key={it.id || i} className={`ef-steps__item ef-steps__item--${state}`}>
            <div className="ef-steps__rail">
              <span className="ef-steps__marker">{state === 'done' ? <Icon name="check" size={13} strokeWidth={2.5} /> : i + 1}</span>
              {(orientation === 'horizontal' || i < items.length - 1) && <span className="ef-steps__line"></span>}
            </div>
            <div className="ef-steps__content">
              <div className="ef-steps__title">{it.title}</div>
              {it.description ? <div className="ef-steps__desc">{it.description}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
