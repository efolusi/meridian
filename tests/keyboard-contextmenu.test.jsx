import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem,
  ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator,
  ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent,
  ContextMenuSubTrigger, ContextMenuTrigger,
} from '../components/overlay/ContextMenu.jsx';
import { Button } from '../components/forms/Button.jsx';

// guidelines/accessibility.md: "Menu, ContextMenu, and Menubar support
// arrow-key navigation, Home/End, and single-character typeahead." The menu
// opens on contextmenu, Enter activates, Escape closes.

describe('ContextMenu', () => {
  function Harness({ onSelect = () => {} }) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild><Button>Target</Button></ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => onSelect('rename')}>Rename<ContextMenuShortcut>F2</ContextMenuShortcut></ContextMenuItem>
          <ContextMenuItem onSelect={() => onSelect('duplicate')}>Duplicate</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive" onSelect={() => onSelect('delete')}>Delete</ContextMenuItem>
        </ContextMenuContent>
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
    expect(within(menu).getByRole('menuitem', { name: /Rename/ })).toBe(document.activeElement);
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

  it('supports checkbox and radio state composition', async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu>
        <ContextMenuTrigger asChild><Button>Target</Button></ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuCheckboxItem defaultChecked>Toolbar</ContextMenuCheckboxItem>
          <ContextMenuRadioGroup defaultValue="ada">
            <ContextMenuRadioItem value="ada">Ada</ContextMenuRadioItem>
            <ContextMenuRadioItem value="june">June</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    );
    const menu = await openMenu(user);
    expect(within(menu).getByRole('menuitemcheckbox', { name: 'Toolbar' }).getAttribute('aria-checked')).toBe('true');
    expect(within(menu).getByRole('menuitemradio', { name: 'Ada' }).getAttribute('aria-checked')).toBe('true');
  });

  it('opens a composed submenu with ArrowRight', async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu>
        <ContextMenuTrigger asChild><Button>Target</Button></ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
            <ContextMenuSubContent><ContextMenuItem>Email</ContextMenuItem></ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    );
    await openMenu(user);
    await user.keyboard('{ArrowRight}');
    expect(await screen.findByRole('menuitem', { name: 'Email' })).toBe(document.activeElement);
  });
});
