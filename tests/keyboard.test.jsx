import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Dialog } from '../components/feedback/Dialog.jsx';
import { Menu } from '../components/overlay/Menu.jsx';
import { Tabs } from '../components/navigation/Tabs.jsx';
import { Calendar } from '../components/dates/Calendar.jsx';
import { Button } from '../components/forms/Button.jsx';

// The contracts guidelines/accessibility.md claims. Each of these was previously
// asserted only by a human clicking around.

describe('Dialog', () => {
  it('traps focus and restores it to the trigger on Escape', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open</Button>
          <Dialog open={open} onClose={() => setOpen(false)} title="Confirm">
            <Button>Inner</Button>
          </Dialog>
        </>
      );
    }
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeTruthy();
    // focus moved into the dialog
    expect(dialog.contains(document.activeElement)).toBe(true);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});

describe('Menu', () => {
  const items = [
    { id: 'rename', label: 'Rename' },
    { id: 'duplicate', label: 'Duplicate' },
    { id: 'delete', label: 'Delete' },
  ];

  it('opens on ArrowDown and focuses the first item', async () => {
    const user = userEvent.setup();
    render(<Menu trigger={<Button>More</Button>} items={items} onSelect={() => {}} />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'Rename' })).toBe(document.activeElement);
  });

  it('moves with arrows and wraps', async () => {
    const user = userEvent.setup();
    render(<Menu trigger={<Button>More</Button>} items={items} onSelect={() => {}} />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement.textContent).toContain('Duplicate');
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(document.activeElement.textContent).toContain('Delete'); // wrapped
  });

  it('jumps to an item by typeahead', async () => {
    const user = userEvent.setup();
    render(<Menu trigger={<Button>More</Button>} items={items} onSelect={() => {}} />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('d');
    expect(document.activeElement.textContent).toContain('Duplicate');
  });

  it('renders its panel outside the trigger subtree', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div style={{ overflow: 'auto' }}>
        <Menu trigger={<Button>More</Button>} items={items} onSelect={() => {}} />
      </div>
    );
    await user.click(screen.getByRole('button', { name: 'More' }));
    const menu = await screen.findByRole('menu');
    expect(container.contains(menu)).toBe(false);
  });
});

describe('Tabs', () => {
  const items = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' },
    { id: 'c', label: 'Gamma' },
  ];
  it('exposes one tab stop and moves selection with arrows', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [v, setV] = React.useState('a');
      return <Tabs items={items} value={v} onChange={setV} />;
    }
    render(<Harness />);
    const tabs = screen.getAllByRole('tab');
    const stops = tabs.filter(t => t.getAttribute('tabindex') !== '-1');
    expect(stops).toHaveLength(1); // roving tabindex
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Beta' }).getAttribute('aria-selected')).toBe('true');
  });
});

describe('Calendar', () => {
  it('is a grid and moves focus a week at a time', async () => {
    const user = userEvent.setup();
    render(<Calendar value="2026-07-16" onChange={() => {}} />);
    const grid = screen.getByRole('grid');
    expect(grid).toBeTruthy();
    const start = grid.querySelector('[data-iso="2026-07-16"]');
    start.focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement.getAttribute('data-iso')).toBe('2026-07-23');
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement.getAttribute('data-iso')).toBe('2026-07-22');
  });
});
