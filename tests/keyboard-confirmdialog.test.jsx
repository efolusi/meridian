import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ConfirmDialog } from '../components/feedback/ConfirmDialog.jsx';
import { Button } from '../components/forms/Button.jsx';

// The ConfirmDialog contract from guidelines/accessibility.md: the Dialog
// contract (focus in, Escape closes, focus restore), plus typeToConfirm
// gating the confirm button until the exact phrase is typed.

describe('ConfirmDialog', () => {
  function Harness({ onConfirm, typeToConfirm }) {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={onConfirm}
          title="Delete project"
          typeToConfirm={typeToConfirm}
        />
      </>
    );
  }

  it('moves focus into the dialog on open', async () => {
    const user = userEvent.setup();
    render(<Harness onConfirm={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('closes on Escape without confirming and returns focus to the invoker', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);
  });

  it('keeps the confirm button disabled until the exact phrase is typed', async () => {
    const user = userEvent.setup();
    render(<Harness onConfirm={() => {}} typeToConfirm="meridian-docs" />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const confirm = await screen.findByRole('button', { name: 'Delete' });
    expect(confirm.disabled).toBe(true);
    const input = screen.getByLabelText(/to confirm/);
    await user.type(input, 'meridian');
    expect(confirm.disabled).toBe(true); // partial phrase stays blocked
    await user.type(input, '-docs');
    expect(confirm.disabled).toBe(false);
    await user.type(input, 'x'); // overshoot is not the exact phrase
    expect(confirm.disabled).toBe(true);
  });

  it('Enter on the enabled confirm button fires onConfirm and closes', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} typeToConfirm="meridian-docs" />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await user.type(screen.getByLabelText(/to confirm/), 'meridian-docs');
    const confirm = screen.getByRole('button', { name: 'Delete' });
    confirm.focus();
    await user.keyboard('{Enter}');
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull(); // onClose fired too
    expect(document.activeElement).toBe(trigger);
  });
});
