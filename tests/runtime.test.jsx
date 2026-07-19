import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Toaster } from '../components/feedback/Toast.jsx';
import { FormField } from '../components/forms/FormField.jsx';
import { Input } from '../components/forms/Input.jsx';
import { Checkbox } from '../components/forms/Checkbox.jsx';
import { Table } from '../components/data/Table.jsx';
import { Button } from '../components/forms/Button.jsx';

const useToast = Toaster.useToast;

describe('Toaster', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function Fire({ options }) {
    const { notify } = useToast();
    return <button onClick={() => notify(options)}>fire</button>;
  }
  const fire = () => act(() => { screen.getByText('fire').click(); });

  it('queues a toast and auto-dismisses it', () => {
    render(<Toaster duration={1000}><Fire options={{ title: 'Saved' }} /></Toaster>);
    fire();
    expect(screen.getByText('Saved')).toBeTruthy();
    act(() => { vi.advanceTimersByTime(1200); });
    expect(screen.queryByText('Saved')).toBeNull();
  });

  it('never auto-dismisses a toast carrying an action (WCAG 2.2.1)', () => {
    render(<Toaster duration={500}><Fire options={{ title: 'Undo?', actionLabel: 'Undo', onAction() {} }} /></Toaster>);
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

  it('throws when the hook is used outside a Toaster', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Fire options={{ title: 'x' }} />)).toThrow(/inside a <Toaster>/);
    quiet.mockRestore();
  });
});

describe('FormField', () => {
  it('links the label, hint and control', () => {
    render(<FormField label="Work email" hint="For receipts." required><Input /></FormField>);
    const input = document.querySelector('input');
    const label = document.querySelector('label.ef-field__label');
    const hint = document.querySelector('.ef-field__hint');
    expect(label.getAttribute('for')).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toBe(hint.id);
    expect(input.getAttribute('aria-required')).toBe('true');
  });

  it('lets error win over hint and marks the control invalid', () => {
    render(<FormField label="Plan" hint="Pick one." error="Required."><Input /></FormField>);
    const input = document.querySelector('input');
    expect(document.querySelector('.ef-field__hint')).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(document.querySelector('.ef-field__error').id);
  });

  it('labels a set with role=group and claims no single control id', () => {
    render(
      <FormField group label="Notify me about">
        <Checkbox label="Mentions" /><Checkbox label="Replies" />
      </FormField>
    );
    const group = document.querySelector('[role="group"]');
    expect(group.getAttribute('aria-labelledby')).toBe(document.querySelector('span.ef-field__label').id);
    const ids = [...document.querySelectorAll('input')].map(i => i.id).filter(Boolean);
    expect(ids).toHaveLength(0); // no child may claim the field id
  });

  it('hands wiring to a foreign control through the render prop', () => {
    render(<FormField label="Card" error="Bad card.">{({ controlProps }) => <input {...controlProps} />}</FormField>);
    const input = document.querySelector('input');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.id).toBeTruthy();
  });

  it('leaves a standalone Input untouched', () => {
    const { container } = render(<Input placeholder="bare" />);
    expect(container.querySelector('.ef-field')).toBeNull();
    expect(container.firstChild.className).toContain('ef-input');
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
    const boxes = document.querySelectorAll('input[type="checkbox"]');
    await user.click(boxes[1]);
    expect(boxes[0].indeterminate).toBe(true);
    await user.click(boxes[0]);
    expect(boxes[0].checked).toBe(true);
  });

  it('shows the empty message instead of a bare header', () => {
    render(<Table rowKey="id" columns={columns} rows={[]} empty="No customers yet." />);
    expect(screen.getByText('No customers yet.')).toBeTruthy();
  });
});
