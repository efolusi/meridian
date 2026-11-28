'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';
const CSS = `
.ef-composer__attach{display:flex;gap:var(--space-2);flex-wrap:wrap;padding:10px 12px 0}.ef-composer__send-icon{transform:rotate(-45deg)}
.ef-composer{display:flex;flex-direction:column;background:var(--surface-card);border:1px solid var(--border-strong);border-radius:var(--radius-lg);transition:border-color var(--dur-fast) var(--ease-enter),box-shadow var(--dur-fast) var(--ease-enter)}
.ef-composer:focus-within{border-color:var(--accent-edge);box-shadow:var(--focus-ring)}
.ef-composer__input{border:none;background:none;resize:none;padding:var(--space-4) var(--space-4) var(--space-2);font-family:var(--font-sans);font-size:var(--text-md);line-height:1.5;color:var(--text-primary);outline:none;min-height:24px}
.ef-composer__input::placeholder{color:var(--text-muted)}
.ef-composer__bar{display:flex;align-items:center;gap:var(--space-0-5);padding:var(--space-2) var(--space-2) var(--space-2)}
.ef-composer__send{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;margin-inline-start:auto;border:none;border-radius:var(--radius-md);background:var(--accent);box-shadow:inset 0 0 0 1px var(--accent-edge);color:var(--accent-contrast);cursor:pointer;transition:background var(--dur-fast) var(--ease-enter),transform var(--dur-fast) var(--ease-enter)}
@media (hover:hover){.ef-composer__send:hover:not(:disabled){background:var(--accent-hover)}}
.ef-composer__send:active:not(:disabled){transform:scale(var(--motion-press))}
.ef-composer__send:disabled{background:var(--sand-200);color:var(--sand-400);cursor:not-allowed}
.ef-composer__send:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-composer__hint{font-size:var(--text-xs);color:var(--text-muted);padding:0 var(--space-1)}
@media (pointer:coarse){.ef-composer__send{min-width:var(--tap-min);min-height:var(--tap-min)}}
`;
export const PromptComposer = React.forwardRef(function PromptComposer({ value, defaultValue, onChange, onSend, onAttach, onVoice, busy, onStop, placeholder = 'Ask the agent anything…', rows = 2, disabled, attachments, hint, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, style, className, ...rest }, ref) {
  injectEfCss('ef-css-composer', CSS);
  const [inner, setInner] = React.useState(defaultValue || '');
  const v = value != null ? value : inner;
  const set = (t, e) => { if (value == null) setInner(t); if (onChange) onChange(t, e); };
  const send = () => { if (v.trim() && onSend && !disabled) { onSend(v); if (value == null) setInner(''); } };
  return (
    <div ref={ref} {...rest} className={`ef-composer${className ? ' ' + className : ''}`} style={style}>
      {attachments ? <div className="ef-composer__attach">{attachments}</div> : null}
      <textarea className="ef-composer__input" rows={rows} placeholder={placeholder} value={v} disabled={disabled}
        aria-label={ariaLabelledby ? undefined : ariaLabel || placeholder} aria-labelledby={ariaLabelledby}
        onChange={e => set(e.target.value, e)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
      <div className="ef-composer__bar">
        {onAttach ? <IconButton icon="paperclip" label="Attach files" size="sm" onClick={onAttach} /> : null}
        {onVoice ? <IconButton icon="mic" label="Voice input" size="sm" onClick={onVoice} /> : null}
        {hint ? <span className="ef-composer__hint">{hint}</span> : null}
        {busy
          ? <button type="button" className="ef-composer__send" aria-label="Stop generating" onClick={onStop} disabled={!onStop}>
              <Icon name="square" size={12} strokeWidth={2.5} />
            </button>
          : <button type="button" className="ef-composer__send" aria-label="Send" disabled={disabled || !v.trim()} onClick={send}>
              <Icon name="arrow-up-right" size={16} strokeWidth={2} className="ef-composer__send-icon" />
            </button>}
      </div>
    </div>
  );
});
