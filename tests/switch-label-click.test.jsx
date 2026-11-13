// A Switch label click must toggle once, whether the label is the Switch's own
// sibling span or the Switch also sits inside a native <label> (FieldLabel).
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Switch } from '../components/forms/Switch.jsx';
import { FieldLabel } from '../components/forms/Field.jsx';

describe('Switch label click', () => {
  it('toggles once from its own label', () => {
    const change = vi.fn();
    render(<Switch label="Digest" onCheckedChange={change} />);
    fireEvent.click(screen.getByText('Digest'));
    expect(change).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
  });

  it('toggles once inside a wrapping native label', () => {
    const change = vi.fn();
    render(<label><Switch label="Digest" onCheckedChange={change} /></label>);
    fireEvent.click(screen.getByText('Digest'));
    expect(change).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
  });

  it('toggles once inside FieldLabel', () => {
    const change = vi.fn();
    render(<FieldLabel><Switch label="Digest" onCheckedChange={change} /></FieldLabel>);
    fireEvent.click(screen.getByText('Digest'));
    expect(change).toHaveBeenCalledTimes(1);
  });

  it('still toggles when the wrapping label text outside the Switch is clicked', () => {
    const change = vi.fn();
    render(<label><span>Weekly</span><Switch onCheckedChange={change} aria-label="Weekly digest" /></label>);
    fireEvent.click(screen.getByText('Weekly'));
    expect(change).toHaveBeenCalledTimes(1);
  });
});
