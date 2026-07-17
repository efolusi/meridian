import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-confirm{border-radius:var(--radius-md);background:var(--surface-card);border:1px solid var(--accent-subtle-border);box-shadow:0 0 0 2px var(--accent-subtle)}
.ef-confirm--danger{border-color:var(--danger-300,var(--danger-600));box-shadow:0 0 0 2px var(--danger-100,#F8ECEA)}
.ef-confirm--settled{border-color:var(--border-default);box-shadow:none}
.ef-confirm__head{display:flex;align-items:center;gap:9px;padding:11px 14px 0}
.ef-confirm__icon{display:inline-flex;color:var(--brand-700);flex:none}
.ef-confirm--danger .ef-confirm__icon{color:var(--danger-600)}
.ef-confirm__title{font-size:var(--text-sm);font-weight:600;color:var(--text-primary)}
.ef-confirm__desc{padding:6px 14px 0;font-size:13.5px;line-height:1.6;color:var(--text-secondary)}
.ef-confirm__content{padding:10px 14px 0}
.ef-confirm__actions{display:flex;justify-content:flex-end;gap:8px;padding:12px 14px}
.ef-confirm__btn{height:30px;padding:0 13px;border-radius:var(--radius-sm);border:1px solid var(--border-strong);background:var(--surface-card);cursor:pointer;font-family:var(--font-sans);font-size:12.5px;font-weight:600;color:var(--text-primary);transition:background var(--dur-fast) var(--ease-out)}
.ef-confirm__btn:hover{background:var(--surface-subtle)}
.ef-confirm__btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-confirm__btn--accept{background:var(--accent);border-color:var(--accent);color:var(--accent-contrast)}
.ef-confirm__btn--accept:hover{background:var(--accent-hover)}
.ef-confirm--danger .ef-confirm__btn--accept{background:var(--danger-600);border-color:var(--danger-600);color:#fff}
.ef-confirm__status{display:flex;align-items:center;gap:8px;padding:10px 14px 12px;font-size:13px;color:var(--text-secondary)}
.ef-confirm__status--approved{color:var(--success-600,var(--text-secondary))}
.ef-confirm__status--rejected{color:var(--text-muted)}
`;
export function Confirmation({ title, description, tone = 'default', state, defaultState = 'pending', onStateChange, icon, approveLabel = 'Approve', rejectLabel = 'Reject', approvedNote = 'Approved — continuing.', rejectedNote = 'Rejected — the agent will skip this.', children, style, className }) {
  injectEfCss('ef-css-confirm', CSS);
  const [un, setUn] = React.useState(defaultState);
  const cur = state !== undefined ? state : un;
  const set = next => {
    if (state === undefined) setUn(next);
    if (onStateChange) onStateChange(next);
  };
  const settled = cur !== 'pending';
  return (
    <div role="group" className={`ef-confirm${tone === 'danger' ? ' ef-confirm--danger' : ''}${settled ? ' ef-confirm--settled' : ''}${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-confirm__head">
        <span className="ef-confirm__icon"><Icon name={icon || (tone === 'danger' ? 'triangle-alert' : 'shield-check')} size={15} /></span>
        <span className="ef-confirm__title">{title}</span>
      </div>
      {description ? <div className="ef-confirm__desc">{description}</div> : null}
      {children ? <div className="ef-confirm__content">{children}</div> : null}
      {cur === 'pending' ? (
        <div className="ef-confirm__actions">
          <button type="button" className="ef-confirm__btn" onClick={() => set('rejected')}>{rejectLabel}</button>
          <button type="button" className="ef-confirm__btn ef-confirm__btn--accept" onClick={() => set('approved')}>{approveLabel}</button>
        </div>
      ) : (
        <div className={`ef-confirm__status ef-confirm__status--${cur}`}>
          <Icon name={cur === 'approved' ? 'circle-check' : 'circle-alert'} size={14} />
          {cur === 'approved' ? approvedNote : rejectedNote}
        </div>
      )}
    </div>
  );
}
