import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkipLink } from '../components/navigation/SkipLink.jsx';

// A plain jump wrote #main into location.hash, which a hash-based router
// reads as a route, and moved focus only when the target had tabindex.
describe('SkipLink moves focus itself', () => {
  it('focuses the target, adds tabIndex=-1 when missing, and leaves the hash alone', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/inbox';
    render(<><SkipLink /><main id="main">Content</main></>);
    await user.click(screen.getByRole('link', { name: 'Skip to content' }));
    const main = screen.getByRole('main');
    expect(document.activeElement).toBe(main);
    expect(main.getAttribute('tabindex')).toBe('-1');
    expect(window.location.hash).toBe('#/inbox');
  });

  it('keeps an existing tabindex and honours a cancelling onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn(e => e.preventDefault());
    render(<><SkipLink href="#content" onClick={onClick} /><section id="content" tabIndex={0}>Content</section></>);
    await user.click(screen.getByRole('link', { name: 'Skip to content' }));
    expect(onClick).toHaveBeenCalled();
    expect(document.activeElement).not.toBe(screen.getByText('Content'));
    expect(screen.getByText('Content').getAttribute('tabindex')).toBe('0');
  });
});
