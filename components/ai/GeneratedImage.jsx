import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-genimg{position:relative;width:100%;overflow:hidden;border-radius:var(--radius-md);border:1px solid var(--border-default);background:var(--surface-sunken);font-family:var(--font-sans)}
.ef-genimg--square{aspect-ratio:1}
.ef-genimg--video{aspect-ratio:16/9}
.ef-genimg--portrait{aspect-ratio:3/4}
.ef-genimg--error{border-color:var(--danger-300);box-shadow:0 0 0 3px var(--danger-100)}
.ef-genimg__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .5s var(--ease-out)}
.ef-genimg--complete .ef-genimg__img{opacity:1}
.ef-genimg--error .ef-genimg__img{opacity:.3}
.ef-genimg__dark{position:absolute;inset:0;background:var(--media-backdrop);opacity:0;transition:opacity var(--dur-med) var(--ease-out);pointer-events:none}
.ef-genimg--generating .ef-genimg__dark{opacity:1}
.ef-genimg__dots{position:absolute;inset:0;background-image:radial-gradient(circle,var(--media-backdrop-dot) 1.3px,transparent 1.7px);background-size:30px 30px;-webkit-mask-image:radial-gradient(ellipse at center,black 10%,transparent 78%);mask-image:radial-gradient(ellipse at center,black 10%,transparent 78%);animation:ef-genimg-pulse 2.8s ease-in-out infinite}
@keyframes ef-genimg-pulse{0%,100%{opacity:.45}50%{opacity:1}}
.ef-genimg__scrim{position:absolute;left:0;right:0;pointer-events:none;opacity:0;transition:opacity var(--dur-med) var(--ease-out)}
.ef-genimg--complete .ef-genimg__scrim{opacity:1}
.ef-genimg__scrim--top{top:0;height:34%;background:linear-gradient(to bottom,var(--media-scrim),transparent)}
.ef-genimg__prompt{position:absolute;top:13px;left:16px;right:16px;font-size:13px;font-weight:var(--weight-semibold);color:var(--text-primary);z-index:2}
.ef-genimg--generating .ef-genimg__prompt,.ef-genimg--complete .ef-genimg__prompt{color:var(--text-on-media)}
.ef-genimg__status{position:absolute;left:16px;bottom:13px;font-size:12.5px;color:var(--text-on-media-muted);z-index:2;animation:ef-genimg-pulse 1.6s ease-in-out infinite}
.ef-genimg__center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--text-muted);font-size:13px;z-index:2;padding:20px;text-align:center}
.ef-genimg__actions{position:absolute;top:9px;right:9px;display:flex;gap:2px;z-index:3;opacity:0;transition:opacity var(--dur-fast) var(--ease-out)}
.ef-genimg--complete:hover .ef-genimg__actions,.ef-genimg--complete:focus-within .ef-genimg__actions{opacity:1}
.ef-genimg__act{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;cursor:pointer;color:var(--text-on-media);background:var(--media-scrim-soft);border-radius:var(--radius-sm);backdrop-filter:blur(2px);transition:background var(--dur-fast) var(--ease-out)}
.ef-genimg__act:hover{background:var(--media-scrim-strong)}
.ef-genimg__act:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-genimg__retry{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border:1px solid var(--border-strong);border-radius:var(--radius-full);background:var(--surface-card);cursor:pointer;font-family:var(--font-sans);font-size:12.5px;font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-genimg__err{color:var(--danger-600)}
`;
export function GeneratedImage({ state = 'complete', src, alt, prompt, aspect = 'square', error, onRetry, actions, style, className, ...rest }) {
  injectEfCss('ef-css-genimg', CSS);
  return (
    <div {...rest} className={`ef-genimg ef-genimg--${aspect} ef-genimg--${state}${className ? ' ' + className : ''}`} style={style} data-state={state}>
      {src && (state === 'complete' || state === 'error') ? <img className="ef-genimg__img" src={src} alt={alt || prompt || ''} /> : null}
      <div className="ef-genimg__dark">{state === 'generating' ? <div className="ef-genimg__dots"></div> : null}</div>
      <div className="ef-genimg__scrim ef-genimg__scrim--top" aria-hidden="true"></div>
      {prompt ? <div className="ef-genimg__prompt">{prompt}</div> : null}
      {state === 'queued' ? <div className="ef-genimg__center"><Icon name="image" size={20} /><span>Queued…</span></div> : null}
      {state === 'generating' ? <div className="ef-genimg__status">Generating…</div> : null}
      {state === 'error' ? (
        <div className="ef-genimg__center">
          <span className="ef-genimg__err"><Icon name="circle-alert" size={20} /></span>
          <span className="ef-genimg__err">{error || 'Generation failed'}</span>
          {onRetry ? <button type="button" className="ef-genimg__retry" onClick={onRetry}><Icon name="refresh-cw" size={13} />Retry</button> : null}
        </div>
      ) : null}
      {actions && actions.length ? (
        <div className="ef-genimg__actions">
          {actions.map((a, i) => <button key={i} type="button" className="ef-genimg__act" aria-label={a.label} title={a.label} onClick={a.onClick}><Icon name={a.icon} size={14} /></button>)}
        </div>
      ) : null}
    </div>
  );
}
