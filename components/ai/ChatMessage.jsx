import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { Avatar } from '../display/Avatar.jsx';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-msg{display:flex;gap:12px;max-width:720px}
.ef-msg__avatar{flex:none;margin-top:2px}
.ef-msg__bot{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--accent);color:var(--accent-contrast);flex:none;margin-top:2px}
.ef-msg__meta{display:flex;align-items:baseline;gap:8px}
.ef-msg__name{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-msg__time{font-size:var(--text-xs);color:var(--text-muted)}
.ef-msg__body{font-size:var(--text-md);line-height:var(--leading-relaxed);color:var(--text-primary);margin-top:4px}
.ef-msg--user .ef-msg__body{background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:10px 14px}
.ef-msg__actions{display:flex;gap:2px;margin-top:6px;opacity:0;transition:opacity var(--dur-fast) var(--ease-out)}
.ef-msg:hover .ef-msg__actions{opacity:1}
@keyframes ef-caret{0%,100%{opacity:1}50%{opacity:0}}
.ef-msg__caret{display:inline-block;width:7px;height:15px;background:var(--accent);margin-left:3px;vertical-align:-2px;animation:ef-caret 1s steps(1) infinite}
`;
export function ChatMessage({ role = 'assistant', name, time, streaming, actions, children, style, className }) {
  injectEfCss('ef-css-msg', CSS);
  const who = name || (role === 'user' ? 'You' : role === 'system' ? 'System' : 'Agent');
  return (
    <div className={`ef-msg ef-msg--${role}${className ? ' ' + className : ''}`} style={style}>
      {role === 'assistant' || role === 'system'
        ? <span className="ef-msg__bot"><Icon name="bot" size={15} /></span>
        : <span className="ef-msg__avatar"><Avatar name={who} size={28} /></span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="ef-msg__meta"><span className="ef-msg__name">{who}</span>{time ? <span className="ef-msg__time">{time}</span> : null}</div>
        <div className="ef-msg__body">{children}{streaming ? <span className="ef-msg__caret"></span> : null}</div>
        {actions !== false && role === 'assistant' && !streaming ? (
          <div className="ef-msg__actions">
            <IconButton icon="copy" label="Copy" size="sm" />
            <IconButton icon="refresh-cw" label="Retry" size="sm" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
