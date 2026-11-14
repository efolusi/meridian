import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Popover, PopoverTrigger, PopoverContent } from '../components/overlay/Popover.jsx';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/overlay/HoverCard.jsx';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../components/feedback/Tooltip.jsx';

// The content used to overwrite a caller's id with the generated one, so a
// label or test hook pointing at that id found nothing.
describe('overlay content keeps the caller id', () => {
  it('Popover', () => {
    render(<Popover defaultOpen><PopoverTrigger>Open</PopoverTrigger><PopoverContent id="my-pop">Body</PopoverContent></Popover>);
    expect(document.getElementById('my-pop')?.textContent).toBe('Body');
    expect(screen.getByText('Open').closest('button').getAttribute('aria-controls')).toBe('my-pop');
  });

  it('HoverCard', () => {
    render(<HoverCard defaultOpen><HoverCardTrigger href="#">Who</HoverCardTrigger><HoverCardContent id="my-card">Card</HoverCardContent></HoverCard>);
    expect(document.getElementById('my-card')?.textContent).toBe('Card');
    expect(screen.getByText('Who').closest('[aria-controls]')?.getAttribute('aria-controls')).toBe('my-card');
  });

  it('Tooltip', () => {
    render(<TooltipProvider><Tooltip defaultOpen><TooltipTrigger>Hint</TooltipTrigger><TooltipContent id="my-tip">Tip</TooltipContent></Tooltip></TooltipProvider>);
    expect(document.getElementById('my-tip')?.textContent).toBe('Tip');
    expect(screen.getByText('Hint').closest('[aria-describedby]')?.getAttribute('aria-describedby')).toBe('my-tip');
  });

  it('falls back to the generated id without one', () => {
    render(<Popover defaultOpen><PopoverTrigger>Go</PopoverTrigger><PopoverContent>Plain</PopoverContent></Popover>);
    const content = screen.getByText('Plain').closest('[data-slot="popover-content"]');
    expect(content.id).not.toBe('');
    expect(screen.getByText('Go').closest('button').getAttribute('aria-controls')).toBe(content.id);
  });
});
