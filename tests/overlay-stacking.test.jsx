import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { render } from '@testing-library/react';
import { Dialog, DialogContent, DialogTitle } from '../components/feedback/Dialog.jsx';
import { Popover, PopoverTrigger, PopoverContent } from '../components/overlay/Popover.jsx';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../components/overlay/DropdownMenu.jsx';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from '../components/overlay/ContextMenu.jsx';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/overlay/HoverCard.jsx';

// Every floating panel is portaled to <body>, a sibling of the modal overlay,
// so only z-index decides which one is on top. A panel at --z-dropdown (1000)
// opened from inside a Dialog (overlay at --z-overlay, 1200) painted under the
// scrim: the menu was open, focused, and invisible.
const tokens = Object.fromEntries([...readFileSync('tokens/effects.css', 'utf8').matchAll(/--(z-[a-z]+):(\d+)/g)].map(m => [m[1], Number(m[2])]));
const css = () => [...document.head.querySelectorAll('style')].map(s => s.textContent).join('\n');
function zOf(selector) {
  const rule = css().split('}').find(r => r.includes(selector + '{'));
  const m = rule && rule.match(/z-index:var\(--(z-[a-z]+)\)/);
  return m ? tokens[m[1]] : undefined;
}

describe('floating panels stack above an open modal', () => {
  it('popover, menus and hover card sit above the dialog overlay', () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>
          <DialogTitle>Edit</DialogTitle>
          <Popover defaultOpen><PopoverTrigger>P</PopoverTrigger><PopoverContent>p</PopoverContent></Popover>
          <DropdownMenu defaultOpen><DropdownMenuTrigger>D</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>d</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
          <ContextMenu defaultOpen><ContextMenuTrigger>C</ContextMenuTrigger><ContextMenuContent><ContextMenuItem>c</ContextMenuItem></ContextMenuContent></ContextMenu>
          <HoverCard defaultOpen><HoverCardTrigger>H</HoverCardTrigger><HoverCardContent>h</HoverCardContent></HoverCard>
        </DialogContent>
      </Dialog>,
    );
    const overlay = zOf('.ef-dialog__overlay');
    expect(overlay).toBe(tokens['z-overlay']);
    for (const panel of ['.ef-popover__panel', '.ef-dropdown-menu__content', '.ef-context-menu__content', '.ef-hovercard__panel']) {
      expect(zOf(panel), panel).toBeGreaterThan(overlay);
    }
  });
});
