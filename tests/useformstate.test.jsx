import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { FormField, useFormState } from '../components/forms/FormField.jsx';

// The validation timing guidelines/forms.md prescribes: errors surface on
// blur (touch) or a submit attempt, never on first keystroke, and clear the
// moment the value is fixed.

const validate = v => (v.email.includes('@') ? {} : { email: 'Enter a valid email.' });

describe('useFormState', () => {
  it('is published as FormField.useFormState', () => {
    expect(FormField.useFormState).toBe(useFormState);
  });

  it('surfaces a field error only after blur, and clears it on change', () => {
    const { result } = renderHook(() => useFormState({ initial: { email: '' }, validate }));
    // invalid from the start, but not surfaced: the field is untouched
    expect(result.current.errors.email).toBe('Enter a valid email.');
    expect(result.current.field('email').error).toBeUndefined();
    expect(result.current.field('email').invalid).toBe(false);
    act(() => result.current.field('email').onBlur());
    expect(result.current.field('email').error).toBe('Enter a valid email.');
    expect(result.current.touched.email).toBe(true);
    // fixing the value clears the surfaced error immediately
    act(() => result.current.field('email').onChange('ada@efolusi.com'));
    expect(result.current.values.email).toBe('ada@efolusi.com');
    expect(result.current.field('email').error).toBeUndefined();
    // onChange also accepts a change event
    act(() => result.current.field('email').onChange({ target: { value: 'nope', type: 'text' } }));
    expect(result.current.values.email).toBe('nope');
  });

  it('handleSubmit blocks an invalid form and marks every field touched', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useFormState({ initial: { email: '' }, validate }));
    const preventDefault = vi.fn();
    act(() => { result.current.handleSubmit(fn)({ preventDefault }); });
    expect(preventDefault).toHaveBeenCalled();
    expect(fn).not.toHaveBeenCalled();
    expect(result.current.touched.email).toBe(true);
    expect(result.current.field('email').error).toBe('Enter a valid email.');
  });

  it('handleSubmit calls fn(values) when clean and holds submitting across an async fn', async () => {
    let resolve;
    const pending = new Promise(r => { resolve = r; });
    const fn = vi.fn(() => pending);
    const { result } = renderHook(() => useFormState({ initial: { email: 'ada@efolusi.com' }, validate }));
    act(() => { result.current.handleSubmit(fn)(); });
    expect(fn).toHaveBeenCalledWith({ email: 'ada@efolusi.com' });
    expect(result.current.submitting).toBe(true);
    await act(async () => { resolve(); await pending; });
    expect(result.current.submitting).toBe(false);
  });

  it('reset returns to initial, untouched', () => {
    const { result } = renderHook(() => useFormState({ initial: { email: '' }, validate }));
    act(() => {
      result.current.set('email', 'x');
      result.current.field('email').onBlur();
    });
    expect(result.current.values.email).toBe('x');
    act(() => result.current.reset());
    expect(result.current.values.email).toBe('');
    expect(result.current.touched).toEqual({});
    expect(result.current.field('email').error).toBeUndefined();
  });
});
