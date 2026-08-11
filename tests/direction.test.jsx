import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DirectionProvider, useDirection } from '../components/display/Direction.jsx';
import { Tabs } from '../components/navigation/Tabs.jsx';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '../components/navigation/Menubar.jsx';
import { Calendar } from '../components/dates/Calendar.jsx';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../components/display/Resizable.jsx';
import { PromptSteps } from '../components/ai/PromptSteps.jsx';
import { Carousel, CarouselContent, CarouselItem, CarouselNext } from '../components/display/Carousel.jsx';

function DirectionValue() {
  return <output>{useDirection()}</output>;
}

describe('DirectionProvider', () => {
  it('provides a validated reading direction', () => {
    const { rerender } = render(<DirectionProvider direction="rtl"><DirectionValue /></DirectionProvider>);
    expect(screen.getByText('rtl')).toBeTruthy();
    rerender(<DirectionProvider direction="sideways"><DirectionValue /></DirectionProvider>);
    expect(screen.getByText('ltr')).toBeTruthy();
  });

  it('accepts dir while keeping direction as an additive alias', () => {
    const { rerender } = render(<DirectionProvider dir="rtl"><DirectionValue /></DirectionProvider>);
    expect(screen.getByText('rtl')).toBeTruthy();
    rerender(<DirectionProvider dir="rtl" direction="ltr"><DirectionValue /></DirectionProvider>);
    expect(screen.getByText('ltr')).toBeTruthy();
  });

  it('uses document direction when there is no provider', () => {
    const previous = document.documentElement.dir;
    document.documentElement.dir = 'rtl';
    render(<DirectionValue />);
    expect(screen.getByText('rtl')).toBeTruthy();
    document.documentElement.dir = previous;
  });
});

describe('RTL horizontal keyboard behavior', () => {
  it('moves Tabs in visual direction', async () => {
    const user = userEvent.setup();
    function Example() {
      const [value, setValue] = React.useState('a');
      return <DirectionProvider direction="rtl"><Tabs value={value} onChange={setValue} items={[{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }]} /></DirectionProvider>;
    }
    render(<Example />);
    screen.getByRole('tab', { name: 'A' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'B' }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'A' }));
  });

  it('moves Menubar in visual direction', async () => {
    const user = userEvent.setup();
    render(<DirectionProvider direction="rtl"><Menubar>{['A', 'B', 'C'].map(label => <MenubarMenu key={label}><MenubarTrigger>{label}</MenubarTrigger><MenubarContent><MenubarItem>{label}</MenubarItem></MenubarContent></MenubarMenu>)}</Menubar></DirectionProvider>);
    screen.getByRole('menuitem', { name: 'A' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'B' }));
  });

  it('moves Calendar days in visual direction', async () => {
    const user = userEvent.setup();
    render(<DirectionProvider direction="rtl"><Calendar mode="single" selected={new Date(2026, 6, 16)} onSelect={() => {}} /></DirectionProvider>);
    const selected = screen.getByRole('gridcell', { name: 'July 16, 2026' });
    selected.focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement.getAttribute('data-key')).toBe('2026-07-17');
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement.getAttribute('data-key')).toBe('2026-07-16');
  });

  it('resizes the inline-start pane in visual direction', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DirectionProvider direction="rtl">
        <ResizablePanelGroup>
          <ResizablePanel><div>A</div></ResizablePanel>
          <ResizableHandle />
          <ResizablePanel><div>B</div></ResizablePanel>
        </ResizablePanelGroup>
      </DirectionProvider>,
    );
    const handle = screen.getByRole('separator', { name: 'Resize panes' });
    handle.focus();
    await user.keyboard('{ArrowLeft}');
    expect(container.querySelector('.ef-resizable__pane').style.flexBasis).toBe('52%');
  });

  it('uses ArrowRight to go back through PromptSteps', async () => {
    const user = userEvent.setup();
    render(
      <DirectionProvider direction="rtl">
        <PromptSteps steps={[
          { name: 'first', question: 'First question', options: ['A'] },
          { name: 'second', question: 'Second question', options: ['B'] },
        ]} />
      </DirectionProvider>,
    );
    await user.click(screen.getByRole('button', { name: /1\.\s*A/ }));
    expect(screen.getByText('Second question')).toBeTruthy();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('First question')).toBeTruthy();
  });

  it('scrolls Carousel toward negative inline offsets', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DirectionProvider direction="rtl">
        <Carousel>
          <CarouselContent><CarouselItem>A</CarouselItem><CarouselItem>B</CarouselItem></CarouselContent>
          <CarouselNext />
        </Carousel>
      </DirectionProvider>,
    );
    const content = container.querySelector('[data-slot="carousel-content"]');
    const slides = container.querySelectorAll('[data-slot="carousel-item"]');
    Object.defineProperty(slides[1], 'offsetLeft', { configurable: true, value: 114 });
    content.scrollTo = vi.fn();
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(content.scrollTo).toHaveBeenCalledWith({ left: -114, behavior: 'smooth' });
  });
});
