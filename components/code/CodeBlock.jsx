import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-code{background:var(--surface-inverse);border-radius:var(--radius-md);overflow:hidden}
.ef-code__head{display:flex;align-items:center;padding:7px 8px 7px 14px;border-bottom:1px solid rgba(250,249,246,.1)}
.ef-code__lang{font-family:var(--font-mono);font-size:11px;color:rgba(250,249,246,.55)}
.ef-code__copy{margin-left:auto;display:inline-flex;align-items:center;gap:5px;border:none;background:none;cursor:pointer;color:rgba(250,249,246,.6);font-family:var(--font-sans);font-size:12px;font-weight:var(--weight-semibold);padding:4px 8px;border-radius:var(--radius-sm);transition:color var(--dur-fast) var(--ease-out)}
.ef-code__copy:hover{color:#fff}
.ef-code__copy--done{color:#7FD08D}
.ef-code pre{margin:0;padding:14px 16px;overflow-x:auto;font-family:var(--font-mono);font-size:13px;line-height:1.6;color:#E8E3D9}
.ef-code__win{position:relative;overflow:hidden;transition:height .45s cubic-bezier(.32,.72,0,1)}
.ef-code__fade{position:absolute;left:0;right:0;bottom:0;height:56px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;background:linear-gradient(to top,var(--surface-inverse),transparent)}
.ef-code__more{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(250,249,246,.25);border-radius:var(--radius-full);background:rgba(30,26,20,.85);cursor:pointer;padding:4px 12px;font-family:var(--font-sans);font-size:11.5px;font-weight:var(--weight-semibold);color:rgba(250,249,246,.85)}
.ef-code__more:hover{color:#fff;border-color:rgba(250,249,246,.5)}
`;
export function CodeBlock({ lang, title, children, maxHeight, clip, clipHeight = 240, style, className }) {
  injectEfCss('ef-css-code', CSS);
  const [copied, setCopied] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [full, setFull] = React.useState(null);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!clip) return;
    const el = ref.current;
    if (!el) return;
    const update = () => setFull(el.scrollHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [clip]);
  const copy = () => {
    const text = ref.current ? ref.current.textContent : '';
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className={`ef-code${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-code__head">
        <span className="ef-code__lang">{title || lang}</span>
        <button className={`ef-code__copy${copied ? ' ef-code__copy--done' : ''}`} onClick={copy}>
          <Icon name={copied ? 'check' : 'copy'} size={13} />{copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {clip ? (
        <div className="ef-code__win" style={{ height: full === null ? (open ? undefined : clipHeight) : (open ? full : Math.min(full, clipHeight)) }}>
          <pre ref={ref}>{children}</pre>
          {full !== null && full > clipHeight && !open ? (
            <div className="ef-code__fade"><button type="button" className="ef-code__more" onClick={() => setOpen(true)}><Icon name="chevron-down" size={12} />Show all</button></div>
          ) : null}
          {open && full !== null && full > clipHeight ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 8px' }}><button type="button" className="ef-code__more" onClick={() => setOpen(false)}><Icon name="chevron-up" size={12} />Collapse</button></div>
          ) : null}
        </div>
      ) : (
        <pre ref={ref} style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}>{children}</pre>
      )}
    </div>
  );
}
