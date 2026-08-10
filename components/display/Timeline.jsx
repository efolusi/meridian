import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';

const CSS = `
.ef-timeline{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.ef-timeline__item{display:grid;grid-template-columns:24px minmax(0,1fr);column-gap:12px;position:relative;min-width:0}
.ef-timeline__rail{display:flex;flex-direction:column;align-items:center;grid-row:1/span 2}
.ef-timeline__marker{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:var(--radius-full);border:1px solid var(--border-strong);background:var(--surface-card);color:var(--text-muted);flex:none;z-index:1}
.ef-timeline__line{width:1px;flex:1;min-height:16px;background:var(--border-default);margin:4px 0}
.ef-timeline__item:last-child .ef-timeline__line{visibility:hidden}
.ef-timeline__content{min-width:0;padding-bottom:20px}
.ef-timeline__item:last-child .ef-timeline__content{padding-bottom:0}
.ef-timeline__head{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;min-height:24px}
.ef-timeline__title{font-size:var(--text-md);font-weight:var(--weight-semibold);color:var(--text-primary);line-height:1.45}
.ef-timeline__time{margin-inline-start:auto;color:var(--text-muted);font-family:var(--font-mono);font-size:var(--text-xs);white-space:nowrap}
.ef-timeline__desc{margin-top:3px;color:var(--text-secondary);font-size:var(--text-sm);line-height:1.5}
.ef-timeline__meta{margin-top:6px;color:var(--text-muted);font-size:var(--text-xs);line-height:1.4}
.ef-timeline__item--success .ef-timeline__marker{border-color:var(--success-300);background:var(--success-100);color:var(--success-600)}
.ef-timeline__item--warning .ef-timeline__marker{border-color:var(--warning-300);background:var(--warning-100);color:var(--warning-600)}
.ef-timeline__item--danger .ef-timeline__marker{border-color:var(--danger-300);background:var(--danger-100);color:var(--danger-600)}
.ef-timeline--compact .ef-timeline__content{padding-bottom:12px}
`;

const TONE_ICONS = { success: 'check', warning: 'triangle-alert', danger: 'x' };

export function Timeline({ items = [], compact = false, style, className, ...rest }) {
  injectEfCss('ef-css-timeline', CSS);
  return (
    <ol {...rest} className={`ef-timeline${compact ? ' ef-timeline--compact' : ''}${className ? ' ' + className : ''}`} style={style}>
      {items.map((item, index) => {
        const tone = ['success', 'warning', 'danger'].includes(item.tone) ? item.tone : 'neutral';
        const icon = item.icon || TONE_ICONS[tone] || 'circle';
        return (
          <li key={item.id ?? index} className={`ef-timeline__item ef-timeline__item--${tone}`}>
            <span className="ef-timeline__rail" aria-hidden="true">
              <span className="ef-timeline__marker"><Icon name={icon} size={13} /></span>
              <span className="ef-timeline__line" />
            </span>
            <div className="ef-timeline__content">
              <div className="ef-timeline__head">
                <span className="ef-timeline__title">{item.title}</span>
                {item.time ? <time className="ef-timeline__time" dateTime={item.dateTime}>{item.time}</time> : null}
              </div>
              {item.description ? <div className="ef-timeline__desc">{item.description}</div> : null}
              {item.actor || item.meta ? <div className="ef-timeline__meta">{item.actor}{item.actor && item.meta ? ' · ' : null}{item.meta}</div> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
