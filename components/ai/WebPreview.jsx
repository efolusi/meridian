import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-webprev{display:flex;flex-direction:column;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);padding:6px;font-family:var(--font-sans)}
.ef-webprev__bar{display:flex;align-items:center;gap:4px;padding:2px 4px 8px}
.ef-webprev__btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;background:none;cursor:pointer;color:var(--text-muted);border-radius:var(--radius-sm);flex:none;transition:color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-webprev__btn:hover{color:var(--text-primary);background:var(--surface-subtle)}
.ef-webprev__btn--on{color:var(--text-primary);background:var(--surface-sunken)}
.ef-webprev__btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-webprev__addr{flex:1;min-width:0;height:30px;padding:0 12px;border:1px solid var(--border-default);border-radius:var(--radius-full);background:var(--surface-subtle);font-family:var(--font-sans);font-size:12.5px;color:var(--text-secondary);transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-webprev__addr:focus{outline:none;border-color:var(--border-strong);box-shadow:var(--focus-ring);color:var(--text-primary)}
.ef-webprev__stage{position:relative;display:flex;justify-content:center;background:var(--surface-sunken);border:1px solid var(--border-default);border-radius:var(--radius-sm);overflow:hidden}
.ef-webprev__frame{border:none;width:100%;height:100%;background:var(--surface-card);transition:width .45s cubic-bezier(.32,.72,0,1)}
.ef-webprev__fake{overflow:auto;background:var(--surface-card);width:100%;height:100%;transition:width .45s cubic-bezier(.32,.72,0,1)}
.ef-webprev__empty{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:12.5px;color:var(--text-muted)}
.ef-webprev__consbody{display:grid;grid-template-rows:0fr;transition:grid-template-rows var(--dur-med) var(--ease-out)}
.ef-webprev--console .ef-webprev__consbody{grid-template-rows:1fr}
.ef-webprev__consclip{overflow:hidden;min-height:0}
.ef-webprev__cons{margin-top:6px;border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--surface-subtle);max-height:180px;overflow-y:auto;font-family:var(--font-mono);font-size:11.5px;line-height:1.6}
.ef-webprev__log{display:flex;gap:8px;padding:5px 10px;border-top:1px solid var(--border-default);color:var(--text-secondary)}
.ef-webprev__log:first-child{border-top:none}
.ef-webprev__log--warn{color:var(--warning-600)}
.ef-webprev__log--error{color:var(--danger-600)}
.ef-webprev__logicon{display:inline-flex;flex:none;margin-top:2px}
.ef-webprev__badge{position:absolute;top:3px;right:3px;min-width:14px;height:14px;padding:0 4px;border-radius:var(--radius-full);background:var(--danger-600);color:#fff;font-size:9.5px;font-weight:var(--weight-semibold);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-sans)}
`;
const VIEWPORTS = [{ id: 'desktop', icon: 'monitor', width: null }, { id: 'tablet', icon: 'tablet', width: 768 }, { id: 'mobile', icon: 'smartphone', width: 390 }];
export function WebPreview({ url: urlProp = '', height = 340, logs = [], defaultConsoleOpen = false, children, onUrlChange, style, className }) {
  injectEfCss('ef-css-webprev', CSS);
  const [url, setUrl] = React.useState(urlProp);
  const [draft, setDraft] = React.useState(urlProp);
  const [key, setKey] = React.useState(0);
  const [vp, setVp] = React.useState('desktop');
  const [cons, setCons] = React.useState(!!defaultConsoleOpen);
  const errs = logs.filter(l => l.level === 'error').length;
  const commit = v => {
    const t = v.trim();
    const next = !t || /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : 'https://' + t;
    setDraft(next); setUrl(next);
    if (onUrlChange) onUrlChange(next);
  };
  const width = (VIEWPORTS.find(v => v.id === vp) || {}).width;
  const LOG_ICON = { warn: 'triangle-alert', error: 'circle-alert', info: 'info' };
  return (
    <div className={`ef-webprev${cons ? ' ef-webprev--console' : ''}${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-webprev__bar">
        <button type="button" className="ef-webprev__btn" aria-label="Reload" onClick={() => setKey(k => k + 1)}><Icon name="refresh-cw" size={13} /></button>
        <input className="ef-webprev__addr" type="text" value={draft} placeholder="Enter a URL to preview" spellCheck={false}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { commit(draft); e.currentTarget.blur(); } if (e.key === 'Escape') { setDraft(url); e.currentTarget.blur(); } }}
          onBlur={() => setDraft(url)} onFocus={e => e.currentTarget.select()} />
        {VIEWPORTS.map(v => (
          <button key={v.id} type="button" className={`ef-webprev__btn${vp === v.id ? ' ef-webprev__btn--on' : ''}`} aria-label={v.id} aria-pressed={vp === v.id} onClick={() => setVp(v.id)}><Icon name={v.icon} size={14} /></button>
        ))}
        <button type="button" className={`ef-webprev__btn${cons ? ' ef-webprev__btn--on' : ''}`} style={{ position: 'relative' }} aria-label="Console" aria-pressed={cons} onClick={() => setCons(!cons)}>
          <Icon name="terminal" size={14} />
          {errs ? <span className="ef-webprev__badge">{errs}</span> : null}
        </button>
        <a className="ef-webprev__btn" aria-label="Open in new tab" href={url || undefined} target="_blank" rel="noreferrer noopener"><Icon name="external-link" size={13} /></a>
      </div>
      <div className="ef-webprev__stage" style={{ height }}>
        {children
          ? <div className="ef-webprev__fake" style={width ? { width } : null}>{children}</div>
          : url
            ? <iframe key={url + '-' + key} className="ef-webprev__frame" src={url} title="Web preview" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" style={width ? { width } : null}></iframe>
            : <div className="ef-webprev__empty">Enter a URL to preview</div>}
      </div>
      <div className="ef-webprev__consbody"><div className="ef-webprev__consclip">
        <div className="ef-webprev__cons">
          {logs.map((l, i) => (
            <div key={i} className={`ef-webprev__log${l.level && l.level !== 'log' ? ' ef-webprev__log--' + l.level : ''}`}>
              {LOG_ICON[l.level] ? <span className="ef-webprev__logicon"><Icon name={LOG_ICON[l.level]} size={12} /></span> : null}
              <span>{l.text}</span>
            </div>
          ))}
          {!logs.length ? <div className="ef-webprev__log" style={{ color: 'var(--text-muted)' }}>Console is empty</div> : null}
        </div>
      </div></div>
    </div>
  );
}
