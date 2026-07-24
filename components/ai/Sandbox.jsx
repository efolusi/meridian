import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-sandbox{border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);overflow:hidden;font-family:var(--font-sans);transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-sandbox--running{border-color:var(--accent-subtle-border);box-shadow:0 0 0 3px var(--accent-subtle)}
.ef-sandbox--error{border-color:var(--danger-300);box-shadow:0 0 0 3px var(--danger-100)}
.ef-sandbox__head{display:flex;align-items:center;gap:9px;width:100%;padding:10px 14px;border:none;background:none;cursor:pointer;text-align:left;font-family:inherit}
.ef-sandbox__head:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-sandbox__chev{display:inline-flex;color:var(--text-muted);transition:transform var(--dur-med) var(--ease-out)}
.ef-sandbox--open .ef-sandbox__chev{transform:rotate(90deg)}
.ef-sandbox__title{flex:1;min-width:0;font-family:var(--font-mono);font-size:12.5px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ef-sandbox--error .ef-sandbox__title{color:var(--danger-600)}
.ef-sandbox__meta{font-size:12px;color:var(--text-muted);display:inline-flex;align-items:center;gap:6px}
.ef-sandbox__spin{display:inline-flex;color:var(--text-secondary);animation:ef-sandbox-spin 1s linear infinite}
@keyframes ef-sandbox-spin{to{transform:rotate(360deg)}}
.ef-sandbox__body{display:grid;grid-template-rows:0fr;transition:grid-template-rows var(--dur-med) var(--ease-out)}
.ef-sandbox--open .ef-sandbox__body{grid-template-rows:1fr}
.ef-sandbox__clip{overflow:hidden;min-height:0}
.ef-sandbox__inner{border-top:1px solid var(--border-default)}
.ef-sandbox__tabs{display:flex;gap:18px;padding:0 14px;border-bottom:1px solid var(--border-default)}
.ef-sandbox__tab{display:inline-flex;align-items:center;gap:6px;height:36px;border:none;background:none;cursor:pointer;font-family:var(--font-sans);font-size:12.5px;font-weight:var(--weight-semibold);color:var(--text-muted);border-bottom:2px solid transparent;margin-bottom:-1px;transition:color var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out)}
.ef-sandbox__tab:hover{color:var(--text-primary)}
.ef-sandbox__tab--on{color:var(--text-primary);border-bottom-color:var(--accent)}
.ef-sandbox__tab:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-sandbox__panel{padding:12px 14px;font-family:var(--font-mono);font-size:12.5px;line-height:1.7;color:var(--text-secondary);overflow-x:auto}
.ef-sandbox__panel pre{margin:0;white-space:pre-wrap;word-break:break-word}
`;
const STATES = { running: 'Running', success: 'Done', error: 'Failed' };
export function Sandbox({ title, status, state, meta, tabs = [], defaultOpen, defaultTab, style, className, ...rest }) {
  const s = status ?? state ?? 'success'; // `state` is a deprecated alias for `status`
  injectEfCss('ef-css-sandbox', CSS);
  const [open, setOpen] = React.useState(defaultOpen !== undefined ? !!defaultOpen : s === 'error');
  const [tab, setTab] = React.useState(defaultTab || (tabs[0] && tabs[0].id));
  const active = tabs.find(t => t.id === tab) || tabs[0];
  return (
    <div {...rest} className={`ef-sandbox ef-sandbox--${s}${open ? ' ef-sandbox--open' : ''}${className ? ' ' + className : ''}`} style={style} data-state={s}>
      <button type="button" className="ef-sandbox__head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="ef-sandbox__chev"><Icon name="chevron-right" size={14} /></span>
        <span className="ef-sandbox__title">{title}</span>
        <span className="ef-sandbox__meta">
          {s === 'running' ? <span className="ef-sandbox__spin"><Icon name="loader-circle" size={13} /></span> : null}
          {meta || STATES[s]}
        </span>
      </button>
      <div className="ef-sandbox__body"><div className="ef-sandbox__clip"><div className="ef-sandbox__inner">
        {tabs.length > 1 ? (
          <div className="ef-sandbox__tabs" role="tablist">
            {tabs.map(t => (
              <button key={t.id} type="button" role="tab" aria-selected={t.id === (active && active.id)} className={`ef-sandbox__tab${t.id === (active && active.id) ? ' ef-sandbox__tab--on' : ''}`} onClick={() => setTab(t.id)}>
                {t.icon ? <Icon name={t.icon} size={13} /> : null}{t.label}
              </button>
            ))}
          </div>
        ) : null}
        <div className="ef-sandbox__panel" role="tabpanel">{active ? active.content : null}</div>
      </div></div></div>
    </div>
  );
}
