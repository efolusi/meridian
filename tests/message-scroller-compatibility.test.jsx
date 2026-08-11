// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from '../components/ai/MessageScroller.jsx';

beforeEach(() => {
  HTMLElement.prototype.scrollTo = vi.fn(function scrollTo(options) { this.scrollTop = Number(options?.top || 0); });
});
afterEach(cleanup);

function Fixture({ rows = 5, autoScroll = false }) {
  return <MessageScrollerProvider autoScroll={autoScroll} defaultScrollPosition="start"><MessageScroller data-testid="root"><MessageScrollerViewport data-testid="viewport"><MessageScrollerContent>{Array.from({ length: rows }, (_, index) => <MessageScrollerItem key={index} messageId={`m-${index}`} scrollAnchor={index % 2 === 0}>Message {index}</MessageScrollerItem>)}</MessageScrollerContent></MessageScrollerViewport><MessageScrollerButton /></MessageScroller></MessageScrollerProvider>;
}

describe('MessageScroller compatibility', () => {
  it('renders every composition slot with accessible defaults', () => {
    render(<Fixture />);
    const viewport = screen.getByTestId('viewport');
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.getAttribute('aria-label')).toBe('Messages');
    expect(viewport.tabIndex).toBe(0);
    expect(viewport.querySelector('[data-slot="message-scroller-content"]')?.getAttribute('role')).toBe('log');
    expect(viewport.querySelectorAll('[data-slot="message-scroller-item"]')).toHaveLength(5);
  });

  it('reports scrollable edges and drives the default button toward the end', () => {
    render(<Fixture />);
    const viewport = screen.getByTestId('viewport');
    Object.defineProperties(viewport, { clientHeight: { configurable: true, value: 100 }, scrollHeight: { configurable: true, value: 400 } });
    viewport.scrollTop = 40;
    fireEvent.scroll(viewport);
    const button = screen.getByRole('button', { name: 'Scroll to end' });
    expect(button.dataset.active).toBe('true');
    fireEvent.click(button);
    expect(viewport.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 400 }));
  });

  it('exposes scroll commands and state hooks inside the provider', () => {
    let api;
    function Probe() {
      api = { commands: useMessageScroller(), scrollable: useMessageScrollerScrollable(), visibility: useMessageScrollerVisibility() };
      return null;
    }
    render(<MessageScrollerProvider><Probe /><MessageScroller><MessageScrollerViewport data-testid="commands"><MessageScrollerContent><MessageScrollerItem messageId="target">Target</MessageScrollerItem></MessageScrollerContent></MessageScrollerViewport></MessageScroller></MessageScrollerProvider>);
    expect(Object.keys(api.commands).sort()).toEqual(['scrollToEnd', 'scrollToMessage', 'scrollToStart']);
    expect(api.scrollable).toEqual({ start: false, end: false });
    expect(api.visibility).toEqual({ currentAnchorId: null, visibleMessageIds: [] });
    expect(api.commands.scrollToMessage('missing')).toBe(false);
  });

  it('fails loudly when a hook is used outside its provider', () => {
    function Invalid() { useMessageScroller(); return null; }
    expect(() => render(<Invalid />)).toThrow('useMessageScroller must be used inside a <MessageScrollerProvider>');
  });
});
