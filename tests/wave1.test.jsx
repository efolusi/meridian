import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Dialog, DialogContent, DialogTitle } from '../components/feedback/Dialog.jsx';
import { ConfirmDialog } from '../components/feedback/ConfirmDialog.jsx';
import { Drawer, DrawerContent, DrawerTitle } from '../components/overlay/Drawer.jsx';
import { CommandDialog, CommandInput, CommandList, CommandItem } from '../components/overlay/Command.jsx';
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem } from '../components/forms/Combobox.jsx';
import { StatusDot } from '../components/data/StatusDot.jsx';

// These four were the only audited components that silently dropped a
// caller's className: it landed in ...rest, then a literal className= written
// after the spread clobbered it.
describe('className/style forwarding on the modal four', () => {
  it('DialogContent composes the caller className and style', () => {
    render(<Dialog open><DialogContent className="mine" style={{ zIndex: 9 }} data-testid="d"><DialogTitle>T</DialogTitle></DialogContent></Dialog>);
    const root = screen.getByTestId('d');
    expect(root.className).toContain('ef-dialog__content');
    expect(root.className).toContain('mine');
    expect(root.style.zIndex).toBe('9');
  });
  it('Drawer composes className and lets caller style win over width', () => {
    render(<Drawer open direction="right"><DrawerContent className="mine" style={{ width: 320 }} data-testid="dr"><DrawerTitle>T</DrawerTitle></DrawerContent></Drawer>);
    const panel = screen.getByTestId('dr');
    expect(panel.className).toContain('ef-drawer');
    expect(panel.className).toContain('mine');
    expect(panel.style.width).toBe('320px');
  });
  it('CommandDialog composes className onto its content', () => {
    render(<CommandDialog open title="Commands" className="mine"><CommandInput /><CommandList><CommandItem>A</CommandItem></CommandList></CommandDialog>);
    const root = screen.getByRole('dialog', { name: 'Commands' });
    expect(root.className).toContain('ef-command-dialog');
    expect(root.className).toContain('mine');
  });
  it('ConfirmDialog forwards className through to Dialog', () => {
    render(<ConfirmDialog open title="T" className="mine" data-testid="cd" />);
    const root = screen.getByTestId('cd');
    expect(root.className).toContain('ef-dialog__content');
    expect(root.className).toContain('mine');
  });
});

// role="combobox" without the pattern's wiring is worse than no role at all:
// it promises behaviour the screen reader then cannot find.
describe('Combobox ARIA pattern', () => {
  it('wires aria-controls, aria-autocomplete and aria-activedescendant to the highlighted option', async () => {
    const user = userEvent.setup();
    render(<Combobox items={['Alpha', 'Beta', 'Gamma']}><ComboboxInput /><ComboboxContent><ComboboxList>{item => <ComboboxItem value={item}>{item}</ComboboxItem>}</ComboboxList></ComboboxContent></Combobox>);
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
    render(<StatusDot status="err" label="API" />);
    const el = screen.getByText('API').closest('.ef-status');
    expect(el.textContent).toBe('Error: API');
    expect(el.querySelector('.ef-status__sr')).toBeTruthy();
    expect(el.getAttribute('role')).toBeNull();
  });
  it('without a label, becomes an image named after the state', () => {
    render(<StatusDot status="busy" />);
    const img = screen.getByRole('img', { name: 'Busy' });
    expect(img.className).toContain('ef-status--busy');
  });
  it('statusLabel overrides the announced wording', () => {
    render(<StatusDot status="warn" statusLabel="Degraded" />);
    expect(screen.getByRole('img', { name: 'Degraded' })).toBeTruthy();
  });
});
