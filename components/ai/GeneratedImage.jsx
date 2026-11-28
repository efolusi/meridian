'use client';
import React from 'react';
import { injectEfCss } from '../runtime/runtime.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-genimg{position:relative;width:100%;overflow:hidden;border-radius:var(--radius-md);border:1px solid var(--border-default);background:var(--surface-sunken);font-family:var(--font-sans)}
.ef-genimg--square{aspect-ratio:1}
.ef-genimg--video{aspect-ratio:16/9}
.ef-genimg--portrait{aspect-ratio:3/4}
.ef-genimg--danger{border-color:var(--status-danger-border);box-shadow:0 0 0 3px var(--status-danger-bg)}
.ef-genimg__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity var(--dur-slow) var(--ease-enter)}
.ef-genimg--complete .ef-genimg__img{opacity:1}
.ef-genimg--danger .ef-genimg__img{opacity:.3}
.ef-genimg__dark{position:absolute;inset:0;background:var(--media-backdrop);opacity:0;transition:opacity var(--dur-base) var(--ease-enter);pointer-events:none}
.ef-genimg--busy .ef-genimg__dark{opacity:1}
.ef-genimg__backdrop{position:absolute;inset:0;background:var(--media-backdrop-dot);-webkit-mask-image:radial-gradient(ellipse at center,black 10%,transparent 78%);mask-image:radial-gradient(ellipse at center,black 10%,transparent 78%);animation:ef-genimg-pulse 2.8s ease-in-out infinite}
@keyframes ef-genimg-pulse{0%,100%{opacity:.45}50%{opacity:1}}
.ef-genimg__scrim{position:absolute;inset-inline:0;pointer-events:none;opacity:0;transition:opacity var(--dur-base) var(--ease-enter)}
.ef-genimg--complete .ef-genimg__scrim{opacity:1}
.ef-genimg__scrim--top{top:0;height:34%;background:linear-gradient(to bottom,var(--media-scrim),transparent)}
.ef-genimg__prompt{position:absolute;top:13px;inset-inline:16px;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary);z-index:2}
.ef-genimg--busy .ef-genimg__prompt,.ef-genimg--complete .ef-genimg__prompt{color:var(--text-on-media)}
.ef-genimg__status{position:absolute;inset-inline-start:16px;bottom:13px;font-size:var(--text-sm);color:var(--text-on-media-muted);z-index:2;animation:ef-genimg-pulse 1.6s ease-in-out infinite}
.ef-genimg__center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--space-3);color:var(--text-muted);font-size:var(--text-sm);z-index:2;padding:var(--space-5);text-align:center}
.ef-genimg__actions{position:absolute;top:9px;inset-inline-end:9px;display:flex;gap:var(--space-0-5);z-index:3;transition:opacity var(--dur-fast) var(--ease-enter)}
/* Revealed by a pointer that can hover; shown at rest where nothing hovers, so a touch user can reach the actions. */
@media (hover:hover){.ef-genimg__actions{opacity:0}.ef-genimg--complete:hover .ef-genimg__actions,.ef-genimg--complete:focus-within .ef-genimg__actions{opacity:1}}
@media (hover:none),(pointer:coarse){.ef-genimg__actions{opacity:1}}
.ef-genimg__act{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;cursor:pointer;color:var(--text-on-media);background:var(--media-scrim-soft);border-radius:var(--radius-sm);backdrop-filter:blur(2px);transition:background var(--dur-fast) var(--ease-enter)}
@media (hover:hover){.ef-genimg__act:hover{background:var(--media-scrim-strong)}}
.ef-genimg__act:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-genimg__retry{display:inline-flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border:1px solid var(--border-strong);border-radius:var(--radius-full);background:var(--surface-card);cursor:pointer;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-genimg__err{color:var(--status-danger-text)}
@media (pointer:coarse){.ef-genimg__act{min-width:var(--tap-min);min-height:var(--tap-min)}}
`;
export function GeneratedImage({ status = 'complete', src, alt, prompt, aspect = 'square', error, onRetry, actions, style, className, ...rest }) {
  const s = status;
  injectEfCss('ef-css-genimg', CSS);
  return (
    <div {...rest} className={`ef-genimg ef-genimg--${aspect} ef-genimg--${s}${className ? ' ' + className : ''}`} style={style} data-state={s}>
      {src && (s === 'complete' || s === 'danger') ? <img className="ef-genimg__img" src={src} alt={alt || prompt || ''} /> : null}
      <div className="ef-genimg__dark">{s === 'busy' ? <div className="ef-genimg__backdrop"></div> : null}</div>
      <div className="ef-genimg__scrim ef-genimg__scrim--top" aria-hidden="true"></div>
      {prompt ? <div className="ef-genimg__prompt">{prompt}</div> : null}
      {s === 'queued' ? <div className="ef-genimg__center"><Icon name="image" size={20} /><span>Queued…</span></div> : null}
      {s === 'busy' ? <div className="ef-genimg__status">Generating…</div> : null}
      {s === 'danger' ? (
        <div className="ef-genimg__center">
          <span className="ef-genimg__err"><Icon name="circle-alert" size={20} /></span>
          <span className="ef-genimg__err">{error || 'Generation failed'}</span>
          {onRetry ? <button type="button" className="ef-genimg__retry" onClick={onRetry}><Icon name="refresh-cw" size={12} />Retry</button> : null}
        </div>
      ) : null}
      {actions && actions.length ? (
        <div className="ef-genimg__actions">
          {actions.map((a, i) => <button key={i} type="button" className="ef-genimg__act" aria-label={a.label} title={a.label} onClick={a.onClick}><Icon name={a.icon} size={16} /></button>)}
        </div>
      ) : null}
    </div>
  );
}
