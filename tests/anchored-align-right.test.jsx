import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Menu } from '../components/overlay/Menu.jsx';
import { Button } from '../components/forms/Button.jsx';

// An align="right" panel opened at the far right of the viewport landed against
// the LEFT edge instead of under its trigger: the panel class pinned right: 0
// while the first-frame inline style pinned left: 0, so the panel stretched
// across the viewport, was measured at that width, and the edge clamp then had
// nowhere to put it.
//
// jsdom reports zero-size rects, so the resulting position cannot be asserted
// here. What is asserted instead is that the cause is gone from both halves: the
// stylesheet no longer pins an edge on these panels, and the inline style pins
// the opposite edges to auto. Checking only the placed inline style would prove
// nothing — that style is written after placement and always looked correct.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('anchored panels, align="right"', () => {
  it('does not pin panel edges in CSS, for any anchored overlay', () => {
    for (const file of ['Menu', 'Popover', 'HoverCard']) {
      const src = readFileSync(join(process.cwd(), 'components', 'overlay', `${file}.jsx`), 'utf8');
      const css = src.slice(src.indexOf('const CSS = `'), src.indexOf('`;'));
      const offenders = [...css.matchAll(/__panel--(?:left|right|top|bottom)\s*\{[^}]*\b(?:left|right|top|bottom)\s*:/g)];
      expect(offenders.map(m => m[0]), `${file}.jsx pins an edge the placement also sets`).toEqual([]);
    }
  });

  it('pins right/bottom to auto so the panel is never stretched between both edges', async () => {
    render(
      <Menu
        align="right"
        trigger={<Button>Manage</Button>}
        items={[{ id: 'a', label: 'Suspend account' }]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Manage' }));
    const panel = screen.getByRole('menu');
    expect(panel.className).toContain('ef-menu__panel--right');
    expect(panel.style.right, 'the class sets right: 0; the inline style must win').toBe('auto');
    expect(panel.style.bottom).toBe('auto');
    expect(panel.style.position).toBe('fixed');
  });
});
