import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from '../components/forms/Field.jsx';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '../components/forms/Select.jsx';

describe('Field compatibility', () => {
  it('renders the complete composition with semantic fieldset and error', () => {
    render(<FieldSet><FieldLegend>Profile</FieldLegend><FieldDescription>Public details.</FieldDescription><FieldGroup><Field data-invalid="true"><FieldContent><FieldTitle>Email</FieldTitle><FieldLabel htmlFor="email">Address</FieldLabel></FieldContent><input id="email" aria-invalid="true" /><FieldError errors={[{ message: 'Required.' }]} /></Field><FieldSeparator>Or</FieldSeparator></FieldGroup></FieldSet>);
    const field = document.querySelector('[data-slot="field"]');
    expect(field.getAttribute('data-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toContain('Required.');
    expect(field.closest('fieldset')).toBeTruthy();
  });
});

describe('Select compatibility', () => {
  it('opens by keyboard, selects a value, and reports controlled changes', () => {
    const change = vi.fn();
    render(<Select defaultValue="apple" onValueChange={change}><SelectTrigger aria-label="Fruit"><SelectValue placeholder="Choose" /></SelectTrigger><SelectContent><SelectGroup><SelectLabel>Fruit</SelectLabel><SelectItem value="apple">Apple</SelectItem><SelectSeparator /><SelectItem value="banana">Banana</SelectItem></SelectGroup></SelectContent></Select>);
    const trigger = screen.getByRole('combobox');
    expect(trigger.textContent).toContain('Apple');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.click(screen.getByRole('option', { name: 'Banana' }));
    expect(change).toHaveBeenCalledWith('banana');
    expect(trigger.textContent).toContain('Banana');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('supports controlled value and disabled items', () => {
    const change = vi.fn();
    render(<Select value="one" onValueChange={change}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="one">One</SelectItem><SelectItem value="two" disabled>Two</SelectItem></SelectContent></Select>);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Two' }));
    expect(change).not.toHaveBeenCalled();
  });

  it('uses logical direction-safe positioning and supports typeahead', () => {
    document.documentElement.dir = 'rtl';
    render(<Select><SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger><SelectContent><SelectItem value="apple">Apple</SelectItem><SelectItem value="banana">Banana</SelectItem></SelectContent></Select>);
    fireEvent.click(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    fireEvent.keyDown(listbox, { key: 'b' });
    expect(document.activeElement.textContent).toContain('Banana');
    document.documentElement.removeAttribute('dir');
  });
});
