// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from '../components/ai/Message.jsx';

afterEach(cleanup);

describe('Message compatibility', () => {
  it('composes every public slot', () => {
    render(<Message align="end" data-testid="message"><MessageAvatar>AO</MessageAvatar><MessageContent><MessageHeader>Ada</MessageHeader><div>Ready to deploy.</div><MessageFooter>Delivered</MessageFooter></MessageContent></Message>);
    const row = screen.getByTestId('message');
    expect(row.dataset.slot).toBe('message');
    expect(row.dataset.align).toBe('end');
    expect(row.querySelector('[data-slot="message-avatar"]')?.textContent).toBe('AO');
    expect(row.querySelector('[data-slot="message-header"]')?.textContent).toBe('Ada');
    expect(row.querySelector('[data-slot="message-footer"]')?.textContent).toBe('Delivered');
  });

  it('groups consecutive messages with independent alignment', () => {
    render(<MessageGroup align="start" data-testid="group"><Message><MessageContent>One</MessageContent></Message><Message><MessageContent>Two</MessageContent></Message></MessageGroup>);
    const group = screen.getByTestId('group');
    expect(group.dataset.slot).toBe('message-group');
    expect(group.dataset.align).toBe('start');
    expect(group.querySelectorAll('[data-slot="message"]')).toHaveLength(2);
  });

  it('forwards native attributes and refs', () => {
    const ref = React.createRef();
    render(<Message ref={ref} aria-label="Assistant response" className="custom"><MessageContent>Done</MessageContent></Message>);
    expect(ref.current.getAttribute('aria-label')).toBe('Assistant response');
    expect(ref.current.className.split(' ')).toContain('custom');
  });
});
