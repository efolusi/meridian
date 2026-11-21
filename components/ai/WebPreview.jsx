'use client';
import React from 'react';
import { injectEfCss, styleRef } from '../runtime/runtime.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-webprev__btn--cons{position:relative}
.ef-webprev__log--empty{color:var(--text-muted)}
.ef-webprev{display:flex;flex-direction:column;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);padding:var(--space-2);font-family:var(--font-sans)}
.ef-webprev__bar{display:flex;align-items:center;gap:var(--space-1);padding:var(--space-0-5) var(--space-1) var(--space-2)}
.ef-webprev__btn{display:inline-flex;align-items:center;justify-content:center;width:var(--control-h-sm);height:var(--control-h-sm);border:none;background:none;cursor:pointer;color:var(--text-muted);border-radius:var(--radius-sm);flex:none;transition:color var(--dur-fast) var(--ease-enter),background var(--dur-fast) var(--ease-enter)}
.ef-webprev__btn:hover{color:var(--text-primary);background:var(--surface-subtle)}
.ef-webprev__btn--on{color:var(--text-primary);background:var(--surface-sunken)}
.ef-webprev__btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-webprev__addr{flex:1;min-width:0;height:30px;padding:0 var(--space-3);border:1px solid var(--border-default);border-radius:var(--radius-full);background:var(--surface-subtle);font-family:var(--font-sans);font-size:var(--text-sm);color:var(--text-secondary);transition:border-color var(--dur-fast) var(--ease-enter),box-shadow var(--dur-fast) var(--ease-enter)}
.ef-webprev__addr:focus{outline:none;border-color:var(--border-strong);box-shadow:var(--focus-ring);color:var(--text-primary)}
.ef-webprev__stage{position:relative;display:flex;justify-content:center;background:var(--surface-sunken);border:1px solid var(--border-default);border-radius:var(--radius-sm);overflow:hidden}
.ef-webprev__frame{border:none;width:100%;height:100%;background:var(--surface-card);transition:width var(--dur-slow) var(--ease-enter)}
.ef-webprev__fake{overflow:auto;background:var(--surface-card);width:100%;height:100%;transition:width var(--dur-slow) var(--ease-enter)}
.ef-webprev__empty{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:var(--text-sm);color:var(--text-muted)}
.ef-webprev__consbody{display:grid;grid-template-rows:0fr;transition:grid-template-rows var(--dur-base) var(--ease-enter)}
.ef-webprev--console .ef-webprev__consbody{grid-template-rows:1fr}
.ef-webprev__consclip{overflow:hidden;min-height:0}
.ef-webprev__cons{margin-top:var(--space-2);border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--surface-subtle);max-height:180px;overflow-y:auto;font-family:var(--font-mono);font-size:var(--text-xs);line-height:1.6}
.ef-webprev__log{display:flex;gap:var(--space-2);padding:var(--space-1) var(--space-3);border-top:1px solid var(--border-default);color:var(--text-secondary)}
.ef-webprev__log:first-child{border-top:none}
.ef-webprev__log--warning{color:var(--warning-600)}
.ef-webprev__log--danger{color:var(--danger-600)}
.ef-webprev__logicon{display:inline-flex;flex:none;margin-top:var(--space-0-5)}
.ef-webprev__badge{position:absolute;top:3px;inset-inline-end:3px;min-width:14px;height:14px;padding:0 var(--space-1);border-radius:var(--radius-full);background:var(--danger-600);color:var(--danger-contrast);font-size:9.5px;font-weight:var(--weight-semibold);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-sans)}
@media (pointer:coarse){.ef-webprev__btn{min-width:var(--tap-min);min-height:var(--tap-min)}}
/* Reduced motion: nothing moves or resizes; the end state is shown at once. */
@media (prefers-reduced-motion:reduce){.ef-webprev__frame,.ef-webprev__fake{transition:none}}
`;
// Model-supplied URL: only http(s), mailto and relative pass (see Citation.jsx).
function safeUrl(url) {
  if (url == null || url === '') return undefined;
  const s = String(url);
  const scheme = /^\s*([a-z][a-z0-9+.-]*):/i.exec(s.replace(/[\u0000-\u001F\u007F]/g, ''));
  return !scheme || /^(https?|mailto)$/i.test(scheme[1]) ? s : undefined;
}
const VIEWPORTS = [{ id: 'desktop', icon: 'monitor', width: null }, { id: 'tablet', icon: 'tablet', width: 768 }, { id: 'mobile', icon: 'smartphone', width: 390 }];
export function WebPreview({ url: urlProp = '', height = 340, logs = [], defaultOpen = false, children, onUrlChange, style, className, ...rest }) {
  injectEfCss('ef-css-webprev', CSS);
  const [url, setUrl] = React.useState(urlProp);
  const [draft, setDraft] = React.useState(urlProp);
  const [key, setKey] = React.useState(0);
  const [vp, setVp] = React.useState('desktop');
  const [cons, setCons] = React.useState(!!defaultOpen);
  // Controlled-capable url: a changed url prop is adopted into state, so a parent
  // can drive navigation (address bar + iframe follow it) between user edits.
  React.useEffect(() => { setUrl(urlProp); setDraft(urlProp); }, [urlProp]);
  const errs = logs.filter(l => l.level === 'danger').length;
  const commit = v => {
    const t = v.trim();
    const next = !t || /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : 'https://' + t;
    setDraft(next); setUrl(next);
    if (onUrlChange) onUrlChange(next);
  };
  const safe = safeUrl(url);
  const width = (VIEWPORTS.find(v => v.id === vp) || {}).width;
  const LOG_ICON = { warning: 'triangle-alert', danger: 'circle-alert', info: 'info' };
  return (
    <div {...rest} className={`ef-webprev${cons ? ' ef-webprev--console' : ''}${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-webprev__bar">
        <button type="button" className="ef-webprev__btn" aria-label="Reload" onClick={() => setKey(k => k + 1)}><Icon name="refresh-cw" size={12} /></button>
        <input className="ef-webprev__addr" type="text" value={draft} placeholder="Enter a URL to preview" spellCheck={false}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { commit(draft); e.currentTarget.blur(); } if (e.key === 'Escape') { setDraft(url); e.currentTarget.blur(); } }}
          onBlur={() => setDraft(url)} onFocus={e => e.currentTarget.select()} />
        {VIEWPORTS.map(v => (
          <button key={v.id} type="button" className={`ef-webprev__btn${vp === v.id ? ' ef-webprev__btn--on' : ''}`} aria-label={v.id} aria-pressed={vp === v.id} onClick={() => setVp(v.id)}><Icon name={v.icon} size={16} /></button>
        ))}
        <button type="button" className={`ef-webprev__btn ef-webprev__btn--cons${cons ? ' ef-webprev__btn--on' : ''}`} aria-label="Console" aria-pressed={cons} onClick={() => setCons(!cons)}>
          <Icon name="terminal" size={16} />
          {errs ? <span className="ef-webprev__badge">{errs}</span> : null}
        </button>
        <a className="ef-webprev__btn" aria-label="Open in new tab" href={safe} target="_blank" rel="noreferrer noopener"><Icon name="external-link" size={12} /></a>
      </div>
      <div className="ef-webprev__stage" ref={styleRef({ height })}>
        {children
          ? <div className="ef-webprev__fake" ref={styleRef({ width })}>{children}</div>
          : safe
            ? <iframe key={safe + '-' + key} className="ef-webprev__frame" src={safe} title="Web preview" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" ref={styleRef({ width })}></iframe>
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
          {!logs.length ? <div className="ef-webprev__log ef-webprev__log--empty">Console is empty</div> : null}
        </div>
      </div></div>
    </div>
  );
}
