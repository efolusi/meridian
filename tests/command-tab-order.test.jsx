import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandDialog, CommandInput, CommandList, CommandItem } from '../components/overlay/Command.jsx';
import { Dialog, DialogContent, DialogTitle } from '../components/feedback/Dialog.jsx';

// Options in a command palette are reached with the arrow keys from the
// input (aria-activedescendant). They rendered as plain <button>s, so Tab
// walked through every result before reaching anything else, and the
// dialog's focus trap counted them as stops.
describe('Command options are not tab stops', () => {
  it('Tab and Shift+Tab from the input skip the options', async () => {
    const user = userEvent.setup();
    render(
      <CommandDialog open onOpenChange={() => {}}>
        <CommandInput placeholder="Search" />
        <CommandList><CommandItem>Calendar</CommandItem><CommandItem>Settings</CommandItem></CommandList>
      </CommandDialog>,
    );
    const input = screen.getByRole('combobox');
    expect(document.activeElement).toBe(input);
    await user.tab();
    expect(document.activeElement.getAttribute('role')).not.toBe('option');
    input.focus();
    await user.tab({ shift: true });
    expect(document.activeElement.getAttribute('role')).not.toBe('option');
  });

  it('dialog initial focus skips disabled and tabindex=-1 controls', () => {
    render(
      <Dialog open onOpenChange={() => {}}><DialogContent showCloseButton={false}><DialogTitle>Pick</DialogTitle>
        <button type="button" disabled>Disabled</button><button type="button" tabIndex={-1}>Skipped</button><button type="button">Ready</button>
      </DialogContent></Dialog>,
    );
    expect(document.activeElement.textContent).toBe('Ready');
  });
});
