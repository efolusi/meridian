import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-composer{display:flex;flex-direction:column;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-lg);transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-composer:focus-within{border-color:var(--accent);box-shadow:var(--focus-ring)}
.ef-composer__input{border:none;background:none;resize:none;padding:14px 16px 6px;font-family:var(--font-sans);font-size:var(--text-md);line-height:1.5;color:var(--text-primary);outline:none;min-height:24px}
.ef-composer__input::placeholder{color:var(--text-muted)}
.ef-composer__bar{display:flex;align-items:center;gap:2px;padding:6px 8px 8px}
.ef-composer__send{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;margin-left:auto;border:none;border-radius:var(--radius-md);background:var(--accent);color:var(--accent-contrast);cursor:pointer;transition:background var(--dur-fast) var(--ease-out),transform var(--dur-fast) var(--ease-out)}
.ef-composer__send:hover:not(:disabled){background:var(--accent-hover)}
.ef-composer__send:active:not(:disabled){transform:scale(.95)}
.ef-composer__send:disabled{background:var(--sand-200);color:var(--sand-400);cursor:not-allowed}
.ef-composer__send:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-composer__hint{font-size:var(--text-xs);color:var(--text-muted);padding:0 4px}
`;
export function PromptComposer({ value, defaultValue, onChange, onSend, onAttach, onVoice, busy, onStop, placeholder = 'Ask the agent anything…', rows = 2, disabled, attachments, hint, style, className, ...rest }) {
  injectEfCss('ef-css-composer', CSS);
  const [inner, setInner] = React.useState(defaultValue || '');
  const v = value != null ? value : inner;
  const set = (t, e) => { if (value == null) setInner(t); if (onChange) onChange(t, e); };
  const send = () => { if (v.trim() && onSend && !disabled) { onSend(v); if (value == null) setInner(''); } };
  return (
    <div {...rest} className={`ef-composer${className ? ' ' + className : ''}`} style={style}>
      {attachments ? <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '10px 12px 0' }}>{attachments}</div> : null}
      <textarea className="ef-composer__input" rows={rows} placeholder={placeholder} value={v} disabled={disabled}
        onChange={e => set(e.target.value, e)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
      <div className="ef-composer__bar">
        {onAttach ? <IconButton icon="paperclip" label="Attach files" size="sm" onClick={onAttach} /> : null}
        {onVoice ? <IconButton icon="mic" label="Voice input" size="sm" onClick={onVoice} /> : null}
        {hint ? <span className="ef-composer__hint">{hint}</span> : null}
        {busy
          ? <button className="ef-composer__send" aria-label="Stop generating" onClick={onStop} disabled={!onStop}>
              <Icon name="square" size={13} strokeWidth={2.5} />
            </button>
          : <button className="ef-composer__send" aria-label="Send" disabled={disabled || !v.trim()} onClick={send}>
              <Icon name="arrow-up-right" size={16} strokeWidth={2} style={{ transform: 'rotate(-45deg)' }} />
            </button>}
      </div>
    </div>
  );
}
