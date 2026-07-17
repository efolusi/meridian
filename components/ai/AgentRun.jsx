import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-agentrun{display:flex;flex-direction:column}
.ef-agentrun__step{display:flex;gap:12px;position:relative}
.ef-agentrun__rail{display:flex;flex-direction:column;align-items:center;flex:none;width:22px}
.ef-agentrun__dot{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:var(--radius-full);border:1px solid var(--border-strong);background:var(--surface-card);color:var(--text-muted);flex:none}
.ef-agentrun__step--done .ef-agentrun__dot{background:var(--accent);border-color:var(--accent);color:var(--accent-contrast)}
.ef-agentrun__step--active .ef-agentrun__dot{border-color:var(--accent);color:var(--accent)}
.ef-agentrun__step--error .ef-agentrun__dot{background:var(--danger-100);border-color:var(--danger-600);color:var(--danger-600)}
.ef-agentrun__spin{display:inline-flex;animation:ef-agentrun-spin .9s linear infinite}
@keyframes ef-agentrun-spin{to{transform:rotate(360deg)}}
.ef-agentrun__line{width:1px;flex:1;background:var(--border-default);margin:3px 0}
.ef-agentrun__step--done .ef-agentrun__line{background:var(--accent-subtle-border)}
.ef-agentrun__content{flex:1;min-width:0;padding:1px 0 18px}
.ef-agentrun__step:last-child .ef-agentrun__content{padding-bottom:2px}
.ef-agentrun__title{display:flex;align-items:baseline;gap:8px;font-size:var(--text-sm);font-weight:600;color:var(--text-primary)}
.ef-agentrun__step--pending .ef-agentrun__title{color:var(--text-muted);font-weight:500}
.ef-agentrun__time{margin-left:auto;font-family:var(--font-mono);font-size:11px;color:var(--text-muted);flex:none}
.ef-agentrun__detail{font-size:13px;line-height:1.55;color:var(--text-secondary);margin-top:3px}
.ef-agentrun__toggle{display:inline-flex;align-items:center;gap:5px;border:none;background:none;padding:0;cursor:pointer;font-family:var(--font-sans);font-size:12px;font-weight:500;color:var(--text-muted);margin-top:4px}
.ef-agentrun__toggle:hover{color:var(--text-primary)}
.ef-agentrun__toggle:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-agentrun__toggle .ef-agentrun__tchev{display:inline-flex;transition:transform var(--dur-med) var(--ease-out)}
.ef-agentrun__toggle--open .ef-agentrun__tchev{transform:rotate(180deg)}
.ef-agentrun__panel{margin-top:8px;display:flex;flex-direction:column;gap:8px}
`;
export function AgentRun({ steps = [], style, className }) {
  injectEfCss('ef-css-agentrun', CSS);
  const [openIds, setOpenIds] = React.useState(() => new Set(steps.filter(s => s.defaultOpen).map((s, idx) => s.id || idx)));
  const flip = key => setOpenIds(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n; });
  return (
    <div className={`ef-agentrun${className ? ' ' + className : ''}`} style={style} role="list">
      {steps.map((s, i) => {
        const st = s.status || 'pending';
        return (
          <div key={s.id || i} role="listitem" className={`ef-agentrun__step ef-agentrun__step--${st}`}>
            <div className="ef-agentrun__rail">
              <span className="ef-agentrun__dot">
                {st === 'done' ? <Icon name="check" size={12} />
                  : st === 'active' ? <span className="ef-agentrun__spin"><Icon name="loader-circle" size={12} /></span>
                  : st === 'error' ? <Icon name="x" size={12} />
                  : <span style={{ width: 5, height: 5, borderRadius: 99, background: 'currentColor', display: 'inline-block' }}></span>}
              </span>
              {i < steps.length - 1 ? <span className="ef-agentrun__line"></span> : null}
            </div>
            <div className="ef-agentrun__content">
              <div className="ef-agentrun__title">{s.title}{s.time ? <span className="ef-agentrun__time">{s.time}</span> : null}</div>
              {s.detail ? <div className="ef-agentrun__detail">{s.detail}</div> : null}
              {s.children ? (
                <React.Fragment>
                  <button type="button" className={`ef-agentrun__toggle${openIds.has(s.id || i) ? ' ef-agentrun__toggle--open' : ''}`} aria-expanded={openIds.has(s.id || i)} onClick={() => flip(s.id || i)}>
                    {openIds.has(s.id || i) ? 'Hide detail' : 'Show detail'}
                    <span className="ef-agentrun__tchev"><Icon name="chevron-down" size={12} /></span>
                  </button>
                  {openIds.has(s.id || i) ? <div className="ef-agentrun__panel">{s.children}</div> : null}
                </React.Fragment>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
