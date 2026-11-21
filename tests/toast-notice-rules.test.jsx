import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Toaster, toast } from '../components/feedback/Toast.jsx';

// MD32 (#211): a toast follows the notice rules in design-tokens docs/motion.md (WCAG 2.2.1):
// 1. what the user must act on never dismisses itself, 2. a self-dismissing toast pauses while hovered,
// focused or hidden, and has a visible dismiss control, 3. it is announced politely, 4. the hold is the
// --hold-notice token.
const setHidden = (hidden) => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (hidden ? 'hidden' : 'visible') });
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  document.dispatchEvent(new Event('visibilitychange'));
};
const root = document.documentElement;
const advance = (ms) => act(() => { vi.advanceTimersByTime(ms); });
const add = (options) => act(() => { toast.add(options); });
const shown = (title) => screen.queryByText(title) !== null;

beforeEach(() => { vi.useFakeTimers(); root.style.setProperty('--hold-notice', '8000ms'); });
afterEach(() => { act(() => toast.close()); setHidden(false); root.style.removeProperty('--hold-notice'); vi.useRealTimers(); });

describe('what the user must act on never dismisses itself', () => {
  it('a danger toast stays, with the default and with an explicit duration', () => {
    render(<Toaster />);
    add({ title: 'Payment failed', type: 'danger' });
    add({ title: 'Upload failed', type: 'danger', duration: 1000 });
    advance(120000);
    expect(shown('Payment failed') && shown('Upload failed')).toBe(true);
  });

  it('an action toast and a loading toast stay', () => {
    render(<Toaster />);
    add({ title: 'Message archived', actionProps: { children: 'Undo' }, duration: 1000 });
    add({ title: 'Uploading', type: 'loading' });
    advance(120000);
    expect(shown('Message archived') && shown('Uploading')).toBe(true);
  });

  it('a promise that fails leaves a danger toast that stays', async () => {
    render(<Toaster />);
    let reject;
    act(() => { toast.promise(new Promise((_, r) => { reject = r; }), { loading: 'Saving', success: 'Saved', error: 'Could not save', duration: 500 }); });
    await act(async () => { reject(new Error('offline')); });
    advance(120000);
    expect(shown('Could not save')).toBe(true);
  });

  it('a success, info or warning toast dismisses itself, and duration 0 keeps one', () => {
    render(<Toaster />);
    add({ title: 'Saved', type: 'success' });
    add({ title: 'Heads up', type: 'warning' });
    add({ title: 'Pinned', duration: 0 });
    advance(8001);
    expect(shown('Saved') || shown('Heads up')).toBe(false);
    expect(shown('Pinned')).toBe(true);
  });
});

describe('pausing', () => {
  it('pauses while hovered and resumes with the time that was left, not a restart', () => {
    render(<Toaster />);
    add({ title: 'Saved' });
    advance(5000);
    const stack = screen.getByRole('log');
    fireEvent.mouseEnter(stack);
    advance(60000);
    expect(shown('Saved')).toBe(true);
    fireEvent.mouseLeave(stack);
    advance(2900);
    expect(shown('Saved')).toBe(true);
    advance(200);
    expect(shown('Saved')).toBe(false);
  });

  it('pauses while a control inside has focus', () => {
    render(<Toaster />);
    add({ title: 'Saved' });
    advance(1000);
    const dismiss = screen.getByRole('button', { name: 'Dismiss' });
    act(() => { fireEvent.focus(dismiss); });
    advance(60000);
    expect(shown('Saved')).toBe(true);
    act(() => { fireEvent.blur(dismiss); });
    advance(7100);
    expect(shown('Saved')).toBe(false);
  });

  it('pauses while the window is not visible and resumes with the time that was left', () => {
    render(<Toaster />);
    add({ title: 'Saved' });
    advance(6000);
    act(() => setHidden(true));
    advance(60000);
    expect(shown('Saved')).toBe(true);
    act(() => setHidden(false));
    advance(1900);
    expect(shown('Saved')).toBe(true);
    advance(200);
    expect(shown('Saved')).toBe(false);
  });

  it('a toast added while the window is hidden waits until it is visible', () => {
    render(<Toaster />);
    act(() => setHidden(true));
    add({ title: 'Saved' });
    advance(60000);
    expect(shown('Saved')).toBe(true);
    act(() => setHidden(false));
    advance(8100);
    expect(shown('Saved')).toBe(false);
  });

  it('stays paused while hovered even after the window shows again', () => {
    render(<Toaster />);
    add({ title: 'Saved' });
    const stack = screen.getByRole('log');
    fireEvent.mouseEnter(stack);
    act(() => setHidden(true));
    act(() => setHidden(false));
    advance(60000);
    expect(shown('Saved')).toBe(true);
    fireEvent.mouseLeave(stack);
    advance(8100);
    expect(shown('Saved')).toBe(false);
  });
});

describe('a visible dismiss control by default', () => {
  it('every toast has Dismiss with a bare Toaster, and it closes the toast', () => {
    render(<Toaster />);
    add({ title: 'Saved' });
    add({ title: 'Uploading', type: 'loading' });
    expect(screen.getAllByRole('button', { name: 'Dismiss' })).toHaveLength(2);
    act(() => { screen.getAllByRole('button', { name: 'Dismiss' })[0].click(); });
    expect(shown('Saved')).toBe(false);
  });

  it('closeButton={false} on the Toaster turns it off for a toast that expires', () => {
    render(<Toaster closeButton={false} />);
    add({ title: 'Saved' });
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
  });

  it('closeButton: false on one toast turns it off for that toast only', () => {
    render(<Toaster />);
    add({ title: 'Saved', closeButton: false });
    add({ title: 'Also saved' });
    expect(screen.getAllByRole('button', { name: 'Dismiss' })).toHaveLength(1);
  });

  it('a toast that never expires keeps its Dismiss even when the Toaster turns it off', () => {
    render(<Toaster closeButton={false} />);
    add({ title: 'Payment failed', type: 'danger' });
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeTruthy();
  });
});

describe('the hold is the --hold-notice token', () => {
  it('uses the token value, whatever it is', () => {
    root.style.setProperty('--hold-notice', '3000ms');
    render(<Toaster />);
    add({ title: 'Saved' });
    advance(2900);
    expect(shown('Saved')).toBe(true);
    advance(200);
    expect(shown('Saved')).toBe(false);
  });

  it('reads seconds too, and the Toaster duration prop wins', () => {
    root.style.setProperty('--hold-notice', '2s');
    const { unmount } = render(<Toaster />);
    add({ title: 'Saved' });
    advance(1900);
    expect(shown('Saved')).toBe(true);
    advance(200);
    expect(shown('Saved')).toBe(false);
    unmount();
    render(<Toaster duration={500} />);
    add({ title: 'Quick' });
    advance(600);
    expect(shown('Quick')).toBe(false);
  });

  it('falls back to 8000 ms where the token is not loaded', () => {
    root.style.removeProperty('--hold-notice');
    render(<Toaster />);
    add({ title: 'Saved' });
    advance(7900);
    expect(shown('Saved')).toBe(true);
    advance(200);
    expect(shown('Saved')).toBe(false);
  });
});

describe('announced politely', () => {
  // One live region on the stack: a status on each toast as well would announce a toast twice
  // (tests/runtime.test.jsx pins the same thing).
  it('the stack is a polite log and the toasts add no live region of their own', () => {
    render(<Toaster />);
    add({ title: 'Saved' });
    add({ title: 'Payment failed', type: 'danger' });
    const stack = screen.getByRole('log');
    expect(stack.getAttribute('aria-live')).toBe('polite');
    const toasts = [...stack.querySelectorAll('[data-slot="toast"]')];
    expect(toasts).toHaveLength(2);
    for (const item of toasts) expect(item.getAttribute('role')).toBeNull();
    expect(stack.getAttribute('aria-relevant')).toBe('additions');
  });
});
