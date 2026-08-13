import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../components/feedback/Tooltip.jsx';
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from '../components/overlay/Popover.jsx';
import { Toggle, ToggleGroup, ToggleGroupItem } from '../components/forms/Toggle.jsx';
import { IconButton } from '../components/forms/IconButton.jsx';

describe('Tooltip composition compatibility', () => {
  it('composes provider, trigger, and content while forwarding trigger semantics', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild><button>Inspect</button></TooltipTrigger>
          <TooltipContent side="right">Run details</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    await user.tab();
    const content = await screen.findByRole('tooltip');
    expect(content.getAttribute('data-side')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Inspect' }).getAttribute('aria-describedby')).toBe(content.id);
  });

  it('supports controlled state', () => {
    render(<Tooltip open><TooltipTrigger>Inspect</TooltipTrigger><TooltipContent>Always open</TooltipContent></Tooltip>);
    expect(screen.getByRole('tooltip').textContent).toBe('Always open');
  });

  it('composes with the icon-only trigger without losing its ref', async () => {
    const ref = React.createRef();
    const user = userEvent.setup();
    render(<Tooltip><TooltipTrigger asChild><IconButton ref={ref} icon="copy" label="Copy" /></TooltipTrigger><TooltipContent>Copy item</TooltipContent></Tooltip>);
    expect(ref.current?.tagName).toBe('BUTTON');
    await user.tab();
    expect((await screen.findByRole('tooltip')).textContent).toBe('Copy item');
  });
});

describe('Popover composition compatibility', () => {
  it('composes semantic content parts and reports state', async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Filters</PopoverTrigger>
        <PopoverContent align="start">
          <PopoverHeader><PopoverTitle>Filter runs</PopoverTitle><PopoverDescription>Choose statuses.</PopoverDescription></PopoverHeader>
        </PopoverContent>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Filters' });
    await user.click(trigger);
    expect(screen.getByRole('dialog').getAttribute('data-align')).toBe('start');
    expect(screen.getByRole('heading', { name: 'Filter runs' })).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });
});

describe('Toggle Group composition compatibility', () => {
  it('emits canonical single-value changes and inherits group styling', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ToggleGroup type="single" variant="outline" size="sm" onValueChange={onValueChange}><ToggleGroupItem value="list">List</ToggleGroupItem><ToggleGroupItem value="grid">Grid</ToggleGroupItem></ToggleGroup>);
    await user.click(screen.getByRole('button', { name: 'Grid' }));
    expect(onValueChange).toHaveBeenCalledWith('grid');
    expect(screen.getByRole('button', { name: 'Grid' }).getAttribute('data-state')).toBe('on');
    expect(screen.getByRole('button', { name: 'Grid' }).className).toContain('ef-toggle--outline');
    expect(screen.getByRole('button', { name: 'Grid' }).className).toContain('ef-toggle--sm');
  });

  it('supports multiple values with canonical group items', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ToggleGroup type="multiple" defaultValue={['bold']} onValueChange={onValueChange}><ToggleGroupItem value="bold">Bold</ToggleGroupItem><ToggleGroupItem value="italic">Italic</ToggleGroupItem></ToggleGroup>);
    expect(screen.getByRole('button', { name: 'Bold' }).getAttribute('aria-pressed')).toBe('true');
    await user.click(screen.getByRole('button', { name: 'Italic' }));
    expect(onValueChange).toHaveBeenCalledWith(['bold', 'italic']);
  });

  it('moves focus with orientation-aware arrow keys and honors disabled state', async () => {
    const user = userEvent.setup();
    render(<ToggleGroup orientation="vertical"><ToggleGroupItem value="one">One</ToggleGroupItem><ToggleGroupItem value="two">Two</ToggleGroupItem></ToggleGroup>);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Two' }));
  });
});
