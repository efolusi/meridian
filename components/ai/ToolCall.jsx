import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-toolcall{border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);overflow:hidden;transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-toolcall--approval{border-color:var(--accent-subtle-border);box-shadow:0 0 0 2px var(--accent-subtle)}
.ef-toolcall--running{border-color:var(--accent-subtle-border)}
.ef-toolcall--error{border-color:var(--danger-300,var(--danger-600))}
.ef-toolcall__head{display:flex;align-items:center;gap:9px;width:100%;padding:9px 12px;border:none;background:none;cursor:pointer;text-align:left;font-family:var(--font-mono);font-size:12.5px;color:var(--text-primary)}
.ef-toolcall__head:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-toolcall--pending .ef-toolcall__head{animation:ef-toolcall-pulse 1.4s var(--ease-out) infinite}
@keyframes ef-toolcall-pulse{0%,100%{opacity:1}50%{opacity:.55}}
.ef-toolcall__icon{display:inline-flex;color:var(--text-muted)}
.ef-toolcall__verb{color:var(--text-muted);font-family:var(--font-sans);font-size:12.5px}
.ef-toolcall__state{margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-family:var(--font-sans);font-size:12px;font-weight:500;flex:none}
.ef-toolcall__state--pending{color:var(--text-muted)}
.ef-toolcall__state--approval{color:var(--brand-700)}
.ef-toolcall__state--running{color:var(--text-secondary)}
.ef-toolcall__state--success{color:var(--success-600,var(--text-secondary))}
.ef-toolcall__state--error{color:var(--danger-600)}
.ef-toolcall__spin{display:inline-flex;animation:ef-toolcall-spin .9s linear infinite}
@keyframes ef-toolcall-spin{to{transform:rotate(360deg)}}
.ef-toolcall__chev{display:inline-flex;color:var(--text-muted);transition:transform var(--dur-med) var(--ease-out)}
.ef-toolcall--open .ef-toolcall__chev{transform:rotate(180deg)}
.ef-toolcall__body{border-top:1px solid var(--border-default);padding:12px;display:flex;flex-direction:column;gap:10px}
.ef-toolcall__sec{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted);margin-bottom:5px}
.ef-toolcall__grid{border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--surface-sunken);overflow:hidden;font-family:var(--font-mono);font-size:12px}
.ef-toolcall__row{display:grid;grid-template-columns:max-content 1fr;gap:12px;padding:6px 10px;border-top:1px solid var(--border-default)}
.ef-toolcall__row:first-child{border-top:none}
.ef-toolcall__key{color:var(--text-muted)}
.ef-toolcall__val{min-width:0;color:var(--text-secondary);white-space:pre-wrap;word-break:break-word}
.ef-toolcall--streaming .ef-toolcall__row:last-child .ef-toolcall__val{animation:ef-toolcall-pulse 1.2s var(--ease-out) infinite}
.ef-toolcall__args{margin:0;padding:10px 12px;background:var(--surface-sunken);border:1px solid var(--border-default);border-radius:var(--radius-sm);font-family:var(--font-mono);font-size:12px;line-height:1.6;color:var(--text-secondary);white-space:pre-wrap;word-break:break-word;max-height:256px;overflow:auto}
.ef-toolcall__result{font-size:13.5px;line-height:1.6;color:var(--text-secondary)}
.ef-toolcall__error{padding:10px 12px;border-radius:var(--radius-sm);background:var(--danger-100);color:var(--danger-600);font-size:13px;line-height:1.55}
.ef-toolcall__actions{display:flex;justify-content:flex-end;gap:8px;padding-top:2px}
.ef-toolcall__btn{height:28px;padding:0 12px;border-radius:var(--radius-sm);border:1px solid var(--border-strong);background:var(--surface-card);cursor:pointer;font-family:var(--font-sans);font-size:12.5px;font-weight:600;color:var(--text-primary);transition:background var(--dur-fast) var(--ease-out)}
.ef-toolcall__btn:hover{background:var(--surface-subtle)}
.ef-toolcall__btn--accept{background:var(--accent);border-color:var(--accent);color:var(--accent-contrast)}
.ef-toolcall__btn--accept:hover{background:var(--accent-hover)}
.ef-toolcall__btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
`;
const STATES = { pending: 'Queued', approval: 'Needs approval', running: 'Running', success: 'Done', error: 'Failed' };
export function ToolCall({ name, status = 'running', args, result, error, icon = 'wrench', defaultOpen, streaming, onApprove, onReject, approveLabel = 'Approve', rejectLabel = 'Reject', children, style, className, ...rest }) {
  injectEfCss('ef-css-toolcall', CSS);
  const [open, setOpen] = React.useState(defaultOpen !== undefined ? !!defaultOpen : (status === 'error' || status === 'approval'));
  const body = children || result;
  const entries = args != null && typeof args === 'object' && !Array.isArray(args) ? Object.entries(args) : null;
  const argText = args == null || entries ? null : typeof args === 'string' ? args : JSON.stringify(args, null, 2);
  const fmt = v => v == null ? 'null' : typeof v === 'string' ? v : typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v);
  return (
    <div {...rest} className={`ef-toolcall ef-toolcall--${status}${open ? ' ef-toolcall--open' : ''}${streaming ? ' ef-toolcall--streaming' : ''}${className ? ' ' + className : ''}`} style={style}>
      <button type="button" className="ef-toolcall__head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="ef-toolcall__icon"><Icon name={icon} size={14} /></span>
        <span className="ef-toolcall__verb">tool</span>
        {name}
        <span className={`ef-toolcall__state ef-toolcall__state--${status}`}>
          {status === 'running' ? <span className="ef-toolcall__spin"><Icon name="loader-circle" size={13} /></span>
            : status === 'approval' ? <Icon name="shield-check" size={13} />
            : status === 'pending' ? <Icon name="clock" size={13} />
            : <Icon name={status === 'success' ? 'circle-check' : 'circle-alert'} size={13} />}
          {STATES[status]}
        </span>
        <span className="ef-toolcall__chev"><Icon name="chevron-down" size={14} /></span>
      </button>
      {open ? (
        <div className="ef-toolcall__body">
          {entries && entries.length ? (
            <div><div className="ef-toolcall__sec">Input</div>
              <div className="ef-toolcall__grid">
                {entries.map(([k, v]) => <div key={k} className="ef-toolcall__row"><span className="ef-toolcall__key">{k}</span><span className="ef-toolcall__val">{fmt(v)}</span></div>)}
              </div>
            </div>
          ) : argText ? <div><div className="ef-toolcall__sec">Input</div><pre className="ef-toolcall__args">{argText}</pre></div> : null}
          {error ? <div><div className="ef-toolcall__sec">Error</div><div className="ef-toolcall__error">{error}</div></div> : null}
          {body ? <div><div className="ef-toolcall__sec">Result</div><div className="ef-toolcall__result">{body}</div></div> : null}
          {status === 'approval' && (onApprove || onReject) ? (
            <div className="ef-toolcall__actions">
              {onReject ? <button type="button" className="ef-toolcall__btn" onClick={onReject}>{rejectLabel}</button> : null}
              {onApprove ? <button type="button" className="ef-toolcall__btn ef-toolcall__btn--accept" onClick={onApprove}>{approveLabel}</button> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
