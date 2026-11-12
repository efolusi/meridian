import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '../components/overlay/DropdownMenu.jsx';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from '../components/overlay/ContextMenu.jsx';

// A submenu is portaled to its own host, outside the root panel's DOM subtree.
// The root's outside-pointerdown check used to treat a press inside the
// submenu as "outside", closed the whole menu on pointerdown, and the click
// that followed landed on nothing: no submenu item could be chosen by mouse.
describe('submenu items are clickable', () => {
  it('DropdownMenu', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Copy</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent><DropdownMenuItem onSelect={onSelect}>Email link</DropdownMenuItem></DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText('Open'));
    await user.hover(screen.getByText('Share'));
    await user.click(screen.getByText('Email link'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('ContextMenu', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Target</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
            <ContextMenuSubContent><ContextMenuItem onSelect={onSelect}>Email link</ContextMenuItem></ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>,
    );
    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Target') });
    await user.hover(screen.getByText('Share'));
    await user.click(screen.getByText('Email link'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('a press outside every panel still closes the menu', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type="button">Elsewhere</button>
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent><DropdownMenuItem>Copy</DropdownMenuItem></DropdownMenuContent>
        </DropdownMenu>
      </div>,
    );
    await user.click(screen.getByText('Open'));
    expect(screen.getByRole('menu')).toBeTruthy();
    await user.click(screen.getByText('Elsewhere'));
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
