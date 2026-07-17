import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-resizable{display:flex;width:100%;height:100%;min-height:0;min-width:0}
.ef-resizable--vertical{flex-direction:column}
.ef-resizable__pane{min-width:0;min-height:0;overflow:auto}
.ef-resizable__handle{flex:none;position:relative;background:transparent;border:none;padding:0;cursor:col-resize;touch-action:none}
.ef-resizable--horizontal>.ef-resizable__handle{width:9px}
.ef-resizable--vertical>.ef-resizable__handle{height:9px;cursor:row-resize}
.ef-resizable__handle::after{content:'';position:absolute;background:var(--border-default);transition:background var(--dur-fast) var(--ease-out)}
.ef-resizable--horizontal>.ef-resizable__handle::after{left:4px;top:0;bottom:0;width:1px}
.ef-resizable--vertical>.ef-resizable__handle::after{top:4px;left:0;right:0;height:1px}
.ef-resizable__handle:hover::after,.ef-resizable__handle--drag::after{background:var(--accent)}
.ef-resizable__handle:focus-visible{outline:none;box-shadow:var(--focus-ring)}
`;
export function Resizable({ direction = 'horizontal', defaultRatio = 0.5, min = 0.15, max = 0.85, onRatioChange, children, style, className }) {
  injectEfCss('ef-css-resizable', CSS);
  const [ratio, setRatio] = React.useState(defaultRatio);
  const [drag, setDrag] = React.useState(false);
  const ref = React.useRef(null);
  const clamp = v => Math.min(max, Math.max(min, v));
  const apply = v => { const r = clamp(v); setRatio(r); if (onRatioChange) onRatioChange(r); };
  const down = e => {
    e.preventDefault();
    setDrag(true);
    const move = ev => {
      const rect = ref.current.getBoundingClientRect();
      apply(direction === 'horizontal' ? (ev.clientX - rect.left) / rect.width : (ev.clientY - rect.top) / rect.height);
    };
    const up = () => { setDrag(false); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const key = e => {
    const d = { ArrowLeft: -0.02, ArrowRight: 0.02, ArrowUp: -0.02, ArrowDown: 0.02 }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    apply(ratio + d);
  };
  const kids = React.Children.toArray(children);
  return (
    <div ref={ref} className={`ef-resizable ef-resizable--${direction}${className ? ' ' + className : ''}`} style={style}>
      <div className="ef-resizable__pane" style={{ flexBasis: (ratio * 100) + '%', flexGrow: 0, flexShrink: 0 }}>{kids[0]}</div>
      <button type="button" role="separator" aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'} aria-label="Resize panes"
        className={`ef-resizable__handle${drag ? ' ef-resizable__handle--drag' : ''}`} onPointerDown={down} onKeyDown={key}></button>
      <div className="ef-resizable__pane" style={{ flex: 1 }}>{kids[1]}</div>
    </div>
  );
}
