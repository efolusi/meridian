import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Menubar } from '../components/navigation/Menubar.jsx';

// guidelines/accessibility.md: "Menubar adds Left/Right between menus and Down
// to open" on top of arrow-key navigation, Home/End, and typeahead.

describe('Menubar', () => {
  const menus = [
    {
      label: 'File',
      items: [
        { id: 'new', label: 'New File' },
        { id: 'open', label: 'Open' },
        { id: 'save', label: 'Save' },
      ],
    },
    {
      label: 'Edit',
      items: [
        { id: 'undo', label: 'Undo' },
        { id: 'redo', label: 'Redo' },
      ],
    },
    { label: 'View', items: [{ id: 'zoom', label: 'Zoom' }] },
  ];

  it('moves between top-level menu buttons with ArrowRight/ArrowLeft, wrapping', async () => {
    const user = userEvent.setup();
    render(<Menubar menus={menus} onSelect={() => {}} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'File' }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Edit' }));
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'View' })); // wrapped
  });

  it('opens the focused menu with ArrowDown and focuses its first item', async () => {
    const user = userEvent.setup();
    render(<Menubar menus={menus} onSelect={() => {}} />);
    const file = screen.getByRole('button', { name: 'File' });
    expect(file.getAttribute('aria-haspopup')).toBe('menu');
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(file.getAttribute('aria-expanded')).toBe('true');
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'New File' })).toBe(document.activeElement);
  });

  it('moves items with ArrowDown/ArrowUp and jumps with Home/End', async () => {
    const user = userEvent.setup();
    render(<Menubar menus={menus} onSelect={() => {}} />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement.textContent).toContain('Open');
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(document.activeElement.textContent).toContain('Save'); // wrapped
    await user.keyboard('{Home}');
    expect(document.activeElement.textContent).toContain('New File');
    await user.keyboard('{End}');
    expect(document.activeElement.textContent).toContain('Save');
  });

  it('jumps to an item by typeahead', async () => {
    const user = userEvent.setup();
    render(<Menubar menus={menus} onSelect={() => {}} />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('s');
    expect(document.activeElement.textContent).toContain('Save');
  });

  it('closes the open menu on Escape', async () => {
    const user = userEvent.setup();
    render(<Menubar menus={menus} onSelect={() => {}} />);
    const file = screen.getByRole('button', { name: 'File' });
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(await screen.findByRole('menu')).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(file.getAttribute('aria-expanded')).toBe('false');
    // Known gap: focus is NOT restored to the button (lands on body) — the
    // Escape handler only calls setOpen(null). Tracked as a component bug.
  });
});
