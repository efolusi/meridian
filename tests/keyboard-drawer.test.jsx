import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Drawer } from '../components/overlay/Drawer.jsx';
import { Button } from '../components/forms/Button.jsx';

// The Drawer contract from guidelines/accessibility.md: focus in on open,
// Tab/Shift+Tab wrap, Escape closes and restores the invoker, aria-labelledby.

describe('Drawer', () => {
  function Harness({ children, footer }) {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Drawer open={open} onClose={() => setOpen(false)} title="Settings" footer={footer}>
          {children}
        </Drawer>
      </>
    );
  }

  it('moves focus into the panel on open', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <Button>Body</Button>
      </Harness>
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('wraps Tab and Shift+Tab inside the panel', async () => {
    const user = userEvent.setup();
    render(
      <Harness footer={<Button>Last</Button>}>
        <Button>Body</Button>
      </Harness>
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const close = screen.getByRole('button', { name: 'Close' });
    const last = screen.getByRole('button', { name: 'Last' });
    expect(document.activeElement).toBe(close); // first focusable: head close button
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Body' }));
    await user.tab();
    expect(document.activeElement).toBe(last);
    await user.tab(); // wraps forward past the end
    expect(document.activeElement).toBe(close);
    await user.tab({ shift: true }); // wraps backward past the start
    expect(document.activeElement).toBe(last);
  });

  it('closes on Escape and returns focus to the invoker', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <Button>Body</Button>
      </Harness>
    );
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('labels the panel via aria-labelledby pointing at the title', () => {
    render(<Drawer open onClose={() => {}} title="Settings" />);
    const dialog = screen.getByRole('dialog');
    const id = dialog.getAttribute('aria-labelledby');
    expect(id).toBeTruthy();
    expect(document.getElementById(id).textContent).toBe('Settings');
  });
});
