import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '../components/navigation/Menubar.jsx';

function MenubarExample({ onSelect = () => {} }) {
  return <Menubar>
    <MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent>
      <MenubarItem onSelect={() => onSelect('new')}>New File</MenubarItem>
      <MenubarItem>Open</MenubarItem>
      <MenubarItem>Save</MenubarItem>
    </MenubarContent></MenubarMenu>
    <MenubarMenu><MenubarTrigger>Edit</MenubarTrigger><MenubarContent><MenubarItem>Undo</MenubarItem><MenubarItem>Redo</MenubarItem></MenubarContent></MenubarMenu>
    <MenubarMenu><MenubarTrigger>View</MenubarTrigger><MenubarContent><MenubarItem>Zoom</MenubarItem></MenubarContent></MenubarMenu>
  </Menubar>;
}

describe('Menubar composition', () => {
  it('moves between top-level triggers and wraps', async () => {
    const user = userEvent.setup();
    render(<MenubarExample />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'File' }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' }));
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'View' }));
  });

  it('opens with ArrowDown and supports item navigation, Home, End, and typeahead', async () => {
    const user = userEvent.setup();
    render(<MenubarExample />);
    const file = screen.getByRole('menuitem', { name: 'File' });
    file.focus();
    await user.keyboard('{ArrowDown}');
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'New File' })).toBe(document.activeElement);
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement.textContent).toContain('Open');
    await user.keyboard('{End}');
    expect(document.activeElement.textContent).toContain('Save');
    await user.keyboard('{Home}s');
    expect(document.activeElement.textContent).toContain('Save');
  });

  it('switches open menus horizontally and returns focus on Escape', async () => {
    const user = userEvent.setup();
    render(<MenubarExample />);
    const file = screen.getByRole('menuitem', { name: 'File' });
    file.focus();
    await user.keyboard('{ArrowDown}{ArrowRight}');
    expect(await screen.findByRole('menuitem', { name: 'Undo' })).toBe(document.activeElement);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' }));
  });

  it('exposes every composed slot and supports checkbox, radio, submenu, and selection', async () => {
    const user = userEvent.setup();
    const selected = vi.fn();
    render(<Menubar><MenubarMenu><MenubarTrigger>Options</MenubarTrigger><MenubarContent>
      <MenubarLabel>Workspace</MenubarLabel><MenubarGroup><MenubarItem onSelect={selected}>Refresh <MenubarShortcut>R</MenubarShortcut></MenubarItem></MenubarGroup>
      <MenubarCheckboxItem defaultChecked>Show status</MenubarCheckboxItem><MenubarSeparator />
      <MenubarRadioGroup defaultValue="comfortable"><MenubarRadioItem value="compact">Compact</MenubarRadioItem><MenubarRadioItem value="comfortable">Comfortable</MenubarRadioItem></MenubarRadioGroup>
      <MenubarSub><MenubarSubTrigger>Share</MenubarSubTrigger><MenubarSubContent><MenubarItem>Copy link</MenubarItem></MenubarSubContent></MenubarSub>
    </MenubarContent></MenubarMenu></Menubar>);
    await user.click(screen.getByRole('menuitem', { name: 'Options' }));
    const menu = screen.getByRole('menu');
    expect(menu.dataset.slot).toBe('menubar-content');
    for (const slot of ['menubar-label', 'menubar-group', 'menubar-item', 'menubar-shortcut', 'menubar-checkbox-item', 'menubar-separator', 'menubar-radio-group', 'menubar-radio-item', 'menubar-sub-trigger']) {
      expect(menu.querySelector(`[data-slot="${slot}"]`), slot).toBeTruthy();
    }
    expect(screen.getByRole('menuitemcheckbox', { name: 'Show status' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('menuitemradio', { name: 'Comfortable' }).getAttribute('aria-checked')).toBe('true');
    await user.hover(screen.getByRole('menuitem', { name: 'Share' }));
    expect((await screen.findByRole('menuitem', { name: 'Copy link' })).closest('[role="menu"]')?.dataset.slot).toBe('menubar-sub-content');
    await user.click(screen.getByRole('menuitem', { name: /Refresh/ }));
    expect(selected).toHaveBeenCalledOnce();
  });
});
