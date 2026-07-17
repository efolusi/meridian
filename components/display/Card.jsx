import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-card{background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md)}
.ef-card--elevated{box-shadow:var(--shadow-sm)}
.ef-card--interactive{cursor:pointer;transition:border-color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-card--interactive:hover{border-color:var(--sand-400)}
.ef-card--interactive:active{background:var(--surface-subtle)}
.ef-card__header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border-default)}
.ef-card__title{font-family:var(--font-sans);font-size:var(--text-lg);font-weight:var(--weight-semibold);letter-spacing:0;color:var(--text-primary)}
.ef-card__subtitle{font-size:var(--text-sm);color:var(--text-muted);margin-top:2px}
.ef-card__footer{display:flex;align-items:center;gap:8px;padding:12px 20px;border-top:1px solid var(--border-default);background:var(--surface-subtle);border-radius:0 0 var(--radius-md) var(--radius-md)}
`;
export function Card({ title, subtitle, actions, footer, padding = 20, elevated, interactive, children, style, className, ...rest }) {
  injectEfCss('ef-css-card', CSS);
  return (
    <div className={`ef-card${elevated ? ' ef-card--elevated' : ''}${interactive ? ' ef-card--interactive' : ''}${className ? ' ' + className : ''}`} style={style} {...rest}>
      {title || actions ? (
        <div className="ef-card__header">
          <div>
            <div className="ef-card__title">{title}</div>
            {subtitle ? <div className="ef-card__subtitle">{subtitle}</div> : null}
          </div>
          {actions ? <div style={{ display: 'flex', gap: 8, flex: 'none' }}>{actions}</div> : null}
        </div>
      ) : null}
      <div style={{ padding }}>{children}</div>
      {footer ? <div className="ef-card__footer">{footer}</div> : null}
    </div>
  );
}
