import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/forms/Button.jsx';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '../components/overlay/Drawer.jsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/feedback/Tooltip.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/forms/Select.jsx';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../components/overlay/ContextMenu.jsx';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../components/overlay/HoverCard.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/overlay/DropdownMenu.jsx';
import { ModelSelector } from '../components/ai/ModelSelector.jsx';
import { TimePicker } from '../components/dates/TimePicker.jsx';

// MD18: the overlays put their position, arrow offset, trigger width and drag offset on the
// element through the CSSOM (styleRef), not through a style attribute. jsdom measures every
// rect as zero, so these tests assert what the components write, not where a browser puts it.

// jsdom has no PointerEvent; the Drawer reads pointerId and clientX/clientY from it.
class TestPointerEvent extends MouseEvent {
  constructor(type, init = {}) { super(type, init); this.pointerId = init.pointerId ?? 1; }
}

describe('Drawer drag', () => {
  it('follows the pointer through transform, drops the transition while dragging, and snaps back under the threshold', async () => {
    const original = window.PointerEvent;
    window.PointerEvent = TestPointerEvent;
    try {
      const user = userEvent.setup();
      render(<Drawer direction="right"><DrawerTrigger asChild><Button>Open</Button></DrawerTrigger><DrawerContent><DrawerTitle>Order</DrawerTitle><p>body</p></DrawerContent></Drawer>);
      await user.click(screen.getByRole('button', { name: 'Open' }));
      const panel = screen.getByRole('dialog');
      expect(panel.style.transform).toBe('');
      fireEvent.pointerDown(panel, { pointerId: 1, clientX: 100 });
      fireEvent.pointerMove(panel, { pointerId: 1, clientX: 140 });
      expect(panel.style.transform).toBe('translateX(40px)');
      expect(panel.style.transition).toBe('none');
      fireEvent.pointerUp(panel, { pointerId: 1, clientX: 140 });
      expect(panel.style.transform).toBe('');
      expect(panel.style.transition).toBe('');
      expect(screen.getByRole('dialog')).toBeTruthy();
    } finally {
      window.PointerEvent = original;
    }
  });

  it('a caller transform on the panel is the caller\'s, even during a drag', async () => {
    const original = window.PointerEvent;
    window.PointerEvent = TestPointerEvent;
    try {
      const user = userEvent.setup();
      render(<Drawer direction="right"><DrawerTrigger asChild><Button>Open</Button></DrawerTrigger><DrawerContent style={{ transform: 'scale(1)' }}><DrawerTitle>Order</DrawerTitle></DrawerContent></Drawer>);
      await user.click(screen.getByRole('button', { name: 'Open' }));
      const panel = screen.getByRole('dialog');
      fireEvent.pointerDown(panel, { pointerId: 1, clientX: 0 });
      fireEvent.pointerMove(panel, { pointerId: 1, clientX: 30 });
      expect(panel.style.transform).toBe('scale(1)');
    } finally {
      window.PointerEvent = original;
    }
  });
});

describe('Tooltip placement', () => {
  it('is fixed and visible once placed, with the arrow offset as a custom property', async () => {
    const user = userEvent.setup();
    render(<Tooltip><TooltipTrigger asChild><Button>Save file</Button></TooltipTrigger><TooltipContent>Save</TooltipContent></Tooltip>);
    await user.tab();
    const tip = await screen.findByRole('tooltip');
    expect(tip.style.position).toBe('fixed');
    expect(tip.style.visibility).toBe('visible');
    expect(tip.style.top).toMatch(/px$/);
    expect(tip.style.left).toMatch(/px$/);
    expect(tip.style.getPropertyValue('--ef-tt-arrow')).toBe('8px');
  });
});

describe('Select content', () => {
  it('writes the trigger width as --select-trigger-width, and a caller style wins', () => {
    const { unmount } = render(<Select defaultValue="a"><SelectTrigger aria-label="Letter"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="a">A</SelectItem></SelectContent></Select>);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
    const list = screen.getByRole('listbox');
    expect(list.style.getPropertyValue('--select-trigger-width')).toBe('160px');
    expect(list.style.position).toBe('fixed');
    unmount();
    render(<Select defaultValue="a"><SelectTrigger aria-label="Letter"><SelectValue /></SelectTrigger><SelectContent style={{ '--select-trigger-width': '300px' }}><SelectItem value="a">A</SelectItem></SelectContent></Select>);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
    expect(screen.getByRole('listbox').style.getPropertyValue('--select-trigger-width')).toBe('300px');
  });
});

describe('ContextMenu position', () => {
  // The menu is clamped into the viewport by a layout effect that writes left and top; jsdom
  // measures nothing, so give it an 800 by 600 viewport and a 100 by 80 panel.
  function withViewport(run) {
    const root = document.documentElement;
    const rect = HTMLElement.prototype.getBoundingClientRect;
    Object.defineProperty(root, 'clientWidth', { configurable: true, value: 800 });
    Object.defineProperty(root, 'clientHeight', { configurable: true, value: 600 });
    HTMLElement.prototype.getBoundingClientRect = () => ({ x: 0, y: 0, top: 0, left: 0, right: 100, bottom: 80, width: 100, height: 80, toJSON() {} });
    try { run(); } finally {
      delete root.clientWidth;
      delete root.clientHeight;
      HTMLElement.prototype.getBoundingClientRect = rect;
    }
  }
  const tree = (extra) => <ContextMenu><ContextMenuTrigger asChild><Button>Target</Button></ContextMenuTrigger><ContextMenuContent><ContextMenuItem>Rename</ContextMenuItem>{extra}</ContextMenuContent></ContextMenu>;

  it('opens at the pointer: left and top from the event coordinates', () => {
    withViewport(() => {
      render(tree());
      fireEvent.contextMenu(screen.getByRole('button', { name: 'Target' }), { clientX: 30, clientY: 40 });
      const menu = screen.getByRole('menu');
      expect(menu.style.left).toBe('30px');
      expect(menu.style.top).toBe('40px');
    });
  });

  it('keeps the viewport clamp when the menu renders again', () => {
    withViewport(() => {
      const { rerender } = render(tree());
      fireEvent.contextMenu(screen.getByRole('button', { name: 'Target' }), { clientX: 790, clientY: 590 });
      const menu = screen.getByRole('menu');
      expect(menu.style.left).toBe('692px');
      expect(menu.style.top).toBe('512px');
      rerender(tree(<ContextMenuItem>Duplicate</ContextMenuItem>));
      expect(screen.getByRole('menu').style.left).toBe('692px');
      expect(screen.getByRole('menu').style.top).toBe('512px');
    });
  });
});

describe('anchored overlays are placed through the CSSOM', () => {
  it('HoverCard: fixed once opened', async () => {
    const user = userEvent.setup();
    render(<HoverCard><HoverCardTrigger asChild><Button variant="ghost">@ada</Button></HoverCardTrigger><HoverCardContent><p>Ada Lovelace</p></HoverCardContent></HoverCard>);
    await user.tab();
    const panel = document.querySelector('[data-slot="hover-card-content"]');
    expect(panel.style.position).toBe('fixed');
    expect(panel.style.right).toBe('auto');
  });

  it('DropdownMenu: fixed once opened', async () => {
    const user = userEvent.setup();
    render(<DropdownMenu><DropdownMenuTrigger asChild><Button>Manage</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Suspend</DropdownMenuItem></DropdownMenuContent></DropdownMenu>);
    await user.click(screen.getByRole('button', { name: 'Manage' }));
    const menu = screen.getByRole('menu');
    expect(menu.style.position).toBe('fixed');
    expect(menu.style.visibility).toBe('visible');
  });

  it('ModelSelector: the panel is fixed once opened', async () => {
    const user = userEvent.setup();
    render(<ModelSelector side="bottom" models={[{ id: 'a', name: 'Alpha' }]} value="a" />);
    await user.click(screen.getByRole('button'));
    const panel = screen.getByRole('listbox');
    expect(panel.style.position).toBe('fixed');
    expect(panel.style.visibility).toBe('visible');
  });

  it('TimePicker: the list is fixed and as wide as the field (width written) once opened', async () => {
    const user = userEvent.setup();
    render(<TimePicker aria-label="Reminder" value={null} onChange={() => {}} />);
    await user.click(screen.getByRole('combobox', { name: 'Reminder' }));
    const list = screen.getByRole('listbox');
    expect(list.style.position).toBe('fixed');
    expect(list.style.width).toBe('0px');
  });
});
