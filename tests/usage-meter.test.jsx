import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { UsageMeter } from '../components/ai/UsageMeter.jsx';

// Display-area review, 2026-11-12. Each block failed before its fix.

describe('UsageMeter', () => {
  it('keeps aria-valuenow inside the 0..100 range when over the limit', () => {
    render(<UsageMeter used={150} limit={100} />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');
    // the overage is still spoken
    expect(screen.getByRole('progressbar').getAttribute('aria-valuetext')).toBe('150 / 100');
  });
});
