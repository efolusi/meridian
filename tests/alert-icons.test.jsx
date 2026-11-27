import React from 'react';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Icon fetches an SVG by name; the stand-in prints the name so the test can read which glyph Alert chose.
vi.mock('../components/icons/Icon.jsx', () => ({
  Icon: ({ name, size, ...rest }) => <span {...rest} data-slot="icon" data-name={name} data-size={size} aria-hidden="true" />,
}));
const { Alert, AlertAction, AlertDescription, AlertTitle } = await import('../components/feedback/Alert.jsx');
const { Icon } = await import('../components/icons/Icon.jsx');

const alertCss = () => /const CSS = `([\s\S]*?)`;/.exec(readFileSync('components/feedback/Alert.jsx', 'utf8'))[1];
const rule = (css, selector) => css.slice(css.indexOf(`\n${selector}{`) + 1, css.indexOf('}', css.indexOf(`\n${selector}{`)));

// MD71: danger versus default differed only by colour, and an alert with no icon kept a 28px indent for nothing.
describe('Alert default icons (MD71)', () => {
  const NAMES = { default: 'info', success: 'circle-check', warning: 'triangle-alert', danger: 'circle-alert' };

  for (const [variant, name] of Object.entries(NAMES)) {
    it(`${variant} shows the ${name} icon when the caller gives none, so state is not colour alone`, () => {
      render(<Alert variant={variant} data-testid="alert"><AlertTitle>T</AlertTitle></Alert>);
      const icons = screen.getByTestId('alert').querySelectorAll('[data-slot="icon"]');
      expect(icons).toHaveLength(1);
      expect(icons[0].getAttribute('data-name')).toBe(name);
      expect(icons[0].parentElement).toBe(screen.getByTestId('alert'));
    });
  }

  it('defaults to the default variant', () => {
    render(<Alert data-testid="alert"><AlertTitle>T</AlertTitle></Alert>);
    expect(screen.getByTestId('alert').querySelector('[data-slot="icon"]').getAttribute('data-name')).toBe('info');
  });

  it('keeps the caller icon and adds none: an Icon, a raw svg or a data-slot icon', () => {
    const { rerender } = render(<Alert data-testid="alert"><Icon name="shield" /><AlertTitle>T</AlertTitle></Alert>);
    const count = () => screen.getByTestId('alert').querySelectorAll('[data-slot="icon"], svg').length;
    expect(count()).toBe(1);
    expect(screen.getByTestId('alert').querySelector('[data-slot="icon"]').getAttribute('data-name')).toBe('shield');
    rerender(<Alert data-testid="alert"><svg aria-hidden="true" /><AlertTitle>T</AlertTitle></Alert>);
    expect(count()).toBe(1);
    rerender(<Alert data-testid="alert"><span data-slot="icon" /><AlertTitle>T</AlertTitle></Alert>);
    expect(count()).toBe(1);
  });

  it('takes `icon` as a name, and `icon={false}` for no icon at all', () => {
    const { rerender } = render(<Alert icon="shield" data-testid="alert"><AlertTitle>T</AlertTitle></Alert>);
    expect(screen.getByTestId('alert').querySelector('[data-slot="icon"]').getAttribute('data-name')).toBe('shield');
    rerender(<Alert icon={false} data-testid="alert"><AlertTitle>T</AlertTitle></Alert>);
    expect(screen.getByTestId('alert').querySelector('[data-slot="icon"]')).toBeNull();
  });

  it('does not pass `icon` to the div and keeps role alert', () => {
    render(<Alert icon="shield" data-testid="alert"><AlertTitle>T</AlertTitle></Alert>);
    expect(screen.getByRole('alert').hasAttribute('icon')).toBe(false);
  });

  it('puts the icon before the title, ahead of an action', () => {
    render(<Alert variant="danger" data-testid="alert"><AlertTitle>T</AlertTitle><AlertAction><button>Retry</button></AlertAction></Alert>);
    const kids = [...screen.getByTestId('alert').children].map((c) => c.getAttribute('data-slot'));
    expect(kids).toEqual(['icon', 'alert-title', 'alert-action']);
  });
});

// The icon is any [data-slot=icon] that is not inside the title, description or action; the parts are found by class and by
// descendant, never as direct children (MD74 round 6, see the wrapper tests below).
const ICON = '[data-slot=icon]:not(:is(.ef-alert__title,.ef-alert__description,.ef-alert__action) *)';

describe('Alert grid has no gap without an icon (MD71)', () => {
  it('is one column with no column gap by default, two columns with a 12px gap when it has an icon', () => {
    const css = alertCss();
    expect(rule(css, '.ef-alert')).toMatch(/grid-template-columns:minmax\(0,1fr\)/);
    expect(rule(css, '.ef-alert')).toMatch(/gap:var\(--space-0-5\) 0/);
    expect(rule(css, '.ef-alert')).not.toMatch(/grid-template-columns:0 /);
    expect(rule(css, `.ef-alert:has(${ICON})`)).toMatch(/grid-template-columns:auto minmax\(0,1fr\)/);
    expect(rule(css, `.ef-alert:has(${ICON})`)).toMatch(/column-gap:var\(--space-3\)/);
  });

  it('puts title and description in the first column, or the second when an icon takes the first', () => {
    const css = alertCss();
    expect(rule(css, '.ef-alert .ef-alert__title,.ef-alert .ef-alert__description')).toBe('.ef-alert .ef-alert__title,.ef-alert .ef-alert__description{grid-column:1');
    expect(rule(css, `.ef-alert:has(${ICON}) .ef-alert__title,.ef-alert:has(${ICON}) .ef-alert__description`)).toMatch(/grid-column:2/);
  });
});

// MD74 round 5: the starter smoke fetched info.svg on a page whose Alert already carries its own triangle-alert Icon, so the
// default icon was rendered next to the caller's (the DC runtime that renders the starters builds the children outside the
// element-type check). A caller icon must replace the default whatever built it, so the default icon is marked and the CSS
// hides it as soon as the Alert has any other icon child.
describe('the default icon steps aside for any other icon (MD74 round 5)', () => {
  it('marks the default icon so the stylesheet can find it, and not a caller icon', () => {
    render(<Alert data-testid="alert"><AlertTitle>T</AlertTitle></Alert>);
    const icon = screen.getByTestId('alert').querySelector('[data-slot="icon"]');
    expect(icon.hasAttribute('data-alert-default')).toBe(true);
    render(<Alert data-testid="own"><Icon name="shield" /><AlertTitle>T</AlertTitle></Alert>);
    expect(screen.getByTestId('own').querySelector('[data-alert-default]')).toBeNull();
  });

  it('hides the marked icon when another icon is in the alert, and keeps the layout rules for the caller icon', () => {
    const css = alertCss();
    expect(css).toContain('.ef-alert:has([data-slot=icon]:not([data-alert-default]):not(:is(.ef-alert__title,.ef-alert__description,.ef-alert__action) *)) [data-alert-default]{display:none}');
    expect(css).toContain(`.ef-alert ${ICON}{grid-column:1;grid-row:1/3;`);
  });
});

// MD74 round 6: the starters' DC runtime wraps every x-import in <div class="sc-host-x" style="display:contents">, so the Alert's
// icon, title and description are NOT direct children. A child combinator (.ef-alert>.ef-alert__title) cannot see through such a
// wrapper: the title and description fell into auto-placed cells, the icon column grew to the description's width and the
// title sat in a 0px column, its words overflowing to the right (+1px of document scroll at 768px, +2px in CI). Measured in the
// Orca browser on starters/docs-page/Authentication.dc.html: grid columns '642px 0px' before, '16px 626px' after.
describe('the Alert layout survives wrapper elements around its parts (MD74 round 6)', () => {
  it('uses no child combinator for the parts or the icon, which a display:contents wrapper hides', () => {
    expect(alertCss()).not.toMatch(/\.ef-alert\s*>/);
    expect(alertCss()).not.toMatch(/:has\(\s*>/);
  });

  // jsdom has no engine for the stylesheet's complex :not(), so the icon rule is run as the same test in script: a
  // [data-slot=icon] with no title, description or action ancestor. The browser run is in the commit message.
  const alertIcons = (alert) => [...alert.querySelectorAll('[data-slot=icon]')].filter((n) => !n.closest('.ef-alert__title,.ef-alert__description,.ef-alert__action'));

  it('finds the title, description, action and icon through wrappers, and leaves icons inside the parts alone', () => {
    const wrap = (el) => <div className="sc-host-x" style={{ display: 'contents' }}>{el}</div>;
    const { container } = render(
      <Alert icon={false}>
        {wrap(<Icon name="shield" />)}
        {wrap(<AlertTitle>T <Icon name="info" /></AlertTitle>)}
        {wrap(<AlertDescription>D</AlertDescription>)}
        {wrap(<AlertAction><button type="button"><Icon name="x" /></button></AlertAction>)}
      </Alert>,
    );
    const alert = container.querySelector('.ef-alert');
    expect(alertIcons(alert).map((n) => n.getAttribute('data-name'))).toEqual(['shield']);
    expect(alert.querySelector('.ef-alert__title')).not.toBeNull();
    expect(alert.querySelector('.ef-alert__action')).not.toBeNull();
    // None of them is a direct child of the alert, which is exactly what the old child combinators needed.
    expect([...alert.children].every((c) => c.classList.contains('sc-host-x'))).toBe(true);
  });

  it('does not take an icon that sits only inside the action for the alert icon', () => {
    const { container } = render(<Alert icon={false}><AlertTitle>T</AlertTitle><AlertAction><button type="button"><Icon name="x" /></button></AlertAction></Alert>);
    expect(alertIcons(container.querySelector('.ef-alert'))).toHaveLength(0);
  });
});
