import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act } from '@testing-library/react';
import { Dialog, DialogContent, DialogTitle } from '../components/feedback/Dialog.jsx';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogCancel } from '../components/feedback/AlertDialog.jsx';
import { Drawer, DrawerContent, DrawerTitle } from '../components/overlay/Drawer.jsx';
import { Popover, PopoverTrigger, PopoverContent } from '../components/overlay/Popover.jsx';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/overlay/HoverCard.jsx';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../components/feedback/Tooltip.jsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/forms/Select.jsx';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../components/overlay/DropdownMenu.jsx';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '../components/overlay/ContextMenu.jsx';
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem } from '../components/forms/Combobox.jsx';

// An overlay open on first load (defaultOpen, or open from server state) used to
// render a portal while hydrating where the server had rendered none, which
// React reports as a mismatch. Each root now stays closed until hydration is
// done and opens right after, so its effects run with the panel present.
const CASES = [
  ['Dialog', <Dialog defaultOpen><DialogContent><DialogTitle>Hi</DialogTitle><button>ok</button></DialogContent></Dialog>, '[role="dialog"]'],
  ['AlertDialog', <AlertDialog defaultOpen><AlertDialogContent><AlertDialogTitle>Sure?</AlertDialogTitle><AlertDialogCancel>No</AlertDialogCancel></AlertDialogContent></AlertDialog>, '[role="alertdialog"]'],
  ['Drawer', <Drawer defaultOpen><DrawerContent><DrawerTitle>Side</DrawerTitle><button>ok</button></DrawerContent></Drawer>, '[role="dialog"]'],
  ['Popover', <Popover defaultOpen><PopoverTrigger>Open</PopoverTrigger><PopoverContent>Body</PopoverContent></Popover>, '[data-slot="popover-content"]'],
  ['HoverCard', <HoverCard defaultOpen><HoverCardTrigger href="#">Who</HoverCardTrigger><HoverCardContent>Card</HoverCardContent></HoverCard>, '[data-slot="hover-card-content"]'],
  ['Tooltip', <TooltipProvider><Tooltip defaultOpen><TooltipTrigger>Hint</TooltipTrigger><TooltipContent>Tip</TooltipContent></Tooltip></TooltipProvider>, '[role="tooltip"]'],
  ['Select', <Select defaultOpen defaultValue="a"><SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger><SelectContent><SelectItem value="a">A</SelectItem><SelectItem value="b">B</SelectItem></SelectContent></Select>, '[role="listbox"]'],
  ['DropdownMenu', <DropdownMenu defaultOpen><DropdownMenuTrigger>Menu</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>One</DropdownMenuItem></DropdownMenuContent></DropdownMenu>, '[role="menu"]'],
  ['ContextMenu', <ContextMenu defaultOpen><ContextMenuTrigger><div>Area</div></ContextMenuTrigger><ContextMenuContent><ContextMenuItem>One</ContextMenuItem></ContextMenuContent></ContextMenu>, '[role="menu"]'],
  ['Combobox', <Combobox defaultOpen items={['North', 'South']}><ComboboxInput placeholder="Region" /><ComboboxContent><ComboboxList>{item => <ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox>, '[role="listbox"]'],
];

describe('overlays open on first load hydrate without a mismatch', () => {
  let container;
  let root;
  afterEach(() => {
    if (root) act(() => root.unmount());
    root = null;
    container?.remove();
    document.querySelectorAll('.ef-portal').forEach(n => n.remove());
    document.body.style.overflow = '';
  });

  function hydrate(element) {
    // A real server has no document; jsdom does, so hide it for the server pass.
    vi.stubGlobal('document', undefined);
    let html;
    try { html = renderToString(element); } finally { vi.unstubAllGlobals(); }
    container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const recoverable = vi.fn();
    act(() => { root = hydrateRoot(container, element, { onRecoverableError: recoverable }); });
    return recoverable;
  }

  it.each(CASES)('%s', (name, element, panel) => {
    const recoverable = hydrate(element);
    expect(recoverable).not.toHaveBeenCalled();
    expect(document.querySelector(panel)).not.toBeNull();
  });

  it('a Dialog open on first load moves focus inside once hydrated', () => {
    hydrate(CASES[0][1]);
    expect(document.activeElement?.closest('[role="dialog"]')).not.toBeNull();
  });

  it('a Popover open on first load is placed and visible once hydrated', () => {
    hydrate(CASES[3][1]);
    const panel = document.querySelector('[data-slot="popover-content"]');
    expect(panel.style.visibility).not.toBe('hidden');
  });
});
