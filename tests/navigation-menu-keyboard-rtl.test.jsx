import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuIndicator } from '../components/navigation/NavigationMenu.jsx';

function Menu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem value="docs"><NavigationMenuTrigger>Docs</NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink href="/intro">Intro</NavigationMenuLink></NavigationMenuContent></NavigationMenuItem>
        <NavigationMenuItem value="blog"><NavigationMenuTrigger>Blog</NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink href="/posts">Posts</NavigationMenuLink></NavigationMenuContent></NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator data-testid="indicator" />
    </NavigationMenu>
  );
}

describe('NavigationMenu', () => {
  // Enter queued the focus move in a requestAnimationFrame that read the
  // viewport node captured before the open. On the first open there was no
  // viewport yet, so focus stayed on the trigger.
  it('Enter on a trigger moves focus into the panel on the first open', async () => {
    const user = userEvent.setup();
    render(<Menu />);
    screen.getByRole('button', { name: 'Docs' }).focus();
    await user.keyboard('{Enter}');
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Intro' }));
  });

  // The indicator is placed with inset-inline-start, which counts from the
  // right in RTL, but its offset was always measured from the left edge.
  it('places the indicator from the inline start in RTL', async () => {
    const user = userEvent.setup();
    render(<div dir="rtl"><Menu /></div>);
    const nav = document.querySelector('[data-slot="navigation-menu"]');
    const docs = screen.getByRole('button', { name: 'Docs' });
    nav.getBoundingClientRect = () => ({ left: 0, right: 600, top: 0, bottom: 40, width: 600, height: 40 });
    // first trigger sits at the right edge in RTL
    docs.getBoundingClientRect = () => ({ left: 500, right: 580, top: 0, bottom: 40, width: 80, height: 40 });
    await user.click(docs);
    expect(screen.getByTestId('indicator').style.insetInlineStart).toBe('20px');
  });
});
