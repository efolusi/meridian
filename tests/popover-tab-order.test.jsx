import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover, PopoverTrigger, PopoverContent } from '../components/overlay/Popover.jsx';

// The open panel is portaled to the end of <body>. Tab from the trigger used
// to go to the next control on the page, so a keyboard user who opened a
// Popover could not reach anything inside it without tabbing through the
// rest of the page first.
function Page() {
  return (
    <div>
      <button type="button">Before</button>
      <Popover><PopoverTrigger>Filters</PopoverTrigger><PopoverContent><input aria-label="Min price" /><button type="button">Apply</button></PopoverContent></Popover>
      <button type="button">After</button>
    </div>
  );
}

describe('Popover joins the Tab order after its trigger', () => {
  it('Tab enters the panel, Shift+Tab goes back to the trigger', async () => {
    const user = userEvent.setup();
    render(<Page />);
    const trigger = screen.getByRole('button', { name: 'Filters' });
    await user.click(trigger);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('Min price'));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(trigger);
  });

  it('Tab past the last stop continues after the trigger and closes the panel', async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    screen.getByRole('button', { name: 'Apply' }).focus();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

import { Dialog, DialogContent, DialogTitle } from '../components/feedback/Dialog.jsx';

describe('Popover inside a Dialog', () => {
  function Modal() {
    return (
      <Dialog open onOpenChange={() => {}}><DialogContent showCloseButton={false}><DialogTitle>Edit</DialogTitle>
        <button type="button">First</button>
        <Popover><PopoverTrigger>Filters</PopoverTrigger><PopoverContent><input aria-label="Min price" /><button type="button">Apply</button></PopoverContent></Popover>
      </DialogContent></Dialog>
    );
  }

  it('Tab moves through the panel without the dialog trap pulling focus back', async () => {
    const user = userEvent.setup();
    render(<Modal />);
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('Min price'));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Apply' }));
  });

  it('Tab out of the panel wraps inside the dialog', async () => {
    const user = userEvent.setup();
    render(<Modal />);
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    screen.getByRole('button', { name: 'Apply' }).focus();
    await user.tab();
    expect(screen.getByRole('dialog', { name: 'Edit' }).contains(document.activeElement)).toBe(true);
  });
});
