import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/display/Carousel.jsx';

function Example(props) {
  return (
    <Carousel aria-label="Featured work" {...props}>
      <CarouselContent>
        <CarouselItem>One</CarouselItem>
        <CarouselItem>Two</CarouselItem>
        <CarouselItem>Three</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

function prepareOffsets(container, axis = 'offsetLeft') {
  const content = container.querySelector('[data-slot="carousel-content"]');
  const slides = [...container.querySelectorAll('[data-slot="carousel-item"]')];
  slides.forEach((slide, index) => Object.defineProperty(slide, axis, { configurable: true, value: index * 240 }));
  content.scrollTo = vi.fn();
  return { content, slides };
}

describe('Carousel compatibility contract', () => {
  it('renders every composition part with semantic roles and forwarded refs', () => {
    const rootRef = React.createRef();
    const contentRef = React.createRef();
    const itemRef = React.createRef();
    const previousRef = React.createRef();
    const nextRef = React.createRef();
    const { getByRole } = render(
      <Carousel ref={rootRef} aria-label="Featured work">
        <CarouselContent ref={contentRef}>
          <CarouselItem ref={itemRef}>One</CarouselItem>
        </CarouselContent>
        <CarouselPrevious ref={previousRef} />
        <CarouselNext ref={nextRef} />
      </Carousel>,
    );

    expect(rootRef.current).toBe(getByRole('region', { name: 'Featured work' }));
    expect(rootRef.current.getAttribute('aria-roledescription')).toBe('carousel');
    expect(contentRef.current.getAttribute('data-slot')).toBe('carousel-content');
    expect(itemRef.current.getAttribute('aria-roledescription')).toBe('slide');
    expect(previousRef.current).toBe(getByRole('button', { name: 'Previous slide' }));
    expect(nextRef.current).toBe(getByRole('button', { name: 'Next slide' }));
  });

  it('exposes a stable API, selection events, and bounded navigation', async () => {
    const setApi = vi.fn();
    const onSelect = vi.fn();
    const { container, getByRole } = render(<Example setApi={api => { setApi(api); api?.on('select', onSelect); }} />);
    const api = setApi.mock.calls.find(([value]) => value)?.[0];
    const { content } = prepareOffsets(container);

    expect(api.scrollSnapList()).toEqual([0, 1, 2]);
    expect(api.selectedScrollSnap()).toBe(0);
    expect(api.canScrollPrev()).toBe(false);
    fireEvent.click(getByRole('button', { name: 'Next slide' }));
    await Promise.resolve();
    expect(content.scrollTo).toHaveBeenLastCalledWith({ left: 240, behavior: 'smooth' });
    expect(api.selectedScrollSnap()).toBe(1);
    expect(onSelect).toHaveBeenCalled();
  });

  it('supports vertical orientation, keyboard navigation, loop, and alignment', () => {
    const { container, getByRole } = render(<Example orientation="vertical" opts={{ align: 'center', loop: true }} />);
    const { content } = prepareOffsets(container, 'offsetTop');
    const root = getByRole('region', { name: 'Featured work' });

    expect(root.getAttribute('data-orientation')).toBe('vertical');
    expect(root.getAttribute('data-align')).toBe('center');
    fireEvent.keyDown(root, { key: 'ArrowUp' });
    expect(content.scrollTo).toHaveBeenLastCalledWith({ top: 480, behavior: 'smooth' });
    fireEvent.keyDown(root, { key: 'ArrowDown' });
    expect(content.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('initializes and destroys plugins', () => {
    const plugin = { init: vi.fn(), destroy: vi.fn() };
    const plugins = [plugin];
    const { unmount } = render(<Example plugins={plugins} />);
    expect(plugin.init).toHaveBeenCalledTimes(1);
    expect(plugin.init.mock.calls[0][0].scrollNext).toBeTypeOf('function');
    unmount();
    expect(plugin.destroy).toHaveBeenCalledTimes(1);
  });
});
