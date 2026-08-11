import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from '../components/data/Skeleton.jsx';
import { Badge, badgeVariants } from '../components/display/Badge.jsx';
import { Spinner } from '../components/feedback/Spinner.jsx';

describe('Skeleton compatibility contract', () => {
  it('renders a native div and forwards its ref and attributes', () => {
    const ref = React.createRef();
    render(<Skeleton ref={ref} data-testid="skeleton" aria-label="Loading profile" className="rounded" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton.tagName).toBe('DIV');
    expect(ref.current).toBe(skeleton);
    expect(skeleton.dataset.slot).toBe('skeleton');
    expect(skeleton.classList.contains('rounded')).toBe(true);
  });

  it('accepts native style attributes without changing its element shape', () => {
    render(<Skeleton style={{ width: '80%', height: 12, borderRadius: 999 }} data-testid="styled" />);
    const skeleton = screen.getByTestId('styled');
    expect(skeleton.style.width).toBe('80%');
    expect(skeleton.style.height).toBe('12px');
    expect(skeleton.style.borderRadius).toBe('999px');
  });
});

describe('Spinner compatibility contract', () => {
  it('renders an accessible svg and forwards svg props and its ref', () => {
    const ref = React.createRef();
    render(<Spinner ref={ref} aria-label="Saving" data-state="pending" className="custom-spinner" />);
    const spinner = screen.getByRole('status', { name: 'Saving' });
    expect(spinner.tagName).toBe('svg');
    expect(ref.current).toBe(spinner);
    expect(spinner.dataset.state).toBe('pending');
    expect(spinner.classList.contains('custom-spinner')).toBe(true);
    expect(spinner.getAttribute('width')).toBe('16');
    expect(spinner.getAttribute('height')).toBe('16');
  });

  it('accepts native dimensions and an accessible-name override', () => {
    render(<Spinner width={24} height={24} aria-label="Restoring" />);
    const spinner = screen.getByRole('status', { name: 'Restoring' });
    expect(spinner.getAttribute('width')).toBe('24');
    expect(spinner.getAttribute('height')).toBe('24');
  });
});

describe('Badge compatibility contract', () => {
  it.each(['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'])(
    'supports the %s variant',
    (variant) => {
      render(<Badge variant={variant} data-testid={`badge-${variant}`}>{variant}</Badge>);
      expect(screen.getByTestId(`badge-${variant}`).classList.contains(`ef-badge--${variant}`)).toBe(true);
    },
  );

  it('exports badgeVariants and preserves legacy tone helpers', () => {
    expect(badgeVariants()).toBe('ef-badge ef-badge--default');
    expect(badgeVariants({ variant: 'outline', className: 'custom' }))
      .toBe('ef-badge ef-badge--outline custom');
    expect(badgeVariants({ tone: 'success', size: 'md' }))
      .toBe('ef-badge ef-badge--success ef-badge--md');
  });

  it('renders a semantic child and forwards its ref with asChild', () => {
    const ref = React.createRef();
    render(
      <Badge ref={ref} asChild variant="outline">
        <a href="/release" className="consumer-link">Release notes</a>
      </Badge>,
    );
    const link = screen.getByRole('link', { name: 'Release notes' });
    expect(ref.current).toBe(link);
    expect(link.getAttribute('href')).toBe('/release');
    expect(link.dataset.slot).toBe('badge');
    expect(link.classList.contains('consumer-link')).toBe(true);
    expect(link.classList.contains('ef-badge--outline')).toBe(true);
  });
});
