import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Citation, SourceList } from '../components/ai/Citation.jsx';

// Display-area review, 2026-11-12. Each block failed before its fix.

describe('Citation hover card is reachable from the keyboard', () => {
  it('opens on focus and closes on Escape', () => {
    vi.useFakeTimers();
    try {
      render(<Citation index={1} sources={[{ url: 'https://a.example', title: 'Alpha', domain: 'a.example' }]} />);
      act(() => { screen.getByRole('link').focus(); vi.advanceTimersByTime(300); });
      expect(screen.getByText('Alpha')).toBeTruthy();
      act(() => { fireEvent.keyDown(screen.getByRole('link'), { key: 'Escape' }); });
      expect(screen.queryByText('Alpha')).toBeNull();
    } finally { vi.useRealTimers(); }
  });
});

