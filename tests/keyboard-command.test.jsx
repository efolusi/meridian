import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem } from '../components/overlay/Command.jsx';
import { Button } from '../components/forms/Button.jsx';

beforeAll(() => { Element.prototype.scrollIntoView = vi.fn(); });

describe('Command keyboard contract', () => {
  function Palette({ open, onOpenChange, onSelect = () => {} }) {
    return (
      <CommandDialog open={open} onOpenChange={onOpenChange} title="File commands">
        <CommandInput placeholder="Search commands" />
        <CommandList>
          <CommandGroup heading="Files">
            <CommandItem value="new" onSelect={onSelect}>New file</CommandItem>
            <CommandItem value="open" onSelect={onSelect}>Open file</CommandItem>
          </CommandGroup>
          <CommandGroup heading="View"><CommandItem value="zen" onSelect={onSelect}>Zen mode</CommandItem></CommandGroup>
        </CommandList>
      </CommandDialog>
    );
  }

  function Harness({ onSelect = () => {} }) {
    const [open, setOpen] = React.useState(false);
    return <><Button onClick={() => setOpen(true)}>Commands</Button><Palette open={open} onOpenChange={setOpen} onSelect={value => { onSelect(value); setOpen(false); }} /></>;
  }

  const activeOption = input => document.getElementById(input.getAttribute('aria-activedescendant'));

  it('connects the focused combobox to its listbox and first active option', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Commands' }));
    const input = screen.getByRole('combobox');
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('aria-controls')).toBe(screen.getByRole('listbox').id);
    expect(activeOption(input).textContent).toBe('New file');
    expect(activeOption(input).getAttribute('aria-selected')).toBe('true');
  });

  it('moves across group boundaries with ArrowDown and ArrowUp', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Commands' }));
    const input = screen.getByRole('combobox');
    await user.keyboard('{ArrowDown}');
    expect(activeOption(input).textContent).toBe('Open file');
    await user.keyboard('{ArrowDown}');
    expect(activeOption(input).textContent).toBe('Zen mode');
    await user.keyboard('{ArrowUp}');
    expect(activeOption(input).textContent).toBe('Open file');
  });

  it('selects the active item on Enter and closes', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Commands' }));
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith('open');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Commands' });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
