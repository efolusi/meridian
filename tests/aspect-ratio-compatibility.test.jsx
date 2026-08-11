import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AspectRatio } from '../components/display/AspectRatio.jsx';

describe('AspectRatio compatibility contract', () => {
  it('applies required landscape, square, and portrait ratios', () => {
    const { rerender } = render(<AspectRatio ratio={16 / 9} data-testid="ratio"><span>Media</span></AspectRatio>);
    const root = screen.getByTestId('ratio');
    expect(root.style.aspectRatio).toBe('1.778');
    rerender(<AspectRatio ratio={1} data-testid="ratio"><span>Media</span></AspectRatio>);
    expect(root.style.aspectRatio).toBe('1');
    rerender(<AspectRatio ratio={9 / 16} data-testid="ratio"><span>Media</span></AspectRatio>);
    expect(root.style.aspectRatio).toBe('0.563');
  });

  it('forwards its ref, class, native attributes, and consumer style', () => {
    const ref = React.createRef();
    render(
      <AspectRatio
        ref={ref}
        ratio={4 / 3}
        className="consumer-ratio"
        aria-label="Preview"
        data-kind="image"
        style={{ maxWidth: 320 }}
      >
        <img alt="Workspace" />
      </AspectRatio>,
    );
    const root = screen.getByLabelText('Preview');
    expect(ref.current).toBe(root);
    expect(root.classList.contains('consumer-ratio')).toBe(true);
    expect(root.dataset.kind).toBe('image');
    expect(root.style.maxWidth).toBe('320px');
    expect(root.style.aspectRatio).toBe('1.333');
    expect(screen.getByRole('img', { name: 'Workspace' })).toBeTruthy();
  });
});
