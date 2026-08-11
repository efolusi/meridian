import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Progress } from '../components/feedback/Progress.jsx';

describe('Progress compatibility contract', () => {
  it('renders determinate semantics, state data, native props, and its ref', () => {
    const ref = React.createRef();
    render(<Progress ref={ref} value={33} aria-label="Upload" className="consumer-progress" data-job="upload" />);
    const progress = screen.getByRole('progressbar', { name: 'Upload' });
    expect(ref.current).toBe(progress);
    expect(progress.getAttribute('aria-valuenow')).toBe('33');
    expect(progress.getAttribute('aria-valuemin')).toBe('0');
    expect(progress.getAttribute('aria-valuemax')).toBe('100');
    expect(progress.dataset.state).toBe('loading');
    expect(progress.dataset.value).toBe('33');
    expect(progress.dataset.max).toBe('100');
    expect(progress.dataset.job).toBe('upload');
    expect(progress.classList.contains('consumer-progress')).toBe(true);
    expect(progress.querySelector('[data-slot="progress-indicator"]').style.transform)
      .toBe('translateX(calc(-100% + 33%))');
  });

  it('clamps values and exposes the complete state', () => {
    render(<Progress value={120} max={80} aria-label="Migration" />);
    const progress = screen.getByRole('progressbar', { name: 'Migration' });
    expect(progress.getAttribute('aria-valuenow')).toBe('80');
    expect(progress.getAttribute('aria-valuemax')).toBe('80');
    expect(progress.dataset.state).toBe('complete');
  });

  it('supports an accessible indeterminate state', () => {
    render(<Progress aria-label="Preparing" />);
    const progress = screen.getByRole('progressbar', { name: 'Preparing' });
    expect(progress.dataset.state).toBe('indeterminate');
    expect(progress.hasAttribute('aria-valuenow')).toBe(false);
  });

  it('keeps integrated label, formatted value, and semantic tone additive', () => {
    const format = vi.fn((value, max) => `${value} of ${max}`);
    render(<Progress value={4} max={5} label="Seats used" showValue format={format} tone="warning" />);
    const progress = screen.getByRole('progressbar', { name: 'Seats used' });
    expect(progress.dataset.tone).toBe('warning');
    expect(screen.getByText('4 of 5')).toBeTruthy();
    expect(format).toHaveBeenCalledWith(4, 5);
  });

  it('preserves an explicit accessible relationship', () => {
    render(<><span id="sync-label">Data sync</span><Progress value={20} label="Legacy label" aria-labelledby="sync-label" /></>);
    expect(screen.getByRole('progressbar', { name: 'Data sync' })).toBeTruthy();
  });
});
