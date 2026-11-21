'use client';
import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { Avatar, AvatarFallback } from '../display/Avatar.jsx';
import { IconButton } from '../forms/IconButton.jsx';
import { injectEfCss } from '../runtime/runtime.jsx';
const CSS = `
.ef-msg__main{flex:1;min-width:0}
.ef-msg{display:flex;gap:var(--space-3);max-width:720px}
.ef-msg__avatar{flex:none;margin-top:var(--space-0-5)}
.ef-msg__bot{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--accent);color:var(--accent-contrast);flex:none;margin-top:var(--space-0-5)}
.ef-msg__meta{display:flex;align-items:baseline;gap:var(--space-2)}
.ef-msg__name{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary)}
.ef-msg__time{font-size:var(--text-xs);color:var(--text-muted)}
.ef-msg__body{font-size:var(--text-md);line-height:var(--leading-relaxed);color:var(--text-primary);margin-top:var(--space-1)}
.ef-msg--user .ef-msg__body{background:var(--surface-card);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:var(--space-3) var(--space-4)}
.ef-msg__actions{display:flex;gap:var(--space-0-5);margin-top:var(--space-2);opacity:0;transition:opacity var(--dur-fast) var(--ease-enter)}
.ef-msg:hover .ef-msg__actions,.ef-msg:focus-within .ef-msg__actions{opacity:1}
@keyframes ef-caret{0%,100%{opacity:1}50%{opacity:0}}
.ef-msg__caret{display:inline-block;width:7px;height:15px;background:var(--accent);margin-inline-start:var(--space-1);vertical-align:-2px;animation:ef-caret 1s steps(1) infinite}
`;
export function ChatMessage({ role = 'assistant', name, time, streaming, actions, onCopy, onRetry, children, style, className, ...rest }) {
  injectEfCss('ef-css-msg', CSS);
  const who = name || (role === 'user' ? 'You' : role === 'system' ? 'System' : 'Agent');
  // Only render an action a caller can actually handle: a button with nowhere to
  // go is worse than no button. `actions` may be a node to replace the row wholesale.
  const builtIn = onCopy || onRetry ? (
    <React.Fragment>
      {onCopy ? <IconButton icon="copy" label="Copy" size="sm" onClick={onCopy} /> : null}
      {onRetry ? <IconButton icon="refresh-cw" label="Retry" size="sm" onClick={onRetry} /> : null}
    </React.Fragment>
  ) : null;
  const actionRow = actions === false ? null : (actions != null && actions !== true ? actions : builtIn);
  return (
    <div {...rest} className={`ef-msg ef-msg--${role}${className ? ' ' + className : ''}`} style={style}>
      {role === 'assistant' || role === 'system'
        ? <span className="ef-msg__bot"><Icon name="bot" size={16} /></span>
        : <span className="ef-msg__avatar"><Avatar><AvatarFallback>{who.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</AvatarFallback></Avatar></span>}
      <div className="ef-msg__main">
        <div className="ef-msg__meta"><span className="ef-msg__name">{who}</span>{time ? <span className="ef-msg__time">{time}</span> : null}</div>
        <div className="ef-msg__body">{children}{streaming ? <span className="ef-msg__caret"></span> : null}</div>
        {actionRow && role === 'assistant' && !streaming ? (
          <div className="ef-msg__actions">{actionRow}</div>
        ) : null}
      </div>
    </div>
  );
}
