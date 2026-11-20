import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { Item, ItemContent, ItemGroup, ItemSeparator, ItemTitle } from '../components/display/Item.jsx';
import { FileTile } from '../components/files/FileTile.jsx';

// Audit lows on #179: strict-CSP sites block style attributes, and VoiceOver drops the role
// of a display:contents element.
const group = (
  <ItemGroup aria-label="Deployments">
    <Item><ItemContent><ItemTitle>One</ItemTitle></ItemContent></Item>
    <ItemSeparator decorative={false} />
    <Item><ItemContent><ItemTitle>Two</ItemTitle></ItemContent></Item>
  </ItemGroup>
);

describe('ItemGroup list semantics', () => {
  it('wraps each item in a listitem box with no style attribute', () => {
    const html = renderToString(group);
    expect(html).not.toMatch(/style="/);
    const { getByRole, getAllByRole } = render(group);
    expect(getByRole('list', { name: 'Deployments' })).toBeTruthy();
    expect(getAllByRole('listitem')).toHaveLength(2);
  });

  it('keeps a separator inside the list decorative', () => {
    const { container } = render(group);
    expect(container.querySelector('[data-slot="item-separator"]').getAttribute('role')).toBe('none');
  });
});

describe('FileTile', () => {
  it('lays out its body and progress bar with classes, not style attributes', () => {
    const { container } = render(<FileTile name="report.pdf" progress={40} />);
    const body = container.querySelector('.ef-filetile__body');
    const bar = container.querySelector('.ef-filetile__progress');
    expect(body.hasAttribute('style')).toBe(false);
    expect(bar.hasAttribute('style')).toBe(false);
    expect(bar.getAttribute('aria-label')).toBe('report.pdf');
  });
});
