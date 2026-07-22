import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DatePicker } from '../components/dates/DatePicker.jsx';

// 2026-07-16 is a Thursday; its Monday-start week runs 07-13..07-19.
// PageUp/PageDown is documented but not tested here: it currently drops focus
// to <body> (view changes, focusIso does not) — reported as a component bug.

describe('DatePicker', () => {
  async function openPicker(user) {
    const trigger = screen.getByRole('button', { name: /Jul 16, 2026/ });
    await user.click(trigger);
    const grid = await screen.findByRole('grid');
    return { trigger, grid };
  }

  it('opens into a role=grid calendar, focusing the selected day', async () => {
    const user = userEvent.setup();
    render(<DatePicker value="2026-07-16" onChange={() => {}} />);
    const { grid } = await openPicker(user);
    const day = within(grid).getByRole('gridcell', { name: '16 July 2026' });
    expect(document.activeElement).toBe(day);
    expect(day.getAttribute('aria-selected')).toBe('true');
  });

  it('moves a day with ArrowLeft/Right and a week with ArrowUp/Down', async () => {
    const user = userEvent.setup();
    render(<DatePicker value="2026-07-16" onChange={() => {}} />);
    await openPicker(user);
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement.getAttribute('data-iso')).toBe('2026-07-17');
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement.getAttribute('data-iso')).toBe('2026-07-24');
    await user.keyboard('{ArrowUp}{ArrowLeft}');
    expect(document.activeElement.getAttribute('data-iso')).toBe('2026-07-16');
  });

  it('Home/End jump to the week edges', async () => {
    const user = userEvent.setup();
    render(<DatePicker value="2026-07-16" onChange={() => {}} />);
    await openPicker(user);
    await user.keyboard('{Home}');
    expect(document.activeElement.getAttribute('data-iso')).toBe('2026-07-13');
    await user.keyboard('{End}');
    expect(document.activeElement.getAttribute('data-iso')).toBe('2026-07-19');
  });

  it('selects the focused day with Enter, closes, and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value="2026-07-16" onChange={onChange} />);
    const { trigger } = await openPicker(user);
    await user.keyboard('{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenCalledWith('2026-07-17');
    expect(screen.queryByRole('grid')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('Escape closes without selecting and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value="2026-07-16" onChange={onChange} />);
    const { trigger } = await openPicker(user);
    await user.keyboard('{Escape}');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('grid')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
