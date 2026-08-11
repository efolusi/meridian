import React from 'react';
import { injectEfCss, mergeRefs } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';

const CSS = `
.ef-message-scroller{position:relative;display:flex;width:100%;height:100%;min-height:0;overflow:hidden}
.ef-message-scroller__viewport{width:100%;height:100%;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--border-strong) transparent}
.ef-message-scroller__viewport:focus-visible{outline:0;box-shadow:inset var(--focus-ring)}
.ef-message-scroller__content{display:flex;min-height:100%;flex-direction:column;gap:16px;padding:16px}
.ef-message-scroller__item{content-visibility:auto;contain-intrinsic-size:auto 88px}
.ef-message-scroller__button{position:absolute;inset-inline-end:16px;inset-block-end:16px;display:inline-flex;width:34px;height:34px;align-items:center;justify-content:center;border:1px solid var(--border-default);border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-primary);box-shadow:var(--shadow-sm);cursor:pointer;transition:opacity var(--dur-fast) var(--ease-out),transform var(--dur-fast) var(--ease-out),background var(--dur-fast) var(--ease-out)}
.ef-message-scroller__button:hover{background:var(--surface-sunken)}.ef-message-scroller__button:focus-visible{outline:0;box-shadow:var(--focus-ring)}
.ef-message-scroller__button[data-active=false]{opacity:0;transform:translateY(4px);pointer-events:none}
.ef-message-scroller__button[data-direction=start] .ef-message-scroller__button-icon{transform:rotate(180deg)}
`;

const MessageScrollerContext = React.createContext(null);
const join = (...values) => values.filter(Boolean).join(' ');
const EDGE_EPSILON = 2;

function readRows(viewport) {
  return viewport ? Array.from(viewport.querySelectorAll('[data-slot="message-scroller-item"]')) : [];
}

export function MessageScrollerProvider({ autoScroll = false, defaultScrollPosition = 'last-anchor', preserveScrollOnPrepend = true, scrollPreviousItemPeek = 64, children }) {
  const viewportRef = React.useRef(null);
  const initializedRef = React.useRef(false);
  const followingRef = React.useRef(autoScroll);
  const automaticRef = React.useRef(false);
  const previousRef = React.useRef({ firstId: null, lastId: null, height: 0, anchorId: null });
  const [scrollable, setScrollable] = React.useState({ start: false, end: false });
  const [visibility, setVisibility] = React.useState({ currentAnchorId: null, visibleMessageIds: [] });
  const [autoscrolling, setAutoscrolling] = React.useState(false);

  const readState = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return { start: false, end: false };
    const next = {
      start: viewport.scrollTop > EDGE_EPSILON,
      end: viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - EDGE_EPSILON,
    };
    setScrollable(current => current.start === next.start && current.end === next.end ? current : next);
    const box = viewport.getBoundingClientRect();
    const rows = readRows(viewport);
    const visibleMessageIds = rows.filter(row => {
      const rect = row.getBoundingClientRect();
      return rect.bottom > box.top && rect.top < box.bottom;
    }).map(row => row.dataset.messageId).filter(Boolean);
    const currentAnchor = rows.filter(row => row.dataset.scrollAnchor === 'true' && row.getBoundingClientRect().top <= box.top + scrollPreviousItemPeek + 1).at(-1)
      || rows.find(row => row.dataset.scrollAnchor === 'true' && row.getBoundingClientRect().bottom > box.top);
    const currentAnchorId = currentAnchor?.dataset.messageId || null;
    setVisibility(current => current.currentAnchorId === currentAnchorId && current.visibleMessageIds.join('\0') === visibleMessageIds.join('\0') ? current : { currentAnchorId, visibleMessageIds });
    return next;
  }, [scrollPreviousItemPeek]);

  const move = React.useCallback((top, behavior = 'smooth', follow = false) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    automaticRef.current = true;
    followingRef.current = follow;
    setAutoscrolling(true);
    viewport.scrollTo({ top, behavior });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      automaticRef.current = false;
      setAutoscrolling(false);
      readState();
    }));
  }, [readState]);

  const scrollToStart = React.useCallback(options => move(0, options?.behavior, false), [move]);
  const scrollToEnd = React.useCallback(options => {
    const viewport = viewportRef.current;
    if (viewport) move(viewport.scrollHeight, options?.behavior, true);
  }, [move]);
  const scrollToMessage = React.useCallback((messageId, options) => {
    const viewport = viewportRef.current;
    const row = readRows(viewport).find(item => item.dataset.messageId === String(messageId));
    if (!viewport || !row) return false;
    move(Math.max(0, row.offsetTop - (options?.offset ?? scrollPreviousItemPeek)), options?.behavior, false);
    return true;
  }, [move, scrollPreviousItemPeek]);

  const setViewport = React.useCallback(node => { viewportRef.current = node; }, []);
  const handleScroll = React.useCallback(event => {
    const next = readState();
    if (!automaticRef.current) followingRef.current = autoScroll && !next.end;
    return event;
  }, [autoScroll, readState]);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const reconcile = () => {
      const rows = readRows(viewport);
      const firstId = rows[0]?.dataset.messageId || null;
      const lastId = rows.at(-1)?.dataset.messageId || null;
      const lastAnchor = rows.filter(row => row.dataset.scrollAnchor === 'true').at(-1);
      const lastAnchorId = lastAnchor?.dataset.messageId || null;
      const previous = previousRef.current;
      if (!initializedRef.current) {
        initializedRef.current = true;
        if (defaultScrollPosition === 'end') viewport.scrollTop = viewport.scrollHeight;
        else if (defaultScrollPosition === 'last-anchor') {
          const anchoredTurnFits = lastAnchor && viewport.scrollHeight - lastAnchor.offsetTop <= viewport.clientHeight;
          viewport.scrollTop = lastAnchor && !anchoredTurnFits ? Math.max(0, lastAnchor.offsetTop - scrollPreviousItemPeek) : viewport.scrollHeight;
        }
      } else if (preserveScrollOnPrepend && previous.firstId && firstId !== previous.firstId && previous.lastId === lastId) {
        viewport.scrollTop += viewport.scrollHeight - previous.height;
      } else if (lastAnchorId && lastAnchorId !== previous.anchorId && lastId !== previous.lastId) {
        viewport.scrollTop = Math.max(0, lastAnchor.offsetTop - scrollPreviousItemPeek);
      } else if (autoScroll && followingRef.current && viewport.scrollHeight !== previous.height) {
        viewport.scrollTop = viewport.scrollHeight;
      }
      previousRef.current = { firstId, lastId, height: viewport.scrollHeight, anchorId: lastAnchorId };
      readState();
    };
    reconcile();
    const mutation = new MutationObserver(reconcile);
    mutation.observe(viewport, { childList: true, subtree: true, characterData: true });
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(reconcile);
    resize?.observe(viewport);
    const content = viewport.querySelector('[data-slot="message-scroller-content"]');
    if (content) resize?.observe(content);
    return () => { mutation.disconnect(); resize?.disconnect(); };
  }, [autoScroll, defaultScrollPosition, preserveScrollOnPrepend, readState, scrollPreviousItemPeek]);

  const value = React.useMemo(() => ({ viewportRef, setViewport, handleScroll, scrollable, visibility, autoscrolling, scrollToStart, scrollToEnd, scrollToMessage }), [setViewport, handleScroll, scrollable, visibility, autoscrolling, scrollToStart, scrollToEnd, scrollToMessage]);
  return <MessageScrollerContext.Provider value={value}>{children}</MessageScrollerContext.Provider>;
}

function useScrollerContext(name) {
  const context = React.useContext(MessageScrollerContext);
  if (!context) throw new Error(`${name} must be used inside a <MessageScrollerProvider>`);
  return context;
}

export function useMessageScroller() {
  const { scrollToStart, scrollToEnd, scrollToMessage } = useScrollerContext('useMessageScroller');
  return { scrollToStart, scrollToEnd, scrollToMessage };
}

export function useMessageScrollerVisibility() {
  return useScrollerContext('useMessageScrollerVisibility').visibility;
}

export function useMessageScrollerScrollable() {
  return useScrollerContext('useMessageScrollerScrollable').scrollable;
}

export const MessageScroller = React.forwardRef(function MessageScroller({ className, ...props }, ref) {
  const context = useScrollerContext('MessageScroller');
  injectEfCss('ef-css-message-scroller', CSS);
  const directions = [context.scrollable.start && 'start', context.scrollable.end && 'end'].filter(Boolean).join(' ') || 'none';
  return <div {...props} ref={ref} data-slot="message-scroller" data-scrollable={directions} data-autoscrolling={context.autoscrolling ? 'true' : 'false'} className={join('ef-message-scroller', className)} />;
});

export const MessageScrollerViewport = React.forwardRef(function MessageScrollerViewport({ className, onScroll, role = 'region', 'aria-label': ariaLabel = 'Messages', tabIndex = 0, ...props }, ref) {
  const context = useScrollerContext('MessageScrollerViewport');
  const handle = event => { context.handleScroll(event); onScroll?.(event); };
  return <div {...props} ref={mergeRefs(ref, context.setViewport)} role={role} aria-label={ariaLabel} tabIndex={tabIndex} data-slot="message-scroller-viewport" data-scrollable={[context.scrollable.start && 'start', context.scrollable.end && 'end'].filter(Boolean).join(' ') || 'none'} data-autoscrolling={context.autoscrolling ? 'true' : 'false'} className={join('ef-message-scroller__viewport', className)} onScroll={handle} />;
});

export const MessageScrollerContent = React.forwardRef(function MessageScrollerContent({ className, role = 'log', 'aria-live': ariaLive = 'polite', 'aria-relevant': ariaRelevant = 'additions', ...props }, ref) {
  return <div {...props} ref={ref} role={role} aria-live={ariaLive} aria-relevant={ariaRelevant} data-slot="message-scroller-content" className={join('ef-message-scroller__content', className)} />;
});

export const MessageScrollerItem = React.forwardRef(function MessageScrollerItem({ messageId, scrollAnchor = false, className, ...props }, ref) {
  return <div {...props} ref={ref} data-slot="message-scroller-item" data-message-id={messageId == null ? undefined : String(messageId)} data-scroll-anchor={scrollAnchor ? 'true' : undefined} className={join('ef-message-scroller__item', className)} />;
});

export const MessageScrollerButton = React.forwardRef(function MessageScrollerButton({ direction = 'end', className, children, onClick, ...props }, ref) {
  const context = useScrollerContext('MessageScrollerButton');
  const active = context.scrollable[direction];
  const click = event => {
    onClick?.(event);
    if (!event.defaultPrevented) direction === 'end' ? context.scrollToEnd() : context.scrollToStart();
  };
  return <button {...props} ref={ref} type="button" aria-label={props['aria-label'] || (direction === 'end' ? 'Scroll to end' : 'Scroll to start')} tabIndex={active ? props.tabIndex : -1} inert={active ? undefined : ''} data-slot="message-scroller-button" data-active={active ? 'true' : 'false'} data-direction={direction} className={join('ef-message-scroller__button', className)} onClick={click}>{children || <span className="ef-message-scroller__button-icon"><Icon name="chevron-down" size={16} /></span>}</button>;
});
