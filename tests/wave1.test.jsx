import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Dialog } from '../components/feedback/Dialog.jsx';
import { ConfirmDialog } from '../components/feedback/ConfirmDialog.jsx';
import { Drawer } from '../components/overlay/Drawer.jsx';
import { CommandPalette } from '../components/overlay/CommandPalette.jsx';
import { Combobox } from '../components/forms/Combobox.jsx';
import { StatusDot } from '../components/data/StatusDot.jsx';

// These four were the only components of the 106 that silently dropped a
// caller's className: it landed in ...rest, then a literal className= written
// after the spread clobbered it.
describe('className/style forwarding on the modal four', () => {
  it('Dialog composes the caller className onto its root and keeps its own', () => {
    render(<Dialog open title="T" className="mine" style={{ zIndex: 9 }} data-testid="d" />);
    const root = screen.getByTestId('d');
    expect(root.className).toContain('ef-dialog__overlay');
    expect(root.className).toContain('mine');
    expect(root.style.zIndex).toBe('9');
  });
  it('Drawer composes className and lets caller style win over width', () => {
    render(<Drawer open title="T" width={400} className="mine" style={{ width: 320 }} data-testid="dr" />);
    const panel = screen.getByTestId('dr');
    expect(panel.className).toContain('ef-drawer');
    expect(panel.className).toContain('mine');
    expect(panel.style.width).toBe('320px');
  });
  it('CommandPalette composes className onto the overlay', () => {
    render(<CommandPalette open groups={[{ group: 'G', items: [{ id: 'a', label: 'A' }] }]} className="mine" data-testid="cp" />);
    const root = screen.getByTestId('cp');
    expect(root.className).toContain('ef-cmdk__overlay');
    expect(root.className).toContain('mine');
  });
  it('ConfirmDialog forwards className through to Dialog', () => {
    render(<ConfirmDialog open title="T" className="mine" data-testid="cd" />);
    const root = screen.getByTestId('cd');
    expect(root.className).toContain('ef-dialog__overlay');
    expect(root.className).toContain('mine');
  });
});

// role="combobox" without the pattern's wiring is worse than no role at all:
// it promises behaviour the screen reader then cannot find.
describe('Combobox ARIA pattern', () => {
  it('wires aria-controls, aria-autocomplete and aria-activedescendant to the highlighted option', async () => {
    const user = userEvent.setup();
    render(<Combobox options={['Alpha', 'Beta', 'Gamma']} value={null} onChange={() => {}} />);
    const input = screen.getByRole('combobox');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    const listId = input.getAttribute('aria-controls');
    expect(listId).toBeTruthy();
    await user.click(input);
    const listbox = await screen.findByRole('listbox');
    expect(listbox.id).toBe(listId);
    // highlight follows the arrow keys, and the announced id is a real option
    await user.keyboard('{ArrowDown}');
    const active = input.getAttribute('aria-activedescendant');
    expect(active).toBeTruthy();
    const activeEl = document.getElementById(active);
    expect(activeEl).toBeTruthy();
    expect(activeEl.getAttribute('role')).toBe('option');
    expect(activeEl.textContent).toBe('Beta');
  });
});

describe('StatusDot accessible state', () => {
  it('with a label, prepends the state as visually hidden text', () => {
    render(<StatusDot state="err" label="API" />);
    const el = screen.getByText('API').closest('.ef-status');
    expect(el.textContent).toBe('Error: API');
    expect(el.querySelector('.ef-status__sr')).toBeTruthy();
    expect(el.getAttribute('role')).toBeNull();
  });
  it('without a label, becomes an image named after the state', () => {
    render(<StatusDot state="busy" />);
    const img = screen.getByRole('img', { name: 'Busy' });
    expect(img.className).toContain('ef-status--busy');
  });
  it('stateLabel overrides the announced wording', () => {
    render(<StatusDot state="warn" stateLabel="Degraded" />);
    expect(screen.getByRole('img', { name: 'Degraded' })).toBeTruthy();
  });
});
