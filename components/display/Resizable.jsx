import React from 'react';
import { injectEfCss, cssPct } from '../forms/Button.jsx';
import { useDirection } from './Direction.jsx';

const CSS = `
.ef-resizable{display:flex;width:100%;height:100%;min-height:0;min-width:0}
.ef-resizable[data-orientation="vertical"]{flex-direction:column}
.ef-resizable__pane{min-width:0;min-height:0;overflow:auto}
.ef-resizable__handle{flex:none;position:relative;background:transparent;border:none;padding:0;cursor:col-resize;touch-action:none}
.ef-resizable[data-orientation="horizontal"]>.ef-resizable__handle{width:9px}
.ef-resizable[data-orientation="vertical"]>.ef-resizable__handle{height:9px;cursor:row-resize}
.ef-resizable__handle::after{content:'';position:absolute;background:var(--border-default);transition:background var(--dur-fast) var(--ease-out)}
.ef-resizable[data-orientation="horizontal"]>.ef-resizable__handle::after{inset-inline-start:4px;inset-block:0;width:1px}
.ef-resizable[data-orientation="vertical"]>.ef-resizable__handle::after{inset-block-start:4px;inset-inline:0;height:1px}
.ef-resizable__handle:hover::after,.ef-resizable__handle[data-resize-handle-active]::after{background:var(--accent)}
.ef-resizable__handle:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-resizable__grip{position:absolute;inset:50% auto auto 50%;width:8px;height:18px;transform:translate(-50%,-50%);border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);box-shadow:var(--shadow-xs)}
.ef-resizable__grip::after{content:'⋮';position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-54%);font-size:12px;color:var(--text-muted)}
.ef-resizable[data-orientation="vertical"]>.ef-resizable__handle .ef-resizable__grip{width:18px;height:8px}
.ef-resizable[data-orientation="vertical"]>.ef-resizable__handle .ef-resizable__grip::after{content:'⋯';transform:translate(-50%,-66%)}
`;
const ResizableCtx = React.createContext(null);
function sizeNumber(value, fallback) {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function initialPanelSizes(panels) {
  const declared = panels.map(panel => panel.props.defaultSize == null ? null : sizeNumber(panel.props.defaultSize, null));
  const knownTotal = declared.reduce((sum, value) => sum + (value ?? 0), 0);
  const missing = declared.filter(value => value == null).length;
  const fill = missing ? Math.max(0, 100 - knownTotal) / missing : 0;
  const values = declared.map(value => value ?? fill);
  const total = values.reduce((sum, value) => sum + value, 0) || 100;
  return values.map(value => value / total * 100);
}

export const ResizablePanelGroup = React.forwardRef(function ResizablePanelGroup({ orientation = 'horizontal', direction, onLayoutChange, children, className, ...props }, ref) {
  injectEfCss('ef-css-resizable', CSS);
  const readingDirection = useDirection();
  const nodes = React.Children.toArray(children);
  const panels = nodes.filter(child => React.isValidElement(child) && child.type === ResizablePanel);
  const [sizes, setSizes] = React.useState(() => initialPanelSizes(panels));
  const updatePair = React.useCallback((index, delta) => {
    setSizes(current => {
      const next = [...current];
      const before = panels[index]?.props || {};
      const after = panels[index + 1]?.props || {};
      const combined = next[index] + next[index + 1];
      const minBefore = sizeNumber(before.minSize, 0);
      const maxBefore = sizeNumber(before.maxSize, combined);
      const minAfter = sizeNumber(after.minSize, 0);
      const maxAfter = sizeNumber(after.maxSize, combined);
      const proposed = Math.max(minBefore, Math.min(maxBefore, next[index] + delta));
      const bounded = Math.max(combined - maxAfter, Math.min(combined - minAfter, proposed));
      next[index] = bounded;
      next[index + 1] = combined - bounded;
      onLayoutChange?.(next);
      return next;
    });
  }, [onLayoutChange, panels]);
  let panelIndex = 0;
  let handleIndex = 0;
  const value = React.useMemo(() => ({ orientation, direction: direction || readingDirection, sizes, updatePair }), [orientation, direction, readingDirection, sizes, updatePair]);
  return (
    <ResizableCtx.Provider value={value}>
      <div {...props} ref={ref} data-slot="resizable-panel-group" data-orientation={orientation} aria-orientation={orientation} className={`ef-resizable${className ? ' ' + className : ''}`}>
        {nodes.map((child, index) => {
          if (!React.isValidElement(child)) return child;
          if (child.type === ResizablePanel) return React.cloneElement(child, { key: child.key ?? index, _panelIndex: panelIndex++ });
          if (child.type === ResizableHandle) return React.cloneElement(child, { key: child.key ?? index, _handleIndex: handleIndex++ });
          return child;
        })}
      </div>
    </ResizableCtx.Provider>
  );
});

export const ResizablePanel = React.forwardRef(function ResizablePanel({ _panelIndex = 0, defaultSize, minSize, maxSize, className, ...props }, ref) {
  const ctx = React.useContext(ResizableCtx);
  const size = ctx?.sizes[_panelIndex] ?? sizeNumber(defaultSize, 50);
  return <div {...props} ref={ref} data-slot="resizable-panel" data-panel-index={_panelIndex} className={`ef-resizable__pane${className ? ' ' + className : ''}`} style={{ flexBasis: cssPct(size), flexGrow: 0, flexShrink: 0, ...props.style }} />;
});

export const ResizableHandle = React.forwardRef(function ResizableHandle({ _handleIndex = 0, withHandle = false, disabled = false, className, ...props }, ref) {
  const ctx = React.useContext(ResizableCtx);
  const [active, setActive] = React.useState(false);
  const down = event => {
    props.onPointerDown?.(event);
    if (event.defaultPrevented || disabled || !ctx) return;
    event.preventDefault();
    setActive(true);
    const root = event.currentTarget.parentElement;
    let previous = ctx.orientation === 'horizontal' ? event.clientX : event.clientY;
    const dimension = ctx.orientation === 'horizontal' ? root.clientWidth : root.clientHeight;
    const move = nextEvent => {
      const current = ctx.orientation === 'horizontal' ? nextEvent.clientX : nextEvent.clientY;
      let delta = (current - previous) / Math.max(1, dimension) * 100;
      previous = current;
      if (ctx.orientation === 'horizontal' && ctx.direction === 'rtl') delta *= -1;
      ctx.updatePair(_handleIndex, delta);
    };
    const up = () => { setActive(false); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const key = event => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented || disabled || !ctx) return;
    const horizontal = ctx.orientation === 'horizontal';
    const rtl = ctx.direction === 'rtl';
    const delta = event.key === (horizontal ? 'ArrowLeft' : 'ArrowUp') ? (horizontal && rtl ? 2 : -2)
      : event.key === (horizontal ? 'ArrowRight' : 'ArrowDown') ? (horizontal && rtl ? -2 : 2) : null;
    if (delta == null) return;
    event.preventDefault();
    ctx.updatePair(_handleIndex, delta);
  };
  return <div {...props} ref={ref} role="separator" tabIndex={disabled ? undefined : 0} aria-label={props['aria-label'] || 'Resize panes'} aria-disabled={disabled || undefined} aria-orientation={ctx?.orientation === 'horizontal' ? 'vertical' : 'horizontal'} data-slot="resizable-handle" data-resize-handle-active={active ? '' : undefined} className={`ef-resizable__handle${className ? ' ' + className : ''}`} onPointerDown={down} onKeyDown={key}>{withHandle ? <span className="ef-resizable__grip" aria-hidden="true" /> : null}</div>;
});
