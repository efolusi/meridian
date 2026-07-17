import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-citation{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 4px;margin:0 1px;vertical-align:super;border-radius:var(--radius-sm);border:1px solid var(--accent-subtle-border);background:var(--accent-subtle);color:var(--brand-700);font-family:var(--font-mono);font-size:10px;font-weight:600;text-decoration:none;cursor:pointer;line-height:1}
.ef-citation:hover{border-color:var(--brand-700)}
.ef-citation:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-citation__wrap{position:relative;display:inline}
.ef-citation__pop{position:absolute;bottom:calc(100% + 8px);left:0;width:280px;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:12px;z-index:var(--z-popover);animation:ef-citation-in var(--dur-fast) var(--ease-out);cursor:default;text-align:left}
@keyframes ef-citation-in{from{opacity:0;transform:translateY(3px)}}
.ef-citation__pop-name{display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:11px;color:var(--text-muted)}
.ef-citation__pop-title{font-size:13.5px;font-weight:600;color:var(--text-primary);line-height:1.4;margin-top:5px}
.ef-citation__pop-desc{font-size:12.5px;line-height:1.55;color:var(--text-secondary);margin-top:5px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.ef-citation__pop-nav{display:flex;align-items:center;gap:4px;margin-top:9px;padding-top:8px;border-top:1px solid var(--border-default)}
.ef-citation__pop-btn{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:1px solid var(--border-default);border-radius:var(--radius-sm);background:none;cursor:pointer;color:var(--text-secondary)}
.ef-citation__pop-btn:hover{color:var(--text-primary);background:var(--surface-subtle)}
.ef-citation__pop-count{margin-left:auto;font-family:var(--font-mono);font-size:11px;color:var(--text-muted)}
.ef-sources{display:flex;flex-direction:column;border:1px solid var(--border-default);border-radius:var(--radius-md);overflow:hidden}
.ef-sources__head{padding:9px 13px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted);background:var(--surface-subtle);border-bottom:1px solid var(--border-default)}
.ef-sources__item{display:flex;align-items:center;gap:10px;padding:9px 13px;text-decoration:none;border-bottom:1px solid var(--border-default);transition:background var(--dur-fast) var(--ease-out)}
.ef-sources__item:last-child{border-bottom:none}
.ef-sources__item:hover{background:var(--surface-subtle)}
.ef-sources__item:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-sources__num{flex:none;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:var(--radius-sm);background:var(--accent-subtle);color:var(--brand-700);font-family:var(--font-mono);font-size:10.5px;font-weight:600}
.ef-sources__title{flex:1;min-width:0;font-size:13.5px;font-weight:500;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ef-sources__domain{flex:none;font-family:var(--font-mono);font-size:11.5px;color:var(--text-muted)}
.ef-sources__ext{flex:none;display:inline-flex;color:var(--text-muted)}
`;
export function Citation({ index, href, title, sources, onClick, style, className }) {
  injectEfCss('ef-css-citation', CSS);
  const [open, setOpen] = React.useState(false);
  const [i, setI] = React.useState(0);
  const t = React.useRef(null);
  const list = sources && sources.length ? sources : null;
  const enter = () => { if (!list) return; clearTimeout(t.current); t.current = setTimeout(() => setOpen(true), 200); };
  const leave = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(false), 180); };
  React.useEffect(() => () => clearTimeout(t.current), []);
  const chip = (
    <a href={href || (list && list[0] && list[0].url) || '#'} title={title} onClick={onClick} target={href ? '_blank' : undefined} rel={href ? 'noopener' : undefined}
      className={`ef-citation${className ? ' ' + className : ''}`} style={list ? null : style} aria-label={title ? 'Source ' + index + ': ' + title : 'Source ' + index}>{index}</a>
  );
  if (!list) return chip;
  const cur = list[Math.abs(i) % list.length];
  return (
    <span className="ef-citation__wrap" style={style} onMouseEnter={enter} onMouseLeave={leave}>
      {chip}
      {open ? (
        <span className="ef-citation__pop" role="dialog">
          <span className="ef-citation__pop-name"><Icon name="globe" size={11} />{cur.domain || 'source'}</span>
          <span className="ef-citation__pop-title" style={{ display: 'block' }}>{cur.title}</span>
          {cur.description ? <span className="ef-citation__pop-desc" style={{ display: 'block' }}>{cur.description}</span> : null}
          {list.length > 1 ? (
            <span className="ef-citation__pop-nav" style={{ display: 'flex' }}>
              <button type="button" aria-label="Previous source" className="ef-citation__pop-btn" onClick={() => setI((i - 1 + list.length) % list.length)}><Icon name="chevron-left" size={12} /></button>
              <button type="button" aria-label="Next source" className="ef-citation__pop-btn" onClick={() => setI((i + 1) % list.length)}><Icon name="chevron-right" size={12} /></button>
              <span className="ef-citation__pop-count">{(Math.abs(i) % list.length) + 1}/{list.length}</span>
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
export function SourceList({ sources = [], title = 'Sources', style, className }) {
  injectEfCss('ef-css-citation', CSS);
  return (
    <div className={`ef-sources${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-sources__head">{title}</div>
      {sources.map((s, i) => (
        <a key={s.index || i} className="ef-sources__item" href={s.url || '#'} target={s.url ? '_blank' : undefined} rel={s.url ? 'noopener' : undefined}>
          <span className="ef-sources__num">{s.index || i + 1}</span>
          <span className="ef-sources__title">{s.title}</span>
          {s.domain ? <span className="ef-sources__domain">{s.domain}</span> : null}
          <span className="ef-sources__ext"><Icon name="external-link" size={12} /></span>
        </a>
      ))}
    </div>
  );
}
