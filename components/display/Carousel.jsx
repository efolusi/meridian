import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
const CSS = `
.ef-carousel{position:relative}
.ef-carousel__track{display:grid;grid-auto-flow:column;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none}
.ef-carousel__track::-webkit-scrollbar{display:none}
.ef-carousel__item{scroll-snap-align:start;min-width:0}
.ef-carousel__nav{position:absolute;top:50%;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;width:32px;height:32px;border:1px solid var(--border-strong);border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-secondary);cursor:pointer;box-shadow:var(--shadow-sm);transition:color var(--dur-fast) var(--ease-out),transform var(--dur-fast) var(--ease-out);z-index:1}
.ef-carousel__nav:hover:not(:disabled){color:var(--text-primary)}
.ef-carousel__nav:active:not(:disabled){transform:translateY(-50%) scale(.96)}
.ef-carousel__nav:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-carousel__nav:disabled{opacity:.35;cursor:default}
.ef-carousel__nav--prev{left:-14px}
.ef-carousel__nav--next{right:-14px}
.ef-carousel__dots{display:flex;justify-content:center;gap:6px;margin-top:14px}
.ef-carousel__dot{width:7px;height:7px;border-radius:var(--radius-full);border:none;padding:0;background:var(--border-strong);cursor:pointer;transition:background var(--dur-fast) var(--ease-out)}
.ef-carousel__dot--on{background:var(--accent)}
.ef-carousel__dot:focus-visible{outline:none;box-shadow:var(--focus-ring)}
`;
export function Carousel({ children, itemWidth = '280px', gap = 14, showControls = true, showDots = true, ariaLabel = 'Carousel', style, className }) {
  injectEfCss('ef-css-carousel', CSS);
  const track = React.useRef(null);
  const [index, setIndex] = React.useState(0);
  const count = React.Children.count(children);
  const step = () => {
    const el = track.current;
    if (!el || !el.firstChild) return el ? el.clientWidth : 0;
    return el.firstChild.getBoundingClientRect().width + gap;
  };
  const goTo = i => { const el = track.current; if (el) el.scrollTo({ left: i * step(), behavior: 'smooth' }); };
  const onScroll = () => { const el = track.current; if (el) setIndex(Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / step())))); };
  return (
    <div role="region" aria-label={ariaLabel} className={`ef-carousel${className ? ' ' + className : ''}`} style={style}>
      <div ref={track} className="ef-carousel__track" style={{ gridAutoColumns: itemWidth, gap }} onScroll={onScroll}>
        {React.Children.map(children, c => <div className="ef-carousel__item">{c}</div>)}
      </div>
      {showControls ? (
        <React.Fragment>
          <button type="button" aria-label="Previous" disabled={index <= 0} className="ef-carousel__nav ef-carousel__nav--prev" onClick={() => goTo(index - 1)}><Icon name="chevron-left" size={16} /></button>
          <button type="button" aria-label="Next" disabled={index >= count - 1} className="ef-carousel__nav ef-carousel__nav--next" onClick={() => goTo(index + 1)}><Icon name="chevron-right" size={16} /></button>
        </React.Fragment>
      ) : null}
      {showDots ? (
        <div className="ef-carousel__dots">
          {Array.from({ length: count }, (_, i) => (
            <button key={i} type="button" aria-label={`Go to item ${i + 1}`} className={`ef-carousel__dot${i === index ? ' ef-carousel__dot--on' : ''}`} onClick={() => goTo(i)}></button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
