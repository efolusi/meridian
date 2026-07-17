import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-feedback{display:inline-flex;align-items:center;gap:2px}
.ef-feedback__btn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border:none;border-radius:var(--radius-sm);background:none;cursor:pointer;color:var(--text-muted);transition:color var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-feedback__btn:hover{color:var(--text-primary);background:var(--surface-sunken)}
.ef-feedback__btn:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-feedback__btn--on{color:var(--brand-700);background:var(--accent-subtle)}
.ef-feedback__sep{width:1px;height:14px;background:var(--border-default);margin:0 5px}
.ef-feedback__note{font-size:11.5px;color:var(--text-muted);margin-left:6px}
`;
export function FeedbackBar({ onFeedback, onCopy, onRetry, copyText, note, style, className }) {
  injectEfCss('ef-css-feedback', CSS);
  const [vote, setVote] = React.useState(null);
  const [copied, setCopied] = React.useState(false);
  const cast = dir => {
    const next = vote === dir ? null : dir;
    setVote(next);
    if (onFeedback) onFeedback(next);
  };
  const copy = () => {
    if (copyText) { try { navigator.clipboard.writeText(copyText); } catch (e) {} }
    if (onCopy) onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className={`ef-feedback${className ? ' ' + className : ''}`} style={style}>
      <button type="button" aria-label="Good response" aria-pressed={vote === 'up'} className={`ef-feedback__btn${vote === 'up' ? ' ef-feedback__btn--on' : ''}`} onClick={() => cast('up')}><Icon name="thumbs-up" size={13} /></button>
      <button type="button" aria-label="Bad response" aria-pressed={vote === 'down'} className={`ef-feedback__btn${vote === 'down' ? ' ef-feedback__btn--on' : ''}`} onClick={() => cast('down')}><Icon name="thumbs-down" size={13} /></button>
      <span className="ef-feedback__sep"></span>
      {onCopy || copyText ? <button type="button" aria-label="Copy" className={`ef-feedback__btn${copied ? ' ef-feedback__btn--on' : ''}`} onClick={copy}><Icon name={copied ? 'check' : 'copy'} size={13} /></button> : null}
      {onRetry ? <button type="button" aria-label="Regenerate" className="ef-feedback__btn" onClick={onRetry}><Icon name="refresh-cw" size={13} /></button> : null}
      {note ? <span className="ef-feedback__note">{note}</span> : null}
    </div>
  );
}
