import React from 'react';
import { injectEfCss, prefersReducedMotion } from '../forms/Button.jsx';
import { Icon } from '../icons/Icon.jsx';
import { useDirection } from './Direction.jsx';

const CSS = `
.ef-carousel{position:relative}
.ef-carousel__content{overflow-x:auto;overflow-y:hidden;scroll-behavior:smooth;scrollbar-width:none;scroll-snap-type:x mandatory;overscroll-behavior-inline:contain}
.ef-carousel__content::-webkit-scrollbar{display:none}
.ef-carousel__content[data-orientation="vertical"]{height:100%;overflow-x:hidden;overflow-y:auto;scroll-snap-type:y mandatory;overscroll-behavior-block:contain}
.ef-carousel__track{display:flex;margin-inline-start:calc(var(--carousel-gap,16px)*-1)}
.ef-carousel__content[data-orientation="vertical"]>.ef-carousel__track{height:100%;flex-direction:column;margin-inline-start:0;margin-block-start:calc(var(--carousel-gap,16px)*-1)}
.ef-carousel__item{min-width:0;flex:0 0 100%;scroll-snap-align:start;padding-inline-start:var(--carousel-gap,16px)}
.ef-carousel[data-align="center"] .ef-carousel__item{scroll-snap-align:center}
.ef-carousel[data-align="end"] .ef-carousel__item{scroll-snap-align:end}
.ef-carousel__content[data-orientation="vertical"] .ef-carousel__item{min-height:0;padding-inline-start:0;padding-block-start:var(--carousel-gap,16px)}
.ef-carousel__nav{position:absolute;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border:1px solid var(--border-strong);border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-secondary);cursor:pointer;box-shadow:var(--shadow-sm);transition:color var(--dur-fast) var(--ease-out),transform var(--dur-fast) var(--ease-out);z-index:1}
.ef-carousel__nav:hover:not(:disabled){color:var(--text-primary)}
.ef-carousel__nav:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-carousel__nav:disabled{opacity:.35;cursor:default}
.ef-carousel__nav--previous{inset-inline-start:-14px;top:50%;transform:translateY(-50%)}
.ef-carousel__nav--next{inset-inline-end:-14px;top:50%;transform:translateY(-50%)}
.ef-carousel[data-orientation="vertical"]>.ef-carousel__nav--previous{inset-inline-start:50%;inset-block-start:-14px;top:auto;transform:translateX(-50%)}
.ef-carousel[data-orientation="vertical"]>.ef-carousel__nav--next{inset-inline-end:auto;inset-inline-start:50%;inset-block-end:-14px;top:auto;transform:translateX(-50%)}
`;

const CarouselCtx = React.createContext(null);
const EMPTY_PLUGINS = [];

function closestIndex(element, orientation) {
  const position = orientation === 'vertical' ? element.scrollTop : Math.abs(element.scrollLeft);
  const slides = [...element.querySelectorAll('[data-slot="carousel-item"]')];
  if (!slides.length) return 0;
  let best = 0;
  let distance = Infinity;
  slides.forEach((slide, index) => {
    const offset = orientation === 'vertical' ? slide.offsetTop : slide.offsetLeft;
    const nextDistance = Math.abs(offset - position);
    if (nextDistance < distance) { best = index; distance = nextDistance; }
  });
  return best;
}

export const Carousel = React.forwardRef(function Carousel({ orientation = 'horizontal', opts = {}, plugins = EMPTY_PLUGINS, setApi, children, className, onKeyDown, ...props }, ref) {
  injectEfCss('ef-css-carousel', CSS);
  const inheritedDirection = useDirection();
  const direction = opts.direction || props.dir || inheritedDirection;
  const align = opts.align || 'start';
  const contentRef = React.useRef(null);
  const listeners = React.useRef(new Map());
  const [selected, setSelected] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);
  const selectedRef = React.useRef(0);
  const slideCountRef = React.useRef(0);
  selectedRef.current = selected;
  slideCountRef.current = slideCount;
  const loop = !!opts.loop;
  const emit = React.useCallback(event => {
    listeners.current.get(event)?.forEach(callback => callback(api));
  }, []);
  const scrollTo = React.useCallback(index => {
    const element = contentRef.current;
    if (!element) return;
    const slides = [...element.querySelectorAll('[data-slot="carousel-item"]')];
    if (!slides.length) return;
    const targetIndex = loop ? (index + slides.length) % slides.length : Math.max(0, Math.min(slides.length - 1, index));
    const slide = slides[targetIndex];
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    const alignmentOffset = orientation === 'vertical'
      ? align === 'center' ? (element.clientHeight - slide.offsetHeight) / 2 : align === 'end' ? element.clientHeight - slide.offsetHeight : 0
      : align === 'center' ? (element.clientWidth - slide.offsetWidth) / 2 : align === 'end' ? element.clientWidth - slide.offsetWidth : 0;
    if (orientation === 'vertical') element.scrollTo({ top: slide.offsetTop - alignmentOffset, behavior });
    else element.scrollTo({ left: (direction === 'rtl' ? -1 : 1) * (slide.offsetLeft - alignmentOffset), behavior });
    setSelected(targetIndex);
    queueMicrotask(() => emit('select'));
  }, [align, direction, emit, loop, orientation]);
  const api = React.useMemo(() => ({
    canScrollNext: () => loop || selectedRef.current < slideCountRef.current - 1,
    canScrollPrev: () => loop || selectedRef.current > 0,
    containerNode: () => contentRef.current?.querySelector('[data-slot="carousel-track"]') || null,
    destroy: () => { emit('destroy'); listeners.current.clear(); },
    off: (event, callback) => { listeners.current.get(event)?.delete(callback); return api; },
    on: (event, callback) => { if (!listeners.current.has(event)) listeners.current.set(event, new Set()); listeners.current.get(event).add(callback); return api; },
    reInit: () => { setSlideCount(contentRef.current?.querySelectorAll('[data-slot="carousel-item"]').length || 0); emit('reInit'); },
    rootNode: () => contentRef.current,
    scrollNext: () => scrollTo(selectedRef.current + 1),
    scrollPrev: () => scrollTo(selectedRef.current - 1),
    scrollSnapList: () => Array.from({ length: slideCountRef.current }, (_, index) => index),
    scrollTo,
    selectedScrollSnap: () => selectedRef.current,
    slideNodes: () => [...(contentRef.current?.querySelectorAll('[data-slot="carousel-item"]') || [])],
  }), [emit, loop, scrollTo]);
  React.useEffect(() => { setApi?.(api); return () => setApi?.(undefined); }, [api, setApi]);
  React.useEffect(() => {
    const active = plugins.filter(Boolean);
    active.forEach(plugin => plugin.init?.(api));
    return () => active.forEach(plugin => plugin.destroy?.());
  }, [api, plugins]);
  const registerContent = React.useCallback(element => {
    contentRef.current = element;
    setSlideCount(element?.querySelectorAll('[data-slot="carousel-item"]').length || 0);
  }, []);
  const selectFromScroll = React.useCallback(index => {
    setSelected(index);
    queueMicrotask(() => emit('select'));
  }, [emit]);
  const handleKeyDown = event => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const previousKey = orientation === 'vertical' ? 'ArrowUp' : (direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft');
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : (direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
    if (event.key === previousKey) { event.preventDefault(); api.scrollPrev(); }
    if (event.key === nextKey) { event.preventDefault(); api.scrollNext(); }
  };
  const value = React.useMemo(() => ({ api, direction, orientation, registerContent, selectFromScroll, selected, slideCount }), [api, direction, orientation, registerContent, selectFromScroll, selected, slideCount]);
  return <CarouselCtx.Provider value={value}><div {...props} ref={ref} role="region" aria-roledescription="carousel" data-slot="carousel" data-orientation={orientation} data-align={align} className={`ef-carousel${className ? ' ' + className : ''}`} onKeyDown={handleKeyDown}>{children}</div></CarouselCtx.Provider>;
});

export const CarouselContent = React.forwardRef(function CarouselContent({ children, className, style, onScroll, ...props }, forwardedRef) {
  const ctx = React.useContext(CarouselCtx);
  const registerContent = ctx?.registerContent;
  const setRef = React.useCallback(element => {
    registerContent?.(element);
    if (typeof forwardedRef === 'function') forwardedRef(element);
    else if (forwardedRef) forwardedRef.current = element;
  }, [forwardedRef, registerContent]);
  const handleScroll = event => {
    onScroll?.(event);
    if (event.defaultPrevented || !ctx) return;
    const next = closestIndex(event.currentTarget, ctx.orientation);
    if (next !== ctx.selected) ctx.selectFromScroll(next);
  };
  return <div {...props} ref={setRef} data-slot="carousel-content" data-orientation={ctx?.orientation || 'horizontal'} className={`ef-carousel__content${className ? ' ' + className : ''}`} style={style} onScroll={handleScroll}><div data-slot="carousel-track" className="ef-carousel__track">{children}</div></div>;
});

export const CarouselItem = React.forwardRef(function CarouselItem({ className, ...props }, ref) {
  return <div {...props} ref={ref} role="group" aria-roledescription="slide" data-slot="carousel-item" className={`ef-carousel__item${className ? ' ' + className : ''}`} />;
});

function CarouselButton({ kind, className, children, ...props }, ref) {
  const ctx = React.useContext(CarouselCtx);
  const previous = kind === 'previous';
  const disabled = previous ? !ctx?.api.canScrollPrev() : !ctx?.api.canScrollNext();
  const vertical = ctx?.orientation === 'vertical';
  const rtl = ctx?.direction === 'rtl';
  const icon = vertical ? (previous ? 'chevron-up' : 'chevron-down') : (previous !== rtl ? 'chevron-left' : 'chevron-right');
  return <button {...props} ref={ref} type="button" disabled={props.disabled || disabled} aria-label={props['aria-label'] || (previous ? 'Previous slide' : 'Next slide')} data-slot={`carousel-${kind}`} className={`ef-carousel__nav ef-carousel__nav--${kind}${className ? ' ' + className : ''}`} onClick={event => { props.onClick?.(event); if (!event.defaultPrevented) previous ? ctx?.api.scrollPrev() : ctx?.api.scrollNext(); }}>{children || <Icon name={icon} size={16} />}</button>;
}
export const CarouselPrevious = React.forwardRef((props, ref) => CarouselButton({ ...props, kind: 'previous' }, ref));
export const CarouselNext = React.forwardRef((props, ref) => CarouselButton({ ...props, kind: 'next' }, ref));
