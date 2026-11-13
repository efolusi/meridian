import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CodeBlock } from '../components/code/CodeBlock.jsx';
import { CopyField } from '../components/code/CopyField.jsx';

// Both said "Copied" whether or not the clipboard write happened (insecure
// context, denied permission). CodeBlock also never cleared its reset timer.
const setClipboard = writeText => Object.defineProperty(navigator, 'clipboard', { value: writeText ? { writeText } : undefined, configurable: true });
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

afterEach(() => { setClipboard(undefined); vi.restoreAllMocks(); vi.useRealTimers(); });

describe('CodeBlock copy result', () => {
  it('says Copied only after the write resolves', async () => {
    let resolve;
    setClipboard(vi.fn(() => new Promise(r => { resolve = r; })));
    render(<CodeBlock lang="sh">npm i</CodeBlock>);
    fireEvent.click(screen.getByRole('button', { name: /Copy/ }));
    expect(screen.queryByText('Copied')).toBeNull();
    await act(async () => { resolve(); });
    expect(screen.getByText('Copied')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Copied to clipboard');
  });
  it('shows a failure when the write rejects', async () => {
    setClipboard(vi.fn(() => Promise.reject(new Error('denied'))));
    render(<CodeBlock lang="sh">npm i</CodeBlock>);
    fireEvent.click(screen.getByRole('button', { name: /Copy/ }));
    await flush();
    expect(screen.queryByText('Copied')).toBeNull();
    expect(screen.getByRole('button', { name: 'Copy failed' })).toBeTruthy();
  });
  it('shows a failure when there is no clipboard API', async () => {
    setClipboard(undefined);
    render(<CodeBlock lang="sh">npm i</CodeBlock>);
    fireEvent.click(screen.getByRole('button', { name: /Copy/ }));
    await flush();
    expect(screen.getByRole('button', { name: 'Copy failed' })).toBeTruthy();
  });
  it('restarts the reset timer on a repeat click and clears it on unmount', async () => {
    vi.useFakeTimers();
    setClipboard(vi.fn(() => Promise.resolve()));
    const clear = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount } = render(<CodeBlock lang="sh">npm i</CodeBlock>);
    const btn = screen.getByRole('button', { name: /Copy/ });
    fireEvent.click(btn); await flush();
    act(() => { vi.advanceTimersByTime(1000); });
    fireEvent.click(btn); await flush();
    act(() => { vi.advanceTimersByTime(1000); });
    // 2s after the first click, 1s after the second: still showing Copied
    expect(screen.getByText('Copied')).toBeTruthy();
    const before = clear.mock.calls.length;
    unmount();
    expect(clear.mock.calls.length).toBeGreaterThan(before);
  });
});

describe('CopyField copy result', () => {
  it('reports success only after the write resolves', async () => {
    setClipboard(vi.fn(() => Promise.resolve()));
    render(<CopyField value="abc" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await flush();
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Copied to clipboard');
  });
  it('reports a failure when the write rejects', async () => {
    setClipboard(vi.fn(() => Promise.reject(new Error('denied'))));
    render(<CopyField value="abc" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await flush();
    expect(screen.getByRole('button', { name: 'Copy failed' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Copy failed');
  });
});
