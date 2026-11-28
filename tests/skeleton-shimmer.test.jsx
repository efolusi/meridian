import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { render } from '@testing-library/react';
import { Skeleton } from '../components/data/Skeleton.jsx';

describe('Skeleton shimmer', () => {
  it('pulses by default and sweeps a band with shimmer', () => {
    const { container } = render(<><Skeleton /><Skeleton shimmer /></>);
    const [pulse, shimmer] = container.querySelectorAll('[data-slot="skeleton"]');
    expect(pulse.hasAttribute('data-shimmer')).toBe(false);
    expect(shimmer.hasAttribute('data-shimmer')).toBe(true);
  });

  it('keeps sweeping under reduced motion: a skeleton signals loading, and the guard leaves it running (MD122)', () => {
    render(<Skeleton shimmer />);
    const rules = document.getElementById('ef-css-skel').textContent.replace(/\s+/g, '');
    expect(rules).not.toMatch(/prefers-reduced-motion:reduce\)\{[^}]*ef-skel/);
    expect(rules).toContain('.ef-skel[data-shimmer]{background:linear-gradient');
  });

  it('is hidden from assistive technology unless the caller says otherwise', () => {
    const { container } = render(<><Skeleton /><Skeleton aria-hidden="false" /></>);
    const [a, b] = container.querySelectorAll('[data-slot="skeleton"]');
    expect(a.getAttribute('aria-hidden')).toBe('true');
    expect(b.getAttribute('aria-hidden')).toBe('false');
  });

  it('renders the same markup on the server', () => {
    const html = renderToString(<Skeleton shimmer />);
    expect(html).toContain('data-shimmer=""');
    expect(html).toContain('aria-hidden="true"');
  });

  it('stays visible in Windows High Contrast, where backgrounds are dropped', () => {
    render(<Skeleton />);
    const rules = document.getElementById('ef-css-skel').textContent.replace(/\s+/g, '');
    expect(rules).toContain('@media(forced-colors:active){.ef-skel,.ef-skel[data-shimmer]{forced-color-adjust:none;background:GrayText}}');
  });
});
