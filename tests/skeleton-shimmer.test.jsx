import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from '../components/data/Skeleton.jsx';

describe('Skeleton shimmer', () => {
  it('pulses by default and sweeps a band with shimmer', () => {
    const { container } = render(<><Skeleton /><Skeleton shimmer /></>);
    const [pulse, shimmer] = container.querySelectorAll('[data-slot="skeleton"]');
    expect(pulse.hasAttribute('data-shimmer')).toBe(false);
    expect(shimmer.hasAttribute('data-shimmer')).toBe(true);
  });

  it('shows a still block under reduced motion', () => {
    render(<Skeleton shimmer />);
    const rules = document.getElementById('ef-css-skel').textContent.replace(/\s+/g, '');
    expect(rules).toContain('@media(prefers-reduced-motion:reduce){.ef-skel[data-shimmer]{background:var(--border-default);animation:none}}');
  });
});
