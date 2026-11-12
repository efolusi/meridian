import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Toaster, toast } from '../components/feedback/Toast.jsx';

// A toast with an action, or with duration 0, never expires. With the
// Toaster's default closeButton={false} it rendered no Dismiss button either,
// and clicking the action does not close it, so it stayed on screen for good.
afterEach(() => act(() => toast.close()));

describe('toasts that never expire can be dismissed', () => {
  it('an action toast gets a Dismiss button', () => {
    render(<Toaster />);
    act(() => { toast.add({ title: 'Message archived', actionProps: { children: 'Undo' } }); });
    act(() => { screen.getByRole('button', { name: 'Dismiss' }).click(); });
    expect(screen.queryByText('Message archived')).toBeNull();
  });

  it('so does a toast with duration 0', () => {
    render(<Toaster />);
    act(() => { toast.add({ title: 'Connection lost', duration: 0 }); });
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeTruthy();
  });

  it('an expiring toast and a loading toast keep the Toaster default', () => {
    render(<Toaster />);
    act(() => { toast.add({ title: 'Saved' }); toast.add({ title: 'Uploading', type: 'loading' }); });
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
  });

  it('closeButton: false on the toast is still respected', () => {
    render(<Toaster />);
    act(() => { toast.add({ title: 'Read only', duration: 0, closeButton: false }); });
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
  });
});
