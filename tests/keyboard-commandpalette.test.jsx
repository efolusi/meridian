import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CommandPalette } from '../components/overlay/CommandPalette.jsx';
import { Button } from '../components/forms/Button.jsx';

// jsdom has no scrollIntoView; the palette calls it on every active-option change.
beforeAll(() => { Element.prototype.scrollIntoView = vi.fn(); });

describe('CommandPalette', () => {
  const groups = [
    { group: 'Files', items: [
      { id: 'new', label: 'New file' },
      { id: 'open', label: 'Open file' },
    ] },
    { group: 'View', items: [
      { id: 'zen', label: 'Zen mode' },
    ] },
  ];

  function Harness({ onSelect = () => {} }) {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Commands</Button>
        <CommandPalette open={open} onClose={() => setOpen(false)} onSelect={onSelect} groups={groups} />
      </>
    );
  }

  const activeOption = input => document.getElementById(input.getAttribute('aria-activedescendant'));

  it('focuses a combobox input whose aria-activedescendant names the first option', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Commands' }));
    const input = screen.getByRole('combobox');
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('aria-controls')).toBe(screen.getByRole('listbox').id);
    const active = activeOption(input);
    expect(active.getAttribute('role')).toBe('option');
    expect(active.getAttribute('aria-selected')).toBe('true');
    expect(active.textContent).toBe('New file');
  });

  it('moves the active option with ArrowDown and ArrowUp, across group boundaries', async () => {
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

  it('fires onSelect with the active item id on Enter and closes', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    // No button trigger here: user-event retargets the Enter keypress to whatever
    // is focused after keydown and clicks it, so the palette's synchronous
    // focus-restore would ghost-click a trigger and reopen. Browsers bind Enter
    // activation to the keydown target (the input), so this cannot happen live.
    function EnterHarness() {
      const [open, setOpen] = React.useState(true);
      return <CommandPalette open={open} onClose={() => setOpen(false)} onSelect={onSelect} groups={groups} />;
    }
    render(<EnterHarness />);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('open');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Commands' });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
