import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { Conversation } from '../components/ai/Conversation.jsx';
import { Console } from '../components/code/Console.jsx';
import { Diff } from '../components/code/Diff.jsx';
import { Table } from '../components/data/Table.jsx';
import { Carousel, CarouselContent, CarouselItem } from '../components/display/Carousel.jsx';
import { ScrollArea } from '../components/display/ScrollArea.jsx';

// MD17: a part that scrolls must be reachable by keyboard (WCAG 2.1.1) and, being focusable,
// must say what it is (role) and what it is called (name, WCAG 4.1.2). axe calls the first
// rule scrollable-region-focusable.
//
// A region is a landmark, so a page with several scroll areas would list several landmarks with
// one name. The rule used by the whole family: a part the caller names (aria-label or
// aria-labelledby, which wins) is role="region"; an unnamed part is role="group" carrying a
// default name, and the `label` prop sets those default words. A group is not a landmark.

describe('Conversation viewport', () => {
  const viewportOf = container => container.querySelector('.ef-conversation__viewport');

  it('is a focusable group named Conversation while the caller gives no name', () => {
    const { container } = render(<Conversation><p>Hello</p></Conversation>);
    expect(viewportOf(container).getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('group', { name: 'Conversation' })).toBe(viewportOf(container));
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('takes the default words from label', () => {
    render(<Conversation label="Percakapan"><p>Hello</p></Conversation>);
    expect(screen.getByRole('group', { name: 'Percakapan' })).toBeTruthy();
  });

  it('is a region named by aria-label, which names the viewport and not the wrapper', () => {
    const { container } = render(<Conversation aria-label="Support chat" label="Ignored"><p>Hello</p></Conversation>);
    expect(screen.getByRole('region', { name: 'Support chat' })).toBe(viewportOf(container));
    expect(container.querySelector('.ef-conversation').hasAttribute('aria-label')).toBe(false);
  });

  it('is a region named by aria-labelledby, which beats aria-label', () => {
    const { container } = render(<div><h2 id="cap">Support chat</h2><Conversation aria-label="Loses" aria-labelledby="cap"><p>Hello</p></Conversation></div>);
    expect(viewportOf(container).hasAttribute('aria-label')).toBe(false);
    expect(container.querySelector('.ef-conversation').hasAttribute('aria-labelledby')).toBe(false);
    expect(screen.getByRole('region', { name: 'Support chat' })).toBe(viewportOf(container));
  });
});

describe('Console log', () => {
  it('is a focusable log named by its title', () => {
    const { container } = render(<Console title="Build output" entries={[{ text: 'ready' }]} />);
    const log = container.querySelector('.ef-console__scroll');
    expect(log.getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('log', { name: 'Build output' })).toBe(log);
  });

  it('is named Console by default', () => {
    render(<Console entries={[{ text: 'ready' }]} />);
    expect(screen.getByRole('log', { name: 'Console' })).toBeTruthy();
  });
});

describe('Table scroll wrapper', () => {
  const columns = [{ key: 'name', label: 'Name' }];
  const rows = [{ name: 'Alpha' }, { name: 'Bravo' }];
  const size = { scroll: 800, client: 300 };
  let observers;

  beforeEach(() => {
    observers = [];
    vi.stubGlobal('ResizeObserver', class {
      constructor(cb) { this.cb = cb; observers.push(this); }
      observe() {}
      disconnect() {}
    });
    const isWrap = el => el.classList && el.classList.contains('ef-table-wrap');
    // jsdom measures nothing, so the wrapper reports the sizes this test sets.
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, get() { return isWrap(this) ? size.scroll : 0; } });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return isWrap(this) ? size.client : 0; } });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete HTMLElement.prototype.scrollWidth;
    delete HTMLElement.prototype.clientWidth;
    size.scroll = 800;
    size.client = 300;
  });

  const wrapOf = container => container.querySelector('.ef-table-wrap');
  const resize = () => act(() => { observers.forEach(o => o.cb()); });

  it('is a focusable group named Table while the content overflows and the caller gives no name', () => {
    const { container } = render(<Table columns={columns} rows={rows} />);
    const wrap = wrapOf(container);
    expect(wrap.getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('group', { name: 'Table' })).toBe(wrap);
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('takes the default words from label', () => {
    const { container } = render(<Table columns={columns} rows={rows} label="Tabel" />);
    expect(screen.getByRole('group', { name: 'Tabel' })).toBe(wrapOf(container));
  });

  it('adds nothing while the content fits', () => {
    size.scroll = 300;
    const { container } = render(<Table columns={columns} rows={rows} />);
    const wrap = wrapOf(container);
    expect(wrap.hasAttribute('tabindex')).toBe(false);
    expect(wrap.hasAttribute('role')).toBe(false);
    expect(wrap.hasAttribute('aria-label')).toBe(false);
  });

  it('gains and loses the tab stop as the content starts and stops overflowing', () => {
    size.scroll = 300;
    const { container } = render(<Table columns={columns} rows={rows} />);
    const wrap = wrapOf(container);
    expect(wrap.hasAttribute('tabindex')).toBe(false);
    size.scroll = 800;
    resize();
    expect(wrap.getAttribute('tabindex')).toBe('0');
    expect(wrap.getAttribute('role')).toBe('group');
    size.scroll = 300;
    resize();
    expect(wrap.hasAttribute('tabindex')).toBe(false);
    expect(wrap.hasAttribute('role')).toBe(false);
  });

  it('keeps the tab stop while the wrapper holds focus, and drops it on blur', () => {
    const { container } = render(<Table columns={columns} rows={rows} />);
    const wrap = wrapOf(container);
    act(() => wrap.focus());
    expect(document.activeElement).toBe(wrap);
    size.scroll = 300;
    resize();
    expect(wrap.getAttribute('tabindex')).toBe('0');
    act(() => wrap.blur());
    expect(wrap.hasAttribute('tabindex')).toBe(false);
    expect(document.activeElement).toBe(document.body);
  });

  it('is a region once the caller names it with aria-label or aria-labelledby', () => {
    const { container, rerender } = render(<Table columns={columns} rows={rows} aria-label="Customers" />);
    expect(screen.getByRole('region', { name: 'Customers' })).toBe(wrapOf(container));
    rerender(<div><h2 id="cap">Invoices</h2><Table columns={columns} rows={rows} aria-labelledby="cap" /></div>);
    const wrap = wrapOf(container);
    expect(wrap.getAttribute('aria-labelledby')).toBe('cap');
    expect(screen.getByRole('region', { name: 'Invoices' })).toBe(wrap);
    rerender(<div><h2 id="cap">Invoices</h2><Table columns={columns} rows={rows} aria-label="Loses" aria-labelledby="cap" /></div>);
    expect(screen.getByRole('region', { name: 'Invoices' })).toBe(wrapOf(container));
  });

  it('lets a passed tabIndex win', () => {
    const { container } = render(<Table columns={columns} rows={rows} tabIndex={-1} />);
    expect(wrapOf(container).getAttribute('tabindex')).toBe('-1');
  });

  it('also covers the composed form', () => {
    const { container } = render(<Table><tbody><tr><td>One</td></tr></tbody></Table>);
    const wrap = wrapOf(container);
    expect(wrap.getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('group', { name: 'Table' })).toBe(wrap);
  });
});

describe('Diff scroll regions', () => {
  const from = 'const max = 3;\nreturn run();';
  const to = 'const max = 5;\nreturn run();';
  const scrollOf = container => container.querySelector('.ef-diff__scroll');

  it('is a focusable group named Diff while the caller gives no name', () => {
    const { container } = render(<Diff from={from} to={to} />);
    expect(scrollOf(container).getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('group', { name: 'Diff' })).toBe(scrollOf(container));
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('takes the default words from label', () => {
    render(<Diff label="Perbedaan" from={from} to={to} />);
    expect(screen.getByRole('group', { name: 'Perbedaan' })).toBeTruthy();
  });

  it('is named by a string title when there is one, and stays a group', () => {
    const { container } = render(<Diff title="agents/retry.ts" from={from} to={to} />);
    expect(screen.getByRole('group', { name: 'agents/retry.ts' })).toBe(scrollOf(container));
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('is named Diff when the title is not a string', () => {
    render(<Diff title={<b>retry</b>} from={from} to={to} />);
    expect(screen.getByRole('group', { name: 'Diff' })).toBeTruthy();
  });

  it('is a region named by aria-label, which names the scroll part and not the wrapper', () => {
    const { container } = render(<Diff title="agents/retry.ts" aria-label="Retry change" from={from} to={to} />);
    expect(screen.getByRole('region', { name: 'Retry change' })).toBe(scrollOf(container));
    expect(container.querySelector('.ef-diff').hasAttribute('aria-label')).toBe(false);
  });

  it('is a region named by aria-labelledby, which beats aria-label', () => {
    const { container } = render(<div><h2 id="cap">Retry change</h2><Diff aria-label="Loses" aria-labelledby="cap" from={from} to={to} /></div>);
    const region = scrollOf(container);
    expect(region.getAttribute('aria-labelledby')).toBe('cap');
    expect(region.hasAttribute('aria-label')).toBe(false);
    expect(container.querySelector('.ef-diff').hasAttribute('aria-labelledby')).toBe(false);
    expect(screen.getByRole('region', { name: 'Retry change' })).toBe(region);
  });

  it('makes each open file a group named after the file, never a landmark', () => {
    const files = [
      { name: 'a.ts', from: 'one', to: 'two' },
      { name: 'b.ts', from: 'x', to: 'y' },
      { name: 'c.ts', from: 'x', to: 'y', defaultOpen: false },
    ];
    const { container } = render(<Diff files={files} aria-label="Ignored for files" />);
    const parts = container.querySelectorAll('.ef-diff__scroll');
    expect(parts).toHaveLength(2);
    expect(parts[0].getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('group', { name: 'a.ts' })).toBe(parts[0]);
    expect(screen.getByRole('group', { name: 'b.ts' })).toBe(parts[1]);
    expect(screen.queryByRole('region')).toBeNull();
  });
});

describe('ScrollArea viewport', () => {
  const viewportOf = container => container.querySelector('[data-slot="scroll-area-viewport"]');
  const wrapperOf = container => container.querySelector('[data-slot="scroll-area"]');

  it('is a focusable group named Scroll area while the caller gives no name', () => {
    const { container } = render(<ScrollArea maxHeight={80}><p>Long content</p></ScrollArea>);
    expect(viewportOf(container).getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('group', { name: 'Scroll area' })).toBe(viewportOf(container));
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('takes the default words from label and stays a group', () => {
    render(<ScrollArea label="Area gulir"><p>Entry</p></ScrollArea>);
    expect(screen.getByRole('group', { name: 'Area gulir' })).toBeTruthy();
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('is a region named by aria-label, which names the viewport and never the wrapper', () => {
    const { container } = render(<ScrollArea aria-label="Activity log" label="Ignored"><p>Entry</p></ScrollArea>);
    expect(screen.getByRole('region', { name: 'Activity log' })).toBe(viewportOf(container));
    expect(wrapperOf(container).hasAttribute('aria-label')).toBe(false);
    expect(wrapperOf(container).hasAttribute('role')).toBe(false);
  });

  it('is a region named by aria-labelledby, which beats aria-label and never lands on the wrapper', () => {
    const { container } = render(<div><h2 id="cap">Activity log</h2><ScrollArea aria-label="Loses" aria-labelledby="cap"><p>Entry</p></ScrollArea></div>);
    const viewport = viewportOf(container);
    expect(viewport.hasAttribute('aria-label')).toBe(false);
    expect(viewport.getAttribute('aria-labelledby')).toBe('cap');
    expect(wrapperOf(container).hasAttribute('aria-labelledby')).toBe(false);
    expect(screen.getByRole('region', { name: 'Activity log' })).toBe(viewport);
  });
});

describe('Carousel content', () => {
  const slides = [1, 2, 3].map(n => <CarouselItem key={n}>Slide {n}</CarouselItem>);
  const contentOf = container => container.querySelector('[data-slot="carousel-content"]');

  it('is a focusable group named Slides when the root has no name', () => {
    const { container } = render(<Carousel><CarouselContent>{slides}</CarouselContent></Carousel>);
    expect(contentOf(container).getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('group', { name: 'Slides' })).toBe(contentOf(container));
  });

  it('adds no landmark beside the root, which is already the carousel region', () => {
    render(<Carousel aria-label="Featured work"><CarouselContent>{slides}</CarouselContent></Carousel>);
    expect(screen.getAllByRole('region')).toHaveLength(1);
  });

  it('puts the label after the root name, so the two never share a name', () => {
    const { container } = render(<Carousel aria-label="Featured work"><CarouselContent>{slides}</CarouselContent></Carousel>);
    expect(screen.getByRole('region', { name: 'Featured work' })).toBe(container.querySelector('[data-slot="carousel"]'));
    expect(screen.getByRole('group', { name: 'Featured work Slides' })).toBe(contentOf(container));
  });

  it('does the same for a root named by aria-labelledby', () => {
    const { container } = render(<div><h2 id="cap">Featured work</h2><Carousel aria-labelledby="cap"><CarouselContent>{slides}</CarouselContent></Carousel></div>);
    expect(screen.getByRole('group', { name: 'Featured work Slides' })).toBe(contentOf(container));
    expect(screen.getByRole('region', { name: 'Featured work' })).toBe(container.querySelector('[data-slot="carousel"]'));
  });

  it('takes the default words from label', () => {
    const { container } = render(<Carousel aria-label="Karya"><CarouselContent label="Slide">{slides}</CarouselContent></Carousel>);
    expect(screen.getByRole('group', { name: 'Karya Slide' })).toBe(contentOf(container));
    expect(container.querySelector('[data-slot="carousel-content"]').hasAttribute('label')).toBe(false);
  });

  it('lets aria-label or aria-labelledby on the content replace the whole name', () => {
    const { container, rerender } = render(<Carousel aria-label="Featured work"><CarouselContent aria-label="Case studies" label="Ignored">{slides}</CarouselContent></Carousel>);
    expect(screen.getByRole('group', { name: 'Case studies' })).toBe(contentOf(container));
    rerender(<div><h2 id="cap">Our cases</h2><Carousel aria-label="Featured work"><CarouselContent aria-label="Loses" aria-labelledby="cap">{slides}</CarouselContent></Carousel></div>);
    expect(screen.getByRole('group', { name: 'Our cases' })).toBe(contentOf(container));
  });

  it('lets a passed role win', () => {
    const { container } = render(<Carousel><CarouselContent role="region" aria-label="Pictures">{slides}</CarouselContent></Carousel>);
    expect(screen.getByRole('region', { name: 'Pictures' })).toBe(contentOf(container));
  });

  it('names a content outside a Carousel Slides', () => {
    render(<CarouselContent>{slides}</CarouselContent>);
    expect(screen.getByRole('group', { name: 'Slides' })).toBeTruthy();
  });
});
