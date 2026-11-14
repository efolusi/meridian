'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-copyfield{position:relative;display:flex;flex-direction:column;gap:6px}
.ef-copyfield__label{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-copyfield{min-width:0}
.ef-copyfield__box{display:flex;align-items:center;gap:8px;min-width:0;max-width:100%;height:var(--control-h-md);padding:0 4px 0 12px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-sunken)}
.ef-copyfield__sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.ef-copyfield__value{flex:1;min-width:0;font-family:var(--font-mono);font-size:13px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;user-select:all}
`;
export function CopyField({ label, value, secret, style, className, ...rest }) {
  injectEfCss('ef-css-copyfield', CSS);
  const [show, setShow] = React.useState(!secret);
  // 'idle' | 'done' | 'failed': only a resolved clipboard write counts as copied.
  const [copied, setCopied] = React.useState('idle');
  const timer = React.useRef(null);
  const live = React.useRef(true);
  React.useEffect(() => { live.current = true; return () => { live.current = false; clearTimeout(timer.current); }; }, []);
  const copy = () => {
    const write = typeof navigator !== 'undefined' && navigator.clipboard
      ? navigator.clipboard.writeText(String(value)) : Promise.reject(new Error('no clipboard'));
    const settle = result => {
      if (!live.current) return;
      setCopied(result);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied('idle'), 1600);
    };
    write.then(() => settle('done'), () => settle('failed'));
  };
  const shown = show ? value : '•'.repeat(Math.min(24, String(value).length));
  const box = (
    <span className="ef-copyfield__box">
      <span className="ef-copyfield__value">{shown}</span>
      {secret ? <IconButton icon={show ? 'eye-off' : 'eye'} label={show ? 'Hide' : 'Reveal'} size="sm" onClick={() => setShow(s => !s)} /> : null}
      <IconButton icon={copied === 'done' ? 'check' : copied === 'failed' ? 'circle-alert' : 'copy'} label={copied === 'done' ? 'Copied' : copied === 'failed' ? 'Copy failed' : 'Copy'} size="sm" onClick={copy} />
      <span className="ef-copyfield__sr" role="status">{copied === 'done' ? 'Copied to clipboard' : copied === 'failed' ? 'Copy failed' : ''}</span>
    </span>
  );
  if (!label) return React.cloneElement(box, { ...rest, className: 'ef-copyfield__box' + (className ? ' ' + className : ''), style });
  return (
    <span {...rest} className={`ef-copyfield${className ? ' ' + className : ''}`} style={style}>
      <span className="ef-copyfield__label">{label}</span>{box}
    </span>
  );
}
