import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ContextMenu } from '../components/overlay/ContextMenu.jsx';
import { Button } from '../components/forms/Button.jsx';

// guidelines/accessibility.md: "Menu, ContextMenu, and Menubar support
// arrow-key navigation, Home/End, and single-character typeahead." The menu
// opens on contextmenu, Enter activates, Escape closes.

describe('ContextMenu', () => {
  const items = [
    { id: 'rename', label: 'Rename' },
    { id: 'duplicate', label: 'Duplicate' },
    { id: 'delete', label: 'Delete' },
  ];

  function Harness({ onSelect = () => {} }) {
    return (
      <ContextMenu items={items} onSelect={onSelect}>
        <Button>Target</Button>
      </ContextMenu>
    );
  }

  async function openMenu(user) {
    await user.pointer({ keys: '[MouseRight]', target: screen.getByRole('button', { name: 'Target' }) });
    return screen.findByRole('menu');
  }

  it('opens on contextmenu and focuses the first item', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const menu = await openMenu(user);
    expect(within(menu).getByRole('menuitem', { name: 'Rename' })).toBe(document.activeElement);
  });

  it('moves the active item with ArrowDown and ArrowUp', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await openMenu(user);
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement.textContent).toContain('Duplicate');
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(document.activeElement.textContent).toContain('Delete'); // wrapped
  });

  it('jumps to the edges with End and Home', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await openMenu(user);
    await user.keyboard('{End}');
    expect(document.activeElement.textContent).toContain('Delete');
    await user.keyboard('{Home}');
    expect(document.activeElement.textContent).toContain('Rename');
  });

  it('jumps to a matching item by typeahead', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await openMenu(user);
    await user.keyboard('d');
    expect(document.activeElement.textContent).toContain('Duplicate');
  });

  it('activates the focused item with Enter and closes', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    await openMenu(user);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith('duplicate');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await openMenu(user);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
