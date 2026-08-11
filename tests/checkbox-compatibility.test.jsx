import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../components/forms/Checkbox.jsx';

describe('Checkbox compatibility contract', () => {
  it('supports uncontrolled click and keyboard state changes', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const nativeChange = vi.fn();
    render(<Checkbox aria-label="Notifications" defaultChecked={false} onCheckedChange={change} onChange={nativeChange} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Notifications' });
    await user.click(checkbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
    expect(checkbox.dataset.state).toBe('checked');
    expect(change).toHaveBeenLastCalledWith(true);
    checkbox.focus();
    await user.keyboard(' ');
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    expect(change).toHaveBeenLastCalledWith(false);
    expect(nativeChange).toHaveBeenCalledTimes(2);
  });

  it('supports controlled and indeterminate states', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(<Checkbox checked="indeterminate" aria-label="Select all" onCheckedChange={change} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Select all' });
    expect(checkbox.getAttribute('aria-checked')).toBe('mixed');
    expect(checkbox.dataset.state).toBe('indeterminate');
    await user.click(checkbox);
    expect(change).toHaveBeenCalledWith(true);
    expect(checkbox.dataset.state).toBe('indeterminate');
    rerender(<Checkbox checked aria-label="Select all" onCheckedChange={change} />);
    expect(checkbox.dataset.state).toBe('checked');
  });

  it('forwards refs, native button props, classes, and invalid state', () => {
    const ref = React.createRef();
    render(<Checkbox ref={ref} aria-label="Terms" aria-invalid data-kind="legal" className="consumer-checkbox" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Terms' });
    expect(ref.current).toBe(checkbox);
    expect(checkbox.dataset.slot).toBe('checkbox');
    expect(checkbox.dataset.kind).toBe('legal');
    expect(checkbox.classList.contains('consumer-checkbox')).toBe(true);
    expect(checkbox.getAttribute('aria-invalid')).toBe('true');
  });

  it('keeps integrated label and description accessible and clickable', () => {
    render(<Checkbox label="Enable alerts" description="Notify workspace owners" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Enable alerts' });
    expect(checkbox.getAttribute('aria-describedby')).toBe(screen.getByText('Notify workspace owners').id);
    fireEvent.click(screen.getByText('Enable alerts'));
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
  });

  it('participates in native form submission and respects disabled', () => {
    render(
      <form data-testid="form">
        <Checkbox name="updates" value="email" defaultChecked aria-label="Updates" />
        <Checkbox name="locked" defaultChecked disabled aria-label="Locked" />
      </form>,
    );
    const data = new FormData(screen.getByTestId('form'));
    expect(data.get('updates')).toBe('email');
    expect(data.has('locked')).toBe(false);
    expect(screen.getByRole('checkbox', { name: 'Locked' }).disabled).toBe(true);
  });
});
