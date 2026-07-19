import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-conversation{position:relative;overflow:hidden;display:flex;flex-direction:column}
.ef-conversation__viewport{overflow-y:auto;overscroll-behavior:contain;flex:1;min-height:0}
.ef-conversation__inner{display:flex;flex-direction:column;gap:18px}
.ef-conversation__jump{position:absolute;left:50%;transform:translateX(-50%);bottom:12px;display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 13px;border-radius:var(--radius-full);border:1px solid var(--border-strong);background:var(--surface-card);box-shadow:var(--shadow-md);cursor:pointer;font-family:var(--font-sans);font-size:12.5px;font-weight:500;color:var(--text-secondary);z-index:5;animation:ef-conversation-in var(--dur-fast) var(--ease-out)}
.ef-conversation__jump:hover{color:var(--text-primary)}
.ef-conversation__jump:focus-visible{outline:none;box-shadow:var(--focus-ring)}
@keyframes ef-conversation-in{from{opacity:0;transform:translateX(-50%) translateY(4px)}}
`;
export function Conversation({ height = 420, autoStick = true, jumpLabel = 'Jump to latest', padding = 4, children, style, className, ...rest }) {
  injectEfCss('ef-css-conversation', CSS);
  const viewport = React.useRef(null);
  const inner = React.useRef(null);
  const wasBottom = React.useRef(true);
  const [atBottom, setAtBottom] = React.useState(true);
  const recompute = () => {
    const v = viewport.current;
    if (!v) return;
    const at = v.scrollHeight - v.scrollTop - v.clientHeight < 24;
    wasBottom.current = at;
    setAtBottom(at);
  };
  const toBottom = behavior => {
    const v = viewport.current;
    if (v) v.scrollTo({ top: v.scrollHeight, behavior: behavior || 'smooth' });
  };
  React.useEffect(() => {
    const v = viewport.current;
    if (v) v.scrollTop = v.scrollHeight;
    recompute();
    if (!inner.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (autoStick && wasBottom.current && viewport.current) viewport.current.scrollTop = viewport.current.scrollHeight;
      recompute();
    });
    ro.observe(inner.current);
    return () => ro.disconnect();
  }, [autoStick]);
  return (
    <div {...rest} className={`ef-conversation${className ? ' ' + className : ''}`} style={{ height, ...style }}>
      <div ref={viewport} className="ef-conversation__viewport" onScroll={recompute} style={{ padding }}>
        <div ref={inner} className="ef-conversation__inner">{children}</div>
      </div>
      {!atBottom ? (
        <button type="button" className="ef-conversation__jump" onClick={() => toBottom()}>
          <Icon name="chevron-down" size={13} />
          {jumpLabel}
        </button>
      ) : null}
    </div>
  );
}
