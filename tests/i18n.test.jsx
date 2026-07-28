import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberInput } from '../components/forms/NumberInput.jsx';

// First i18n slice: locale-aware number formatting and parsing. The default
// (no locale) stays plain and unchanged; locale is purely additive.
describe('NumberInput locale (i18n)', () => {
  it('formats the committed value with en grouping', () => {
    render(<NumberInput aria-label="n" locale="en" value={1234.5} onChange={() => {}} />);
    expect(screen.getByLabelText('n').value).toBe('1,234.5');
  });

  it('formats with id separators (dot groups, comma decimal)', () => {
    render(<NumberInput aria-label="n" locale="id" value={1234.5} onChange={() => {}} />);
    expect(screen.getByLabelText('n').value).toBe('1.234,5');
  });

  it('parses locale-formatted text back to a number on commit', async () => {
    const onChange = vi.fn();
    render(<NumberInput aria-label="n" locale="id" step={0.01} onChange={onChange} />);
    const el = screen.getByLabelText('n');
    await userEvent.type(el, '2.500,25');
    el.blur();
    expect(onChange).toHaveBeenCalledWith(2500.25, expect.anything());
  });

  it('no locale keeps plain, ungrouped formatting (unchanged default)', () => {
    render(<NumberInput aria-label="n" value={1234.5} onChange={() => {}} />);
    expect(screen.getByLabelText('n').value).toBe('1234.5');
  });

  it('an explicit format wins over locale', () => {
    render(<NumberInput aria-label="n" locale="id" format={n => n + ' rb'} value={5} onChange={() => {}} />);
    expect(screen.getByLabelText('n').value).toBe('5 rb');
  });
});
