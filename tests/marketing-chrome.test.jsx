import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { SiteHeader } from '../components/marketing/SiteHeader.jsx';
import { SiteFooter } from '../components/marketing/SiteFooter.jsx';
import { LanguageSwitch } from '../components/marketing/LanguageSwitch.jsx';
import { LegalDocument, parseLegalInline } from '../components/marketing/LegalDocument.jsx';
import { Marquee, inertProp } from '../components/marketing/Marquee.jsx';
import { renderToString } from 'react-dom/server';

describe('SiteHeader', () => {
  const links = [{ label: 'Docs', href: '/docs', current: true }, { label: 'Pricing', href: '/pricing' }];

  it('starts with the skip link and marks the current page', () => {
    const { container, getAllByRole } = render(<SiteHeader brand="Komando" links={links} />);
    expect(container.querySelector('a').className).toContain('ef-skip');
    expect(getAllByRole('link', { name: 'Docs' })[0].getAttribute('aria-current')).toBe('page');
    expect(getAllByRole('link', { name: 'Pricing' })[0].hasAttribute('aria-current')).toBe(false);
  });

  it('opens the mobile menu, closes it with Escape and returns focus to the button', () => {
    const { getByRole, container } = render(<SiteHeader brand="Komando" links={links} lang="id" />);
    const button = getByRole('button', { name: 'Menu' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById(button.getAttribute('aria-controls')).hasAttribute('data-open')).toBe(true);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
    expect(getByRole('navigation', { name: 'Utama' })).toBeTruthy();
  });

  it('shows the actions slot', () => {
    const { getAllByRole } = render(<SiteHeader brand="Komando" actions={<button type="button">Sign in</button>} />);
    expect(getAllByRole('button', { name: 'Sign in' }).length).toBeGreaterThan(0);
  });

  // MD131: one way to switch language. The slot takes a LanguageSwitch (as SiteFooter does); the old
  // { label, href, hrefLang, ariaLabel } object, which drew one plain text link, is gone.
  it('takes a LanguageSwitch in the languageSwitch slot, in the bar and in the mobile panel', () => {
    const languages = [{ code: 'id', label: 'ID', href: '/id', name: 'Bahasa Indonesia' }, { code: 'en', label: 'EN', href: '/en', name: 'English' }];
    const { container } = render(<SiteHeader brand="Komando" languageSwitch={<LanguageSwitch languages={languages} current="en" />} />);
    const bar = container.querySelector('.ef-site-header__actions');
    const panel = container.querySelector('.ef-site-header__panel');
    expect(bar.querySelector('[data-slot="language-switch"]')).toBeTruthy();
    expect(panel.querySelector('[data-slot="language-switch"]')).toBeTruthy();
    expect(bar.querySelector('a[hreflang="id"]').getAttribute('href')).toBe('/id');
  });

  it('draws nothing for the language when no slot is given', () => {
    const { container } = render(<SiteHeader brand="Komando" />);
    expect(container.querySelector('[data-slot="language-switch"]')).toBeNull();
  });
});

describe('SiteFooter', () => {
  it('names each column nav by its heading and marks links that open a new tab', () => {
    const { getByRole } = render(
      <SiteFooter lang="id" columns={[{ heading: 'Legal', links: [{ label: 'Terms', href: '/terms' }, { label: 'Status', href: 'https://status.example' }] }]}
        socials={[{ label: 'GitHub', href: 'https://github.com/efolusi', icon: <svg aria-hidden="true" /> }]} />,
    );
    expect(getByRole('navigation', { name: 'Legal' })).toBeTruthy();
    const status = getByRole('link', { name: 'Status (membuka tab baru)' });
    expect(status.getAttribute('target')).toBe('_blank');
    expect(status.getAttribute('rel')).toBe('noopener noreferrer');
    expect(getByRole('link', { name: 'Terms' }).hasAttribute('target')).toBe(false);
    expect(getByRole('link', { name: 'GitHub (membuka tab baru)' })).toBeTruthy();
  });
});

describe('LegalDocument', () => {
  it('reads [label](href) and **strong** only, with {lang} filled in', () => {
    expect(parseLegalInline('See [terms](/{lang}/terms#refunds) and **this**.', 'id')).toEqual([
      { type: 'text', text: 'See ' },
      { type: 'link', text: 'terms', href: '/id/terms#refunds' },
      { type: 'text', text: ' and ' },
      { type: 'strong', text: 'this' },
      { type: 'text', text: '.' },
    ]);
  });

  it('never renders HTML or an unsafe link', () => {
    const { container } = render(<LegalDocument title="Terms" intro={['<b>x</b> [bad](javascript:alert(1)) [proto](//evil.example) [slash](/\\evil.example) [ok](https://efolusi.com)']} />);
    expect(container.querySelector('b')).toBeNull();
    const anchors = [...container.querySelectorAll('a')];
    expect(anchors.map((a) => a.getAttribute('href'))).toEqual(['https://efolusi.com']);
    expect(container.textContent).toContain('bad');
  });

  it('gives each section a stable id and lists it in the contents', () => {
    const { container, getByRole } = render(<LegalDocument title="Privacy" contentsLabel="Contents" sections={[{ id: 'refunds', head: 'Refunds', blocks: ['Text', { ul: ['One'] }] }]} />);
    expect(container.querySelector('h2#refunds').textContent).toBe('Refunds');
    expect(getByRole('navigation', { name: 'Contents' }).querySelector('a').getAttribute('href')).toBe('#refunds');
    expect(container.querySelector('article')).toBeTruthy();
  });
});

describe('Marquee with links (MD10)', () => {
  it('makes the moving copies inert and shows the list when one of its links takes focus', () => {
    const items = [<a key="a" href="/komando">Komando</a>, 'Private'];
    const { container, getAllByRole } = render(<Marquee label="Products" items={items} />);
    expect(container.querySelector('.ef-marquee__viewport').hasAttribute('inert')).toBe(true);
    const links = getAllByRole('link', { name: 'Komando' });
    expect(links).toHaveLength(1);
    const css = document.getElementById('ef-css-marquee').textContent.replace(/\s+/g, '');
    expect(css).toMatch(/\.ef-marquee__list:focus-within\{position:static;[^}]*clip:auto/);
    expect(css).toMatch(/\.ef-marquee__list:focus-within~\.ef-marquee__viewport\{display:none\}/);
  });
});

describe('Marquee before hydration (MD11)', () => {
  it('server-renders the moving copies inert, so their links never take Tab focus', () => {
    const html = renderToString(<Marquee label="Products" items={[<a key="a" href="/komando">Komando</a>]} />);
    expect(html).toMatch(/class="ef-marquee__viewport" aria-hidden="true" inert=""/);
  });
});

describe('inertProp for each React major', () => {
  it('is an empty string on React 18 and true on React 19 and later', () => {
    expect(inertProp('18.3.1')).toEqual({ inert: '' });
    expect(inertProp('19.0.0')).toEqual({ inert: true });
    expect(inertProp('20.1.0')).toEqual({ inert: true });
  });
});
