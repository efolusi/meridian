import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Toaster, toast } from '../components/feedback/Sonner.jsx';

afterEach(() => { act(() => toast.dismiss()); vi.useRealTimers(); });

describe('Sonner compatibility', () => {
  it('mounts a live region and publishes imperative toast types', () => {
    render(<Toaster position="top-center" closeButton />);
    act(() => toast.success('Release published', { description: 'All regions are healthy.', duration: 0 }));
    expect(screen.getByRole('log').getAttribute('data-position')).toBe('top-center');
    expect(screen.getByText('Release published')).toBeTruthy();
    expect(screen.getByText('All regions are healthy.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeTruthy();
  });

  it('updates an existing id instead of duplicating it', () => {
    render(<Toaster />);
    act(() => { toast.loading('Publishing…', { id: 'release' }); toast.success('Published', { id: 'release', duration: 0 }); });
    expect(screen.queryByText('Publishing…')).toBeNull();
    expect(screen.getAllByText('Published')).toHaveLength(1);
  });

  it('supports actions and dismisses by id or globally', () => {
    const action = vi.fn();
    render(<Toaster />);
    let id;
    act(() => { id = toast('Invite sent', { action: { label: 'Undo', onClick: action }, duration: 0 }); });
    screen.getByRole('button', { name: 'Undo' }).click();
    expect(action).toHaveBeenCalledOnce();
    act(() => toast.dismiss(id));
    expect(screen.queryByText('Invite sent')).toBeNull();
  });

  it('resolves promise toasts in place', async () => {
    render(<Toaster />);
    await act(async () => { toast.promise(Promise.resolve('ready'), { loading: 'Checking…', success: value => `Release ${value}`, error: 'Failed', duration: 0 }); await Promise.resolve(); });
    expect(screen.queryByText('Checking…')).toBeNull();
    expect(screen.getByText('Release ready')).toBeTruthy();
  });

  it('limits visible records and expires timed notifications', () => {
    vi.useFakeTimers();
    render(<Toaster visibleToasts={2} />);
    act(() => { toast('One', { duration: 100 }); toast('Two', { duration: 100 }); toast('Three', { duration: 100 }); });
    expect(screen.queryByText('One')).toBeNull();
    expect(screen.getByText('Two')).toBeTruthy();
    expect(screen.getByText('Three')).toBeTruthy();
    act(() => vi.advanceTimersByTime(101));
    expect(screen.queryByText('Three')).toBeNull();
  });
});
