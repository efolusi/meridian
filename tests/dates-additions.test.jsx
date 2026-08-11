import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Calendar } from '../components/dates/Calendar.jsx';
import { TimePicker } from '../components/dates/TimePicker.jsx';

function RangeCalHarness({ spy, initial }) {
  const [r, setR] = React.useState(initial);
  return <Calendar mode="range" defaultMonth={new Date(2026, 6, 1)} selected={r} onSelect={x => { setR(x); spy(x); }} />;
}

describe('Calendar range mode', () => {
  it('builds a range over two picks and swaps when the second lands earlier', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<RangeCalHarness spy={spy} />);
    await user.click(screen.getByRole('gridcell', { name: 'July 16, 2026' }));
    expect(spy.mock.calls.at(-1)[0].from.getDate()).toBe(16);
    expect(spy.mock.calls.at(-1)[0].to).toBeUndefined();
    await user.click(screen.getByRole('gridcell', { name: 'July 11, 2026' }));
    expect(spy.mock.calls.at(-1)[0].from.getDate()).toBe(11);
    expect(spy.mock.calls.at(-1)[0].to.getDate()).toBe(16);
  });

  it('starts a fresh range on the third pick', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<RangeCalHarness spy={spy} initial={{ from: new Date(2026, 6, 14), to: new Date(2026, 6, 17) }} />);
    await user.click(screen.getByRole('gridcell', { name: 'July 21, 2026' }));
    expect(spy.mock.calls.at(-1)[0].from.getDate()).toBe(21);
    expect(spy.mock.calls.at(-1)[0].to).toBeUndefined();
  });

  it('marks both ends selected and paints the days between as a band', () => {
    render(<Calendar mode="range" selected={{ from: new Date(2026, 6, 14), to: new Date(2026, 6, 17) }} />);
    expect(screen.getByRole('gridcell', { name: 'July 14, 2026' }).getAttribute('data-range-start')).toBe('true');
    expect(screen.getByRole('gridcell', { name: 'July 15, 2026' }).getAttribute('data-range-middle')).toBe('true');
    expect(screen.getByRole('gridcell', { name: 'July 17, 2026' }).getAttribute('data-range-end')).toBe('true');
  });

  it('single mode fires a Date', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Calendar mode="single" selected={new Date(2026, 6, 16)} onSelect={spy} />);
    await user.click(screen.getByRole('gridcell', { name: 'July 17, 2026' }));
    expect(spy.mock.calls[0][0]).toEqual(new Date(2026, 6, 17));
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
