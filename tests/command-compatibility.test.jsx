import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '../components/overlay/Command.jsx';

function CommandFixture({ select = () => {} }) {
  return (
    <Command loop>
      <CommandInput placeholder="Search commands" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem value="calendar" keywords={['date']} onSelect={select}>Calendar</CommandItem>
          <CommandItem value="settings" onSelect={select}>Settings<CommandShortcut>⌘S</CommandShortcut></CommandItem>
          <CommandItem value="disabled" disabled>Disabled</CommandItem>
        </CommandGroup>
        <CommandSeparator />
      </CommandList>
    </Command>
  );
}

describe('Command compatibility contract', () => {
  it('composes the documented slots and filters by value, text, and keywords', () => {
    render(<CommandFixture />);
    const input = screen.getByRole('combobox', { name: 'Search commands' });
    expect(screen.getByRole('group', { name: 'Actions' })).toBeTruthy();
    expect(document.querySelector('[data-slot="command-separator"]')).toBeTruthy();
    fireEvent.change(input, { target: { value: 'date' } });
    expect(screen.getByRole('option', { name: 'Calendar' }).hidden).toBe(false);
    expect(document.querySelector('[data-value="settings"]').hidden).toBe(true);
    fireEvent.change(input, { target: { value: 'missing' } });
    expect(screen.getByText('No results found.')).toBeTruthy();
  });

  it('supports looped keyboard selection and Enter activation', () => {
    const select = vi.fn();
    render(<CommandFixture select={select} />);
    const command = document.querySelector('[data-slot="command"]');
    fireEvent.keyDown(command, { key: 'ArrowUp' });
    fireEvent.keyDown(command, { key: 'Enter' });
    expect(select).toHaveBeenCalledWith('settings');
  });

  it('renders the modal composition and closes through onOpenChange', () => {
    const change = vi.fn();
    render(<CommandDialog open onOpenChange={change} title="Workspace commands" description="Pick an action"><CommandInput placeholder="Search" /><CommandList><CommandItem>Open</CommandItem></CommandList></CommandDialog>);
    expect(screen.getByRole('dialog', { name: 'Workspace commands' })).toBeTruthy();
    screen.getByRole('button', { name: 'Close' }).click();
    expect(change).toHaveBeenCalledWith(false);
  });
});
