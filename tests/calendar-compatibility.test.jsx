import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Calendar, CalendarDayButton } from '../components/dates/Calendar.jsx';
import { Button } from '../components/forms/Button.jsx';
import { Popover, PopoverContent, PopoverTrigger } from '../components/overlay/Popover.jsx';

describe('Calendar compatibility contract', () => {
  it('supports single Date selection and optional deselection', () => {
    const select = vi.fn();
    render(<Calendar mode="single" selected={new Date(2026, 6, 16)} onSelect={select} />);
    fireEvent.click(screen.getByRole('gridcell', { name: 'July 17, 2026' }));
    expect(select.mock.calls[0][0]).toEqual(new Date(2026, 6, 17));
    fireEvent.click(screen.getByRole('gridcell', { name: 'July 16, 2026' }));
    expect(select.mock.calls[1][0]).toBeUndefined();
  });

  it('supports multiple mode, disabled matchers, and required selection', () => {
    const select = vi.fn();
    const picked = [new Date(2026, 6, 16)];
    render(<Calendar mode="multiple" selected={picked} required disabled={{ dayOfWeek: [0, 6] }} onSelect={select} />);
    expect(screen.getByRole('gridcell', { name: 'July 18, 2026' }).disabled).toBe(true);
    fireEvent.click(screen.getByRole('gridcell', { name: 'July 16, 2026' }));
    expect(select.mock.calls[0][0]).toEqual(picked);
    fireEvent.click(screen.getByRole('gridcell', { name: 'July 17, 2026' }));
    expect(select.mock.calls[1][0]).toHaveLength(2);
  });

  it('renders month/year dropdowns within bounded years', () => {
    const change = vi.fn();
    render(<Calendar captionLayout="dropdown" month={new Date(2026, 6, 1)} startMonth={new Date(2024, 0, 1)} endMonth={new Date(2028, 11, 1)} onMonthChange={change} />);
    expect(screen.getByRole('combobox', { name: 'Month' })).toBeTruthy();
    expect(screen.getByRole('combobox', { name: 'Year' }).querySelectorAll('option')).toHaveLength(5);
    fireEvent.change(screen.getByRole('combobox', { name: 'Year' }), { target: { value: '2027' } });
    expect(change.mock.calls[0][0]).toEqual(new Date(2027, 6, 1));
  });

  it('exports a customizable day button and supports multiple visible months', () => {
    const CustomDay = props => <CalendarDayButton {...props} data-custom-day="true" />;
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} numberOfMonths={2} components={{ DayButton: CustomDay }} />);
    expect(screen.getAllByRole('grid')).toHaveLength(2);
    expect(document.querySelectorAll('[data-custom-day="true"]').length).toBeGreaterThan(60);
  });
});

describe('Date picker composition', () => {
  it('builds the picker from Popover, Button, and Calendar without a picker root', () => {
    function ComposedPicker() {
      const [date, setDate] = React.useState();
      return <Popover><PopoverTrigger asChild><Button>Pick a date</Button></PopoverTrigger><PopoverContent><Calendar mode="single" defaultMonth={new Date(2026, 6, 1)} selected={date} onSelect={setDate} /></PopoverContent></Popover>;
    }
    render(<ComposedPicker />);
    fireEvent.click(screen.getByRole('button', { name: 'Pick a date' }));
    expect(screen.getByRole('grid')).toBeTruthy();
    fireEvent.click(screen.getByRole('gridcell', { name: 'July 17, 2026' }));
    expect(screen.getByRole('gridcell', { name: 'July 17, 2026' }).getAttribute('aria-selected')).toBe('true');
  });
});
