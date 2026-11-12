// Regression tests for defects found in the 2026-11-12 dates review.
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from '../components/dates/Calendar.jsx';
import { TimePicker } from '../components/dates/TimePicker.jsx';

const tabbable = () => [...document.querySelectorAll('[role="gridcell"]')].filter(cell => cell.tabIndex === 0);

describe('Calendar focus', () => {
  it('does not take focus when it mounts', () => {
    render(<Calendar mode="single" selected={new Date(2026, 6, 16)} onSelect={() => {}} />);
    expect(document.activeElement).toBe(document.body);
  });

  it('keeps exactly one tabbable day when the shown month holds neither selection nor today', () => {
    render(<Calendar mode="single" defaultMonth={new Date(2019, 2, 1)} />);
    expect(tabbable()).toHaveLength(1);
    expect(tabbable()[0].getAttribute('data-key')).toBe('2019-03-01');
  });

  it('keeps a tabbable day after paging with the month buttons', () => {
    render(<Calendar mode="single" selected={new Date(2026, 6, 16)} onSelect={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(tabbable()).toHaveLength(1);
    expect(tabbable()[0].getAttribute('data-key')).toBe('2026-08-01');
  });

  it('never makes a disabled day the tab stop', () => {
    render(<Calendar mode="single" defaultMonth={new Date(2026, 7, 1)} disabled={{ dayOfWeek: [6] }} />);
    // 1 Aug 2026 is a Saturday.
    expect(tabbable()).toHaveLength(1);
    expect(tabbable()[0].getAttribute('data-key')).toBe('2026-08-02');
  });

  it('moves focus by keyboard inside the second visible month', async () => {
    const user = userEvent.setup();
    const months = vi.fn();
    render(<Calendar mode="single" defaultMonth={new Date(2026, 6, 1)} numberOfMonths={2} selected={new Date(2026, 7, 12)} onSelect={() => {}} onMonthChange={months} />);
    const start = document.querySelector('[data-key="2026-08-12"]:not([data-outside="true"])');
    start.focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement.getAttribute('data-key')).toBe('2026-08-13');
    expect(months).not.toHaveBeenCalled();
  });

  it('skips over disabled days when moving with arrows', async () => {
    const user = userEvent.setup();
    render(<Calendar mode="single" selected={new Date(2026, 6, 16)} disabled={new Date(2026, 6, 17)} onSelect={() => {}} />);
    screen.getByRole('gridcell', { name: 'July 16, 2026' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement.getAttribute('data-key')).toBe('2026-07-18');
  });
});

describe('Calendar range with clock times', () => {
  it('does not paint the end day as a middle day when the range carries times', () => {
    render(<Calendar mode="range" selected={{ from: new Date(2026, 6, 14, 15), to: new Date(2026, 6, 17, 15) }} />);
    const end = document.querySelector('[data-key="2026-07-17"]:not([data-outside="true"])');
    expect(end.getAttribute('data-range-end')).toBe('true');
    expect(end.hasAttribute('data-range-middle')).toBe(false);
    const start = document.querySelector('[data-key="2026-07-14"]:not([data-outside="true"])');
    expect(start.hasAttribute('data-range-middle')).toBe(false);
  });
});

describe('TimePicker labelling', () => {
  it('names the input after its label and describes it with the hint', () => {
    render(<TimePicker label="Starts at" hint="Local time." value={null} onChange={() => {}} />);
    const input = screen.getByRole('combobox', { name: 'Starts at' });
    expect(document.getElementById(input.getAttribute('aria-describedby')).textContent).toBe('Local time.');
  });

  it('sends aria-label to the input, not the wrapper', () => {
    render(<TimePicker aria-label="Reminder" value={null} onChange={() => {}} />);
    expect(screen.getByRole('combobox', { name: 'Reminder' }).tagName).toBe('INPUT');
  });

  it('keeps a caller id on the input only', () => {
    render(<><label htmlFor="start">Start</label><TimePicker id="start" value={null} onChange={() => {}} /></>);
    expect(document.querySelectorAll('#start')).toHaveLength(1);
    expect(screen.getByRole('combobox', { name: 'Start' })).toBeTruthy();
  });

  it('ignores Enter while an IME composition is in progress', () => {
    const change = vi.fn();
    render(<TimePicker aria-label="Reminder" value={null} onChange={change} />);
    const input = screen.getByRole('combobox', { name: 'Reminder' });
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(change).not.toHaveBeenCalled();
  });
});
