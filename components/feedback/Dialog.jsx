import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-dialog__overlay{position:fixed;inset:0;background:rgba(31,26,20,.45);display:flex;align-items:center;justify-content:center;padding:24px;z-index:100;animation:ef-fade var(--dur-med) var(--ease-out)}
.ef-dialog{width:100%;max-width:440px;background:var(--surface-card);border-radius:var(--radius-lg);box-shadow:var(--shadow-pop);animation:ef-pop var(--dur-slow) var(--ease-spring);overflow:hidden}
.ef-dialog__head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:20px 24px 0}
.ef-dialog__title{font-family:var(--font-display);font-size:var(--text-xl);font-weight:var(--weight-bold);letter-spacing:var(--tracking-tight);color:var(--text-primary)}
.ef-dialog__desc{font-size:var(--text-md);color:var(--text-secondary);margin-top:6px}
.ef-dialog__body{padding:16px 24px 24px}
.ef-dialog__foot{display:flex;justify-content:flex-end;gap:8px;padding:14px 24px;background:var(--surface-subtle);border-top:1px solid var(--border-default)}
@keyframes ef-fade{from{opacity:0}}
@keyframes ef-pop{from{opacity:0;transform:scale(.94) translateY(8px)}}
`;
export function Dialog({ open, onClose, title, description, footer, width = 440, children }) {
  injectEfCss('ef-css-dialog', CSS);
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape' && onClose) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="ef-dialog__overlay" onMouseDown={e => { if (e.target === e.currentTarget && onClose) onClose(); }}>
      <div className="ef-dialog" role="dialog" aria-modal="true" style={{ maxWidth: width }}>
        <div className="ef-dialog__head">
          <div>
            <div className="ef-dialog__title">{title}</div>
            {description ? <div className="ef-dialog__desc">{description}</div> : null}
          </div>
          {onClose ? <IconButton icon="x" label="Close" size="sm" onClick={onClose} /> : null}
        </div>
        <div className="ef-dialog__body">{children}</div>
        {footer ? <div className="ef-dialog__foot">{footer}</div> : null}
      </div>
    </div>
  );
}
