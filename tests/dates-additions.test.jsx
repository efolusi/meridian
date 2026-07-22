import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Calendar } from '../components/dates/Calendar.jsx';
import { DateRangePicker } from '../components/dates/DateRangePicker.jsx';
import { TimePicker } from '../components/dates/TimePicker.jsx';

// The date-time additions: Calendar range mode, DateRangePicker, TimePicker.
// Single-date Calendar behaviour is covered by keyboard.test.jsx and
// keyboard-datepicker.test.jsx, which must keep passing untouched.

function RangeCalHarness({ spy, initial }) {
  const [r, setR] = React.useState(initial || { from: null, to: null });
  return <Calendar range value={r} onChange={x => { setR(x); spy(x); }} />;
}

describe('Calendar range mode', () => {
  it('builds a range over two picks and swaps when the second lands earlier', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<RangeCalHarness spy={spy} />);
    const cells = [...screen.getByRole('grid').querySelectorAll('[data-iso]')];
    const a = cells[15].getAttribute('data-iso');
    const b = cells[10].getAttribute('data-iso'); // earlier than a
    await user.click(cells[15]);
    expect(spy).toHaveBeenLastCalledWith({ from: a, to: null });
    await user.click(cells[10]);
    expect(spy).toHaveBeenLastCalledWith({ from: b, to: a });
  });

  it('starts a fresh range on the third pick', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<RangeCalHarness spy={spy} initial={{ from: '2026-07-14', to: '2026-07-17' }} />);
    const grid = screen.getByRole('grid');
    await user.click(grid.querySelector('[data-iso="2026-07-21"]'));
    expect(spy).toHaveBeenLastCalledWith({ from: '2026-07-21', to: null });
  });

  it('marks both ends selected and paints the days between as a band', () => {
    render(<Calendar range value={{ from: '2026-07-14', to: '2026-07-17' }} />);
    const grid = screen.getByRole('grid');
    const day = d => grid.querySelector(`[data-iso="${d}"]`);
    expect(day('2026-07-14').getAttribute('aria-selected')).toBe('true');
    expect(day('2026-07-17').getAttribute('aria-selected')).toBe('true');
    expect(day('2026-07-14').className).toContain('ef-cal__day--sel');
    expect(day('2026-07-15').className).toContain('ef-cal__day--band');
    expect(day('2026-07-15').getAttribute('aria-selected')).toBe('false');
    expect(day('2026-07-13').className).not.toContain('ef-cal__day--band');
  });

  it('without the range prop still fires a plain ISO string', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Calendar value="2026-07-16" onChange={spy} />);
    await user.click(screen.getByRole('gridcell', { name: '17 July 2026' }));
    expect(spy).toHaveBeenCalledWith('2026-07-17');
  });
});

function RangePickerHarness({ spy, initial }) {
  const [r, setR] = React.useState(initial);
  return <DateRangePicker label="Stay" value={r} onChange={x => { setR(x); if (spy) spy(x); }} />;
}

describe('DateRangePicker', () => {
  it('opens focused on the open end, completes the range, closes and returns focus', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<RangePickerHarness spy={spy} initial={{ from: '2026-07-10', to: null }} />);
    const trigger = screen.getByRole('button', { name: /Jul 10, 2026/ });
    await user.click(trigger);
    await screen.findByRole('grid');
    expect(document.activeElement.getAttribute('data-iso')).toBe('2026-07-10');
    await user.click(screen.getByRole('gridcell', { name: '15 July 2026' }));
    expect(spy).toHaveBeenLastCalledWith({ from: '2026-07-10', to: '2026-07-15' });
    expect(screen.queryByRole('grid')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.textContent).toContain('Jul 10, 2026 — Jul 15, 2026');
  });

  it('Escape closes without selecting and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<DateRangePicker label="Stay" onChange={spy} />);
    const trigger = screen.getByRole('button', { name: /Pick a date range/ });
    await user.click(trigger);
    await screen.findByRole('grid');
    await user.keyboard('{Escape}');
    expect(spy).not.toHaveBeenCalled();
    expect(screen.queryByRole('grid')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('clears an existing range with the inline clear button', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<RangePickerHarness spy={spy} initial={{ from: '2026-07-10', to: '2026-07-15' }} />);
    await user.click(screen.getByRole('button', { name: 'Clear date range' }));
    expect(spy).toHaveBeenCalledWith({ from: null, to: null });
    expect(screen.getByRole('button', { name: /Pick a date range/ })).toBeTruthy();
  });
});

describe('TimePicker', () => {
  it('lists every stepMinutes slot between minTime and maxTime', async () => {
    const user = userEvent.setup();
    render(<TimePicker label="Starts at" value={null} onChange={() => {}} minTime="09:00" maxTime="11:00" />);
    await user.click(screen.getByRole('combobox'));
    const opts = await screen.findAllByRole('option');
    expect(opts.map(o => o.textContent)).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00']);
  });

  it('moves the highlight with arrows via aria-activedescendant and picks with Enter', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<TimePicker label="Starts at" value={null} onChange={spy} minTime="09:00" maxTime="11:00" />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}');
    const opts = screen.getAllByRole('option');
    expect(input.getAttribute('aria-activedescendant')).toBe(opts[1].id);
    await user.keyboard('{Enter}');
    expect(spy).toHaveBeenCalledWith('09:30');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('typing filters the list and Enter picks the remaining slot', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<TimePicker label="Starts at" value={null} onChange={spy} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, '10:3');
    const opts = screen.getAllByRole('option');
    expect(opts).toHaveLength(1);
    expect(opts[0].textContent).toBe('10:30');
    await user.keyboard('{Enter}');
    expect(spy).toHaveBeenCalledWith('10:30');
  });

  it("commits a typed valid time on blur even when it is not a listed slot ('9:5' -> '09:05')", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<TimePicker label="Starts at" value={null} onChange={spy} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, '9:5');
    await user.tab();
    expect(spy).toHaveBeenCalledWith('09:05');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('format24 false shows 12h labels but keeps the value 24h', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<TimePicker label="Starts at" format24={false} value="13:00" onChange={spy} />);
    const input = screen.getByRole('combobox');
    expect(input.value).toBe('1:00 PM');
    await user.click(input);
    await user.click(await screen.findByRole('option', { name: '2:30 PM' }));
    expect(spy).toHaveBeenCalledWith('14:30');
  });
});
