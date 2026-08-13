import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '../components/forms/Input.jsx';

describe('Input compatibility contract', () => {
  it('renders a button-like file picker and mirrors the selected filename', () => {
    render(<Input type="file" aria-label="Upload receipt" />);
    const input = screen.getByLabelText('Upload receipt');
    expect(screen.getByText('Choose file')).toBeTruthy();
    expect(screen.getByText('No file chosen')).toBeTruthy();
    fireEvent.change(input, { target: { files: [new File(['receipt'], 'receipt.pdf', { type: 'application/pdf' })] } });
    expect(screen.getByText('receipt.pdf')).toBeTruthy();
  });
  it('forwards native props, events, classes, styles, and its ref', () => {
    const ref = React.createRef();
    const change = vi.fn();
    render(
      <Input
        ref={ref}
        aria-label="Username"
        name="username"
        placeholder="ada"
        className="consumer-input"
        style={{ maxWidth: 240 }}
        onChange={change}
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Username' });
    fireEvent.change(input, { target: { value: 'ada-obi' } });
    expect(ref.current).toBe(input);
    expect(input.dataset.slot).toBe('input');
    expect(input.name).toBe('username');
    expect(input.classList.contains('consumer-input')).toBe(true);
    expect(input.style.maxWidth).toBe('240px');
    expect(change).toHaveBeenCalledOnce();
  });

  it('supports native file, required, disabled, and numeric size attributes', () => {
    render(<Input type="file" aria-label="Receipt" required disabled size={24} />);
    const input = screen.getByLabelText('Receipt');
    expect(input.type).toBe('file');
    expect(input.required).toBe(true);
    expect(input.disabled).toBe(true);
    expect(input.size).toBe(24);
  });

  it('associates integrated label and description with the native input', () => {
    render(<Input label="Work email" hint="Used for alerts" />);
    const input = screen.getByRole('textbox', { name: 'Work email' });
    expect(input.getAttribute('aria-describedby')).toBe(screen.getByText('Used for alerts').id);
  });

  it('announces integrated errors and exposes invalid state', () => {
    render(<Input label="Slug" error="Use lowercase letters" />);
    const input = screen.getByRole('textbox', { name: 'Slug' });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(screen.getByRole('alert').id);
  });

  it('keeps password reveal and visual sizes additive', async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Password" type="password" revealable size="lg" defaultValue="secret" />);
    const input = screen.getByLabelText('Password');
    expect(input.type).toBe('password');
    expect(input.classList.contains('ef-input__el--lg')).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input.type).toBe('text');
    expect(screen.getByRole('button', { name: 'Hide password' }).getAttribute('aria-pressed')).toBe('true');
  });
});
