import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-code{position:relative;background:var(--surface-code);border:1px solid var(--border-code);border-radius:var(--radius-md);overflow:hidden}
.ef-code__head{display:flex;align-items:center;padding:7px 8px 7px 14px;border-bottom:1px solid var(--code-divider)}
.ef-code__lang{font-family:var(--font-mono);font-size:11px;color:var(--code-ink-subtle)}
.ef-code__copy{margin-inline-start:auto;display:inline-flex;min-height:24px;align-items:center;gap:5px;border:none;background:none;cursor:pointer;color:var(--code-ink-muted);font-family:var(--font-sans);font-size:12px;font-weight:var(--weight-semibold);padding:4px 8px;border-radius:var(--radius-sm);transition:color var(--dur-fast) var(--ease-out)}
.ef-code__copy:hover{color:var(--code-ink-bright)}
.ef-code__copy--done{color:var(--success-on-dark)}
.ef-code__copy--failed{color:var(--danger-on-dark)}
.ef-code__sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
@media (pointer:coarse){.ef-code__copy{min-height:var(--tap-min);min-width:var(--tap-min);justify-content:center}}
.ef-code pre{margin:0;padding:14px 16px;overflow-x:auto;font-family:var(--font-mono);font-size:13px;line-height:1.6;color:var(--text-code)}
.ef-code__win{position:relative;overflow:hidden;transition:height .45s cubic-bezier(.32,.72,0,1)}
.ef-code__fade{position:absolute;inset-inline:0;bottom:0;height:56px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;background:linear-gradient(to top,var(--surface-code),transparent)}
.ef-code__more{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--code-edge);border-radius:var(--radius-full);background:var(--code-raised);cursor:pointer;padding:4px 12px;font-family:var(--font-sans);font-size:11.5px;font-weight:var(--weight-semibold);color:var(--code-ink-strong)}
.ef-code__more:hover{color:var(--code-ink-bright);border-color:var(--code-edge-hover)}
`;
export function CodeBlock({ lang, title, children, maxHeight, clip, clipHeight = 240, style, className, ...rest }) {
  injectEfCss('ef-css-code', CSS);
  // 'idle' | 'done' | 'failed': only a resolved clipboard write counts as copied.
  const [copied, setCopied] = React.useState('idle');
  const timer = React.useRef(null);
  const live = React.useRef(true);
  React.useEffect(() => { live.current = true; return () => { live.current = false; clearTimeout(timer.current); }; }, []);
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
    const write = typeof navigator !== 'undefined' && navigator.clipboard
      ? navigator.clipboard.writeText(text) : Promise.reject(new Error('no clipboard'));
    const settle = result => {
      if (!live.current) return;
      setCopied(result);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied('idle'), 1600);
    };
    write.then(() => settle('done'), () => settle('failed'));
  };
  return (
    <div {...rest} className={`ef-code${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-code__head">
        <span className="ef-code__lang">{title || lang}</span>
        <button type="button" className={`ef-code__copy${copied !== 'idle' ? ' ef-code__copy--' + copied : ''}`} onClick={copy}>
          <Icon name={copied === 'done' ? 'check' : copied === 'failed' ? 'circle-alert' : 'copy'} size={13} />{copied === 'done' ? 'Copied' : copied === 'failed' ? 'Copy failed' : 'Copy'}
        </button>
        <span className="ef-code__sr" role="status">{copied === 'done' ? 'Copied to clipboard' : copied === 'failed' ? 'Copy failed' : ''}</span>
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
