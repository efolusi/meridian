import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DirectionProvider, useDirection } from '../components/display/Direction.jsx';
import { Tabs } from '../components/navigation/Tabs.jsx';
import { Menubar } from '../components/navigation/Menubar.jsx';
import { Calendar } from '../components/dates/Calendar.jsx';
import { DigitEntry } from '../components/forms/DigitEntry.jsx';
import { Resizable } from '../components/display/Resizable.jsx';
import { PromptSteps } from '../components/ai/PromptSteps.jsx';
import { Carousel } from '../components/display/Carousel.jsx';

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
    const menus = ['A', 'B', 'C'].map(label => ({ label, items: [{ id: label, label }] }));
    render(<DirectionProvider direction="rtl"><Menubar menus={menus} /></DirectionProvider>);
    screen.getByRole('button', { name: 'A' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'B' }));
  });

  it('moves Calendar days in visual direction', async () => {
    const user = userEvent.setup();
    render(<DirectionProvider direction="rtl"><Calendar value="2026-07-16" onChange={() => {}} /></DirectionProvider>);
    const selected = screen.getByRole('gridcell', { name: '16 July 2026' });
    selected.focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement.getAttribute('data-iso')).toBe('2026-07-17');
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement.getAttribute('data-iso')).toBe('2026-07-16');
  });

  it('moves DigitEntry focus in visual direction', async () => {
    const user = userEvent.setup();
    render(<DirectionProvider direction="rtl"><DigitEntry length={3} value="123" onChange={() => {}} /></DirectionProvider>);
    screen.getByRole('textbox', { name: 'Digit 2 of 3' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Digit 3 of 3' }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Digit 2 of 3' }));
  });

  it('resizes the inline-start pane in visual direction', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DirectionProvider direction="rtl">
        <Resizable><div>A</div><div>B</div></Resizable>
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
        <Carousel gap={14}><div>A</div><div>B</div></Carousel>
      </DirectionProvider>,
    );
    const track = container.querySelector('.ef-carousel__track');
    track.scrollTo = vi.fn();
    track.firstChild.getBoundingClientRect = () => ({ width: 100 });
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(track.scrollTo).toHaveBeenCalledWith({ left: -114, behavior: 'smooth' });
  });
});
