import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DirectionProvider } from '../components/display/Direction.jsx';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '../components/overlay/DropdownMenu.jsx';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from '../components/overlay/ContextMenu.jsx';

// jsdom has no layout, so the rects are stubbed: a 1000x800 viewport, a
// trigger at x 600..700, and every panel 200 wide.
function stubLayout() {
  Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 1000 });
  Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 800 });
  const original = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function rect() {
    if (this.getAttribute('role') === 'menu') return { left: 0, right: 200, top: 0, bottom: 120, width: 200, height: 120 };
    if (this.dataset.slot === 'dropdown-menu-sub-trigger' || this.dataset.slot === 'context-menu-sub-trigger') return { left: 400, right: 600, top: 100, bottom: 132, width: 200, height: 32 };
    if (this.dataset.slot === 'dropdown-menu-trigger') return { left: 600, right: 700, top: 50, bottom: 80, width: 100, height: 30 };
    return original.call(this);
  };
  return () => { Element.prototype.getBoundingClientRect = original; delete document.documentElement.clientWidth; delete document.documentElement.clientHeight; };
}

describe('anchored panels in a right-to-left layout', () => {
  // align="start" is logical. In RTL the panel must line up with the
  // trigger's right edge; it was always lined up with the left one.
  it('align="start" lines up with the inline start of the trigger', async () => {
    const restore = stubLayout();
    const user = userEvent.setup();
    render(<DirectionProvider dir="rtl"><div dir="rtl"><DropdownMenu><DropdownMenuTrigger>File</DropdownMenuTrigger><DropdownMenuContent align="start"><DropdownMenuItem>New</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></DirectionProvider>);
    await user.click(screen.getByText('File'));
    const menu = screen.getByRole('menu');
    expect(menu.style.left).toBe('500px'); // 700 (trigger right) - 200 (panel)
    expect(menu.getAttribute('dir')).toBe('rtl');
    restore();
  });

  // A submenu opens toward the inline end, and the arrow pointing that way
  // opens it; the opposite arrow closes it.
  it.each([
    ['DropdownMenu', (onOpen) => (
      <DropdownMenu defaultOpen><DropdownMenuTrigger>File</DropdownMenuTrigger><DropdownMenuContent>
        <DropdownMenuSub onOpenChange={onOpen}><DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger><DropdownMenuSubContent><DropdownMenuItem>Email</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuSub>
      </DropdownMenuContent></DropdownMenu>
    )],
    ['ContextMenu', (onOpen) => (
      <ContextMenu defaultOpen><ContextMenuTrigger>Area</ContextMenuTrigger><ContextMenuContent>
        <ContextMenuSub onOpenChange={onOpen}><ContextMenuSubTrigger>Share</ContextMenuSubTrigger><ContextMenuSubContent><ContextMenuItem>Email</ContextMenuItem></ContextMenuSubContent></ContextMenuSub>
      </ContextMenuContent></ContextMenu>
    )],
  ])('%s submenu opens to the left with ArrowLeft and closes with ArrowRight', async (_name, ui) => {
    const restore = stubLayout();
    const user = userEvent.setup();
    const states = [];
    render(<DirectionProvider dir="rtl">{ui(open => states.push(open))}</DirectionProvider>);
    screen.getByText('Share').focus();
    await user.keyboard('{ArrowRight}');
    expect(states).toEqual([]);
    await user.keyboard('{ArrowLeft}');
    expect(states).toEqual([true]);
    const sub = screen.getAllByRole('menu').at(-1);
    expect(sub.getAttribute('data-side')).toBe('left');
    expect(sub.style.left).toBe('196px'); // 400 (trigger left) - 4 (offset) - 200 (panel)
    sub.querySelector('[role="menuitem"]').focus();
    await user.keyboard('{ArrowRight}');
    expect(states).toEqual([true, false]);
    restore();
  });
});
