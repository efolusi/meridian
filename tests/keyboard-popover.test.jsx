import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Popover } from '../components/overlay/Popover.jsx';
import { Button } from '../components/forms/Button.jsx';

// guidelines/accessibility.md: "Menu, Popover: triggers are keyboard-operable
// with aria-haspopup/aria-expanded" and "Esc — closes ... Popover" restoring
// the trigger. The panel is a plain portaled div, so it is queried by content.

describe('Popover', () => {
  function Harness() {
    return (
      <Popover trigger={<Button>Filters</Button>}>
        <p>Panel body</p>
        <Button>Apply</Button>
      </Popover>
    );
  }

  it('advertises the popup on the trigger via aria-haspopup and aria-expanded', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Filters' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await user.click(trigger);
    expect(screen.getByText('Panel body')).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('opens from the keyboard with Enter', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Filters' }));
    await user.keyboard('{Enter}');
    expect(screen.getByText('Panel body')).toBeTruthy();
  });

  it('toggles with Space', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.tab();
    await user.keyboard(' ');
    expect(screen.getByText('Panel body')).toBeTruthy();
    await user.keyboard(' ');
    expect(screen.queryByText('Panel body')).toBeNull();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Filters' });
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByText('Panel body')).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByText('Panel body')).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('returns focus to the trigger even when Escape is pressed inside the panel', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Filters' });
    await user.click(trigger);
    const inner = screen.getByRole('button', { name: 'Apply' });
    await user.click(inner);
    expect(document.activeElement).toBe(inner);
    await user.keyboard('{Escape}');
    expect(screen.queryByText('Panel body')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
