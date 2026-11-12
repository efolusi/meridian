import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Drawer, DrawerContent, DrawerTitle } from '../components/overlay/Drawer.jsx';

// modal={false} was silently ignored. Deprecation policy: keep accepting it,
// warn in development, remove in the next major.
describe('Drawer modal={false}', () => {
  it('warns once that the prop is ignored and still renders a modal drawer', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ui = <Drawer open modal={false} onOpenChange={() => {}}><DrawerContent><DrawerTitle>Filters</DrawerTitle></DrawerContent></Drawer>;
    const first = render(ui);
    first.unmount();
    render(ui);
    const calls = warn.mock.calls.filter(([msg]) => String(msg).includes('modal={false}'));
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toMatch(/deprecated.*next major/);
    expect(document.querySelector('[role="dialog"]').getAttribute('aria-modal')).toBe('true');
    warn.mockRestore();
  });

  it('says nothing when modal is left alone', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Drawer open onOpenChange={() => {}}><DrawerContent><DrawerTitle>Filters</DrawerTitle></DrawerContent></Drawer>);
    expect(warn.mock.calls.filter(([msg]) => String(msg).includes('Drawer'))).toHaveLength(0);
    warn.mockRestore();
  });
});
