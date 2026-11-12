import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedControl } from '../components/navigation/SegmentedControl.jsx';
import { PageControl } from '../components/navigation/PageControl.jsx';
import { SideNav } from '../components/navigation/SideNav.jsx';

// A <button> without a type is a submit button. These controls render plain
// buttons, so one placed in a form (a settings page, a filter bar) submitted
// it on every click.
describe('navigation controls do not submit an enclosing form', () => {
  it.each([
    ['SegmentedControl', () => <SegmentedControl options={['Day', 'Week']} value="Day" onChange={() => {}} />, 'Week'],
    ['PageControl', () => <PageControl count={3} index={0} onChange={() => {}} />, 'Page 2 of 3'],
    ['SideNav', () => <SideNav groups={[{ items: [{ id: 'home', label: 'Home', icon: 'house' }, { id: 'inbox', label: 'Inbox', icon: 'inbox' }] }]} value="home" onChange={() => {}} />, 'Inbox'],
  ])('%s', async (_name, ui, name) => {
    const onSubmit = vi.fn(e => e.preventDefault());
    render(<form onSubmit={onSubmit}>{ui()}</form>);
    await userEvent.click(screen.getByRole(_name === 'PageControl' ? 'tab' : 'button', { name }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('SideNav marks the current item', () => {
    render(<SideNav groups={[{ items: [{ id: 'home', label: 'Home', icon: 'house' }, { id: 'inbox', label: 'Inbox', icon: 'inbox' }] }]} value="inbox" />);
    expect(screen.getByRole('button', { name: 'Inbox' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: 'Home' }).hasAttribute('aria-current')).toBe(false);
  });
});
