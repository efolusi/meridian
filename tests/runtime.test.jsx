import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Toaster, toast } from '../components/feedback/Toast.jsx';
import { Input } from '../components/forms/Input.jsx';
import { Checkbox } from '../components/forms/Checkbox.jsx';
import { Table } from '../components/data/Table.jsx';
import { Button } from '../components/forms/Button.jsx';

describe('Toaster', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { act(() => toast.dismiss()); vi.useRealTimers(); });

  function Fire({ options }) {
    return <button onClick={() => (toast[options.tone] || toast)(options.title, options)}>fire</button>;
  }
  const fire = () => act(() => { screen.getByText('fire').click(); });

  it('queues a toast and auto-dismisses it', () => {
    render(<Toaster duration={1000}><Fire options={{ title: 'Saved' }} /></Toaster>);
    fire();
    expect(screen.getByText('Saved')).toBeTruthy();
    act(() => { vi.advanceTimersByTime(1200); });
    expect(screen.queryByText('Saved')).toBeNull();
  });

  it('supports persistent actionable notifications', () => {
    render(<Toaster duration={500}><Fire options={{ title: 'Undo?', action: { label: 'Undo', onClick() {} }, duration: 0 }} /></Toaster>);
    fire();
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText('Undo?')).toBeTruthy();
  });

  it('honours a per-call duration override', () => {
    render(<Toaster duration={10000}><Fire options={{ title: 'Quick', duration: 300 }} /></Toaster>);
    fire();
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.queryByText('Quick')).toBeNull();
  });

  it('defaults to info rather than success', () => {
    render(<Toaster><Fire options={{ title: 'Note' }} /></Toaster>);
    fire();
    const toast = screen.getByText('Note').closest('.ef-toast');
    expect(toast.className).toContain('ef-toast--info');
    expect(toast.className).not.toContain('ef-toast--success');
  });

  it('puts one live region on the stack, not on each toast', () => {
    render(<Toaster><Fire options={{ title: 'A' }} /></Toaster>);
    fire(); fire();
    const stack = document.querySelector('.ef-toast-stack');
    expect(stack.getAttribute('aria-live')).toBe('polite');
    document.querySelectorAll('.ef-toast').forEach(t => {
      expect(t.getAttribute('role')).toBeNull();
    });
  });

  it('allows producers outside the renderer tree', () => {
    act(() => toast.info('Queued before mount', { duration: 0 }));
    render(<Toaster />);
    expect(screen.getByText('Queued before mount')).toBeTruthy();
  });
});

describe('Table', () => {
  const rows = [
    { id: 1, name: 'Cardinal', mrr: '$300' },
    { id: 2, name: 'Acme', mrr: '$1,240' },
    { id: 3, name: 'Bloom', mrr: '$80' },
  ];
  const columns = [
    { key: 'name', label: 'Customer', sortable: true },
    { key: 'mrr', label: 'MRR', sortable: true, sortAccessor: r => Number(String(r.mrr).replace(/[^0-9.]/g, '')) },
  ];
  const names = () => [...document.querySelectorAll('tbody tr')].map(r => r.children[0].textContent);

  it('sorts, toggles direction, and reports aria-sort', async () => {
    const user = userEvent.setup();
    render(<Table rowKey="id" columns={columns} rows={rows} />);
    await user.click(screen.getByRole('button', { name: /Customer/ }));
    expect(names()).toEqual(['Acme', 'Bloom', 'Cardinal']);
    expect(screen.getAllByRole('columnheader')[0].getAttribute('aria-sort')).toBe('ascending');
    await user.click(screen.getByRole('button', { name: /Customer/ }));
    expect(names()).toEqual(['Cardinal', 'Bloom', 'Acme']);
    expect(screen.getAllByRole('columnheader')[0].getAttribute('aria-sort')).toBe('descending');
  });

  it('sorts by sortAccessor, not by the rendered string', async () => {
    const user = userEvent.setup();
    render(<Table rowKey="id" columns={columns} rows={rows} />);
    await user.click(screen.getByRole('button', { name: /MRR/ }));
    const mrr = [...document.querySelectorAll('tbody tr')].map(r => r.children[1].textContent);
    expect(mrr).toEqual(['$80', '$300', '$1,240']); // lexical order would be $1,240 first
  });

  it('select-all goes indeterminate for a partial selection', async () => {
    const user = userEvent.setup();
    render(<Table rowKey="id" columns={columns} rows={rows} selectable />);
    const boxes = screen.getAllByRole('checkbox');
    await user.click(boxes[1]);
    expect(boxes[0].getAttribute('aria-checked')).toBe('mixed');
    expect(boxes[0].dataset.state).toBe('indeterminate');
    await user.click(boxes[0]);
    expect(boxes[0].getAttribute('aria-checked')).toBe('true');
  });

  it('shows the empty message instead of a bare header', () => {
    render(<Table rowKey="id" columns={columns} rows={[]} empty="No customers yet." />);
    expect(screen.getByText('No customers yet.')).toBeTruthy();
  });
});
