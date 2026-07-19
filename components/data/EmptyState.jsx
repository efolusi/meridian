import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:48px 24px;gap:4px}
.ef-empty--bordered{border:1px dashed var(--sand-300);border-radius:var(--radius-md)}
.ef-empty__icon{color:var(--sand-400);margin-bottom:10px}
.ef-empty__title{font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-empty__desc{font-size:var(--text-sm);color:var(--text-muted);max-width:340px;line-height:1.55}
.ef-empty__action{margin-top:14px}
`;
export function EmptyState({ icon = 'inbox', title, description, action, bordered, style, className, ...rest }) {
  injectEfCss('ef-css-empty', CSS);
  return (
    <div {...rest} className={`ef-empty${bordered ? ' ef-empty--bordered' : ''}${className ? ' ' + className : ''}`} style={style}>
      <span className="ef-empty__icon"><Icon name={icon} size={28} /></span>
      <div className="ef-empty__title">{title}</div>
      {description ? <div className="ef-empty__desc">{description}</div> : null}
      {action ? <div className="ef-empty__action">{action}</div> : null}
    </div>
  );
}
