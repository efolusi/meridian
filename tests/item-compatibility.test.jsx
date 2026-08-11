import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '../components/display/Item.jsx';

describe('Item compatibility contract', () => {
  it('composes every documented slot with stable data attributes', () => {
    render(
      <ItemGroup aria-label="Deployments">
        <Item variant="outline" size="sm">
          <ItemHeader>Production</ItemHeader>
          <ItemMedia variant="icon">I</ItemMedia>
          <ItemContent><ItemTitle>API</ItemTitle><ItemDescription>Healthy</ItemDescription></ItemContent>
          <ItemActions>Live</ItemActions>
          <ItemFooter>Updated now</ItemFooter>
        </Item>
        <ItemSeparator />
      </ItemGroup>,
    );
    const item = screen.getByText('API').closest('[data-slot="item"]');
    expect(screen.getByRole('list', { name: 'Deployments' })).toBeTruthy();
    expect(item.dataset.variant).toBe('outline');
    expect(item.dataset.size).toBe('sm');
    for (const slot of ['item-header', 'item-media', 'item-content', 'item-title', 'item-description', 'item-actions', 'item-footer']) {
      expect(item.querySelector(`[data-slot="${slot}"]`)).toBeTruthy();
    }
    expect(document.querySelector('[data-slot="item-separator"]')).toBeTruthy();
  });

  it('supports the cross-primitive render contract', () => {
    render(<Item render={<a href="/docs" className="consumer" />} className="system"><ItemTitle>Documentation</ItemTitle></Item>);
    const link = screen.getByRole('link', { name: 'Documentation' });
    expect(link.getAttribute('href')).toBe('/docs');
    expect(link.className).toContain('ef-item');
    expect(link.className).toContain('consumer');
    expect(link.className).toContain('system');
  });

  it('supports asChild without wrapping the consumer element', () => {
    const click = vi.fn();
    render(<Item asChild variant="muted"><button type="button" onClick={click}>Open</button></Item>);
    const button = screen.getByRole('button', { name: 'Open' });
    button.click();
    expect(click).toHaveBeenCalledOnce();
    expect(button.dataset.variant).toBe('muted');
    expect(button.parentElement.children).toHaveLength(1);
  });

  it('forwards refs and supports the extra-small density', () => {
    const ref = React.createRef();
    render(<Item ref={ref} size="xs">Compact</Item>);
    expect(ref.current).toBe(screen.getByText('Compact'));
    expect(ref.current.dataset.size).toBe('xs');
  });
});
