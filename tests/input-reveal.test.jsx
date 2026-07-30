import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Input } from '../components/forms/Input.jsx';

describe('Input revealable', () => {
  it('shows and hides the password, and says which it will do', async () => {
    render(<Input label="Password" type="password" revealable defaultValue="hunter2" />);
    const field = screen.getByLabelText('Password');
    expect(field.type, 'starts hidden').toBe('password');

    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    await userEvent.click(toggle);

    expect(screen.getByLabelText('Password').type, 'revealed on request').toBe('text');
    const pressed = screen.getByRole('button', { name: 'Hide password' });
    expect(pressed.getAttribute('aria-pressed')).toBe('true');

    await userEvent.click(pressed);
    expect(screen.getByLabelText('Password').type, 'and hidden again').toBe('password');
  });

  it('adds nothing to fields that are not passwords', () => {
    render(<Input label="Email" type="email" revealable />);
    expect(screen.queryByRole('button', { name: /password/i })).toBeNull();
  });
});
