import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-copyfield{display:flex;flex-direction:column;gap:6px}
.ef-copyfield__label{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-copyfield__box{display:flex;align-items:center;gap:8px;height:var(--control-h-md);padding:0 4px 0 12px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-sunken)}
.ef-copyfield__value{flex:1;font-family:var(--font-mono);font-size:13px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;user-select:all}
`;
export function CopyField({ label, value, secret, style, className }) {
  injectEfCss('ef-css-copyfield', CSS);
  const [show, setShow] = React.useState(!secret);
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };
  const shown = show ? value : '•'.repeat(Math.min(24, String(value).length));
  const box = (
    <span className="ef-copyfield__box">
      <span className="ef-copyfield__value">{shown}</span>
      {secret ? <IconButton icon={show ? 'eye-off' : 'eye'} label={show ? 'Hide' : 'Reveal'} size="sm" onClick={() => setShow(s => !s)} /> : null}
      <IconButton icon={copied ? 'check' : 'copy'} label="Copy" size="sm" onClick={copy} />
    </span>
  );
  if (!label) return React.cloneElement(box, { className: 'ef-copyfield__box' + (className ? ' ' + className : ''), style });
  return (
    <span className={`ef-copyfield${className ? ' ' + className : ''}`} style={style}>
      <span className="ef-copyfield__label">{label}</span>{box}
    </span>
  );
}
