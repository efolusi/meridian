import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { Conversation } from '../components/ai/Conversation.jsx';
import { Console } from '../components/code/Console.jsx';
import { Diff } from '../components/code/Diff.jsx';
import { Table } from '../components/data/Table.jsx';

// MD17: a part that scrolls must be reachable by keyboard (WCAG 2.1.1) and, being focusable,
// must say what it is (role) and what it is called (name, WCAG 4.1.2). axe calls the first
// rule scrollable-region-focusable.

describe('Conversation viewport', () => {
  it('is a focusable region named Conversation', () => {
    const { container } = render(<Conversation><p>Hello</p></Conversation>);
    const viewport = container.querySelector('.ef-conversation__viewport');
    expect(viewport.getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('region', { name: 'Conversation' })).toBe(viewport);
  });

  it('takes its name from aria-label', () => {
    const { container } = render(<Conversation aria-label="Support chat"><p>Hello</p></Conversation>);
    expect(screen.getByRole('region', { name: 'Support chat' })).toBe(container.querySelector('.ef-conversation__viewport'));
    expect(container.querySelector('.ef-conversation').hasAttribute('aria-label')).toBe(false);
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

  it('is a focusable region named Table while the content overflows', () => {
    const { container } = render(<Table columns={columns} rows={rows} />);
    const wrap = wrapOf(container);
    expect(wrap.getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('region', { name: 'Table' })).toBe(wrap);
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
    expect(wrap.getAttribute('role')).toBe('region');
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

  it('takes its name from aria-label or aria-labelledby', () => {
    const { container, rerender } = render(<Table columns={columns} rows={rows} aria-label="Customers" />);
    expect(screen.getByRole('region', { name: 'Customers' })).toBe(wrapOf(container));
    rerender(<div><h2 id="cap">Invoices</h2><Table columns={columns} rows={rows} aria-labelledby="cap" /></div>);
    const wrap = wrapOf(container);
    expect(wrap.getAttribute('aria-labelledby')).toBe('cap');
    expect(screen.getByRole('region', { name: 'Invoices' })).toBe(wrap);
  });

  it('lets a passed tabIndex win', () => {
    const { container } = render(<Table columns={columns} rows={rows} tabIndex={-1} />);
    expect(wrapOf(container).getAttribute('tabindex')).toBe('-1');
  });

  it('also covers the composed form', () => {
    const { container } = render(<Table><tbody><tr><td>One</td></tr></tbody></Table>);
    const wrap = wrapOf(container);
    expect(wrap.getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('region', { name: 'Table' })).toBe(wrap);
  });
});

describe('Diff scroll regions', () => {
  const from = 'const max = 3;\nreturn run();';
  const to = 'const max = 5;\nreturn run();';

  it('is a focusable region named Diff by default', () => {
    const { container } = render(<Diff from={from} to={to} />);
    const region = container.querySelector('.ef-diff__scroll');
    expect(region.getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('region', { name: 'Diff' })).toBe(region);
  });

  it('is named by a string title when there is one', () => {
    const { container } = render(<Diff title="agents/retry.ts" from={from} to={to} />);
    expect(screen.getByRole('region', { name: 'agents/retry.ts' })).toBe(container.querySelector('.ef-diff__scroll'));
  });

  it('is named Diff when the title is not a string', () => {
    render(<Diff title={<b>retry</b>} from={from} to={to} />);
    expect(screen.getByRole('region', { name: 'Diff' })).toBeTruthy();
  });

  it('takes its name from aria-label, which names the region and not the wrapper', () => {
    const { container } = render(<Diff aria-label="Retry change" from={from} to={to} />);
    expect(screen.getByRole('region', { name: 'Retry change' })).toBe(container.querySelector('.ef-diff__scroll'));
    expect(container.querySelector('.ef-diff').hasAttribute('aria-label')).toBe(false);
  });

  it('takes its name from aria-labelledby', () => {
    const { container } = render(<div><h2 id="cap">Retry change</h2><Diff aria-labelledby="cap" from={from} to={to} /></div>);
    const region = container.querySelector('.ef-diff__scroll');
    expect(region.getAttribute('aria-labelledby')).toBe('cap');
    expect(region.hasAttribute('aria-label')).toBe(false);
    expect(container.querySelector('.ef-diff').hasAttribute('aria-labelledby')).toBe(false);
    expect(screen.getByRole('region', { name: 'Retry change' })).toBe(region);
  });

  it('names each open file region after the file', () => {
    const files = [
      { name: 'a.ts', from: 'one', to: 'two' },
      { name: 'b.ts', from: 'x', to: 'y', defaultOpen: false },
    ];
    const { container } = render(<Diff files={files} aria-label="Ignored for files" />);
    const regions = container.querySelectorAll('.ef-diff__scroll');
    expect(regions).toHaveLength(1);
    expect(regions[0].getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('region', { name: 'a.ts' })).toBe(regions[0]);
    expect(screen.queryByRole('region', { name: 'Ignored for files' })).toBeNull();
  });
});
