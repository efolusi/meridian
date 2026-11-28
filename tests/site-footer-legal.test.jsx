import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { render } from '@testing-library/react';
import { SiteFooter } from '../components/marketing/SiteFooter.jsx';
import { LanguageSwitch } from '../components/marketing/LanguageSwitch.jsx';

// MD111: the legal row of the footer: legal links, and a copyright year that is computed, never typed.
const legal = [
  { label: 'Platform terms', href: '/en/terms' },
  { label: 'Privacy notice', href: '/en/privacy' },
];

describe('SiteFooter legal row (MD111)', () => {
  afterEach(() => vi.useRealTimers());

  it('renders the legal links as a named nav inside the bottom row', () => {
    const { container } = render(<SiteFooter name="PT Efolusi Dunia Teknologi" year={2031} legal={legal} />);
    const nav = container.querySelector('.ef-site-footer__bottom nav');
    expect(nav.getAttribute('aria-label')).toBe('Legal');
    const links = [...nav.querySelectorAll('a')];
    expect(links.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([['Platform terms', '/en/terms'], ['Privacy notice', '/en/privacy']]);
    expect(links.every((a) => !a.hasAttribute('target'))).toBe(true);
  });

  it('names the legal nav in Indonesian with lang="id", and labels override it', () => {
    const id = render(<SiteFooter name="PT Efolusi" year={2031} legal={legal} lang="id" />);
    expect(id.container.querySelector('.ef-site-footer__bottom nav').getAttribute('aria-label')).toBe('Informasi hukum');
    const custom = render(<SiteFooter name="PT Efolusi" year={2031} legal={legal} labels={{ legal: 'Policies' }} />);
    expect(custom.container.querySelector('.ef-site-footer__bottom nav').getAttribute('aria-label')).toBe('Policies');
  });

  it('prints © {year} {name} with the pinned year', () => {
    const { container } = render(<SiteFooter name="PT Efolusi Dunia Teknologi" year={2031} />);
    expect(container.querySelector('.ef-site-footer__copyright').textContent).toBe('© 2031 PT Efolusi Dunia Teknologi');
  });

  it('computes the year from the clock at render when no year is given', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2033-06-15T12:00:00Z'));
    const { container } = render(<SiteFooter name="PT Efolusi" />);
    expect(container.querySelector('.ef-site-footer__copyright').textContent).toBe('© 2033 PT Efolusi');
    vi.setSystemTime(new Date('2034-01-02T12:00:00Z'));
    const next = render(<SiteFooter name="PT Efolusi" />);
    expect(next.container.querySelector('.ef-site-footer__copyright').textContent).toBe('© 2034 PT Efolusi');
  });

  it('lets the year prop win over the clock', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2040-03-01T12:00:00Z'));
    const { container } = render(<SiteFooter name="PT Efolusi" year={2031} />);
    expect(container.querySelector('.ef-site-footer__copyright').textContent).toBe('© 2031 PT Efolusi');
  });

  it('renders a range from since to the year, and "sampai" in Indonesian', () => {
    const en = render(<SiteFooter name="PT Efolusi" since={2029} year={2031} />);
    expect(en.container.querySelector('.ef-site-footer__copyright').textContent).toBe('© 2029 to 2031 PT Efolusi');
    const id = render(<SiteFooter name="PT Efolusi" since={2029} year={2031} lang="id" />);
    expect(id.container.querySelector('.ef-site-footer__copyright').textContent).toBe('© 2029 sampai 2031 PT Efolusi');
  });

  it('prints one year when since is the year or later', () => {
    for (const since of [2031, 2032]) {
      const { container } = render(<SiteFooter name="PT Efolusi" since={since} year={2031} />);
      expect(container.querySelector('.ef-site-footer__copyright').textContent).toBe('© 2031 PT Efolusi');
    }
  });

  it('prints no copyright line without a name', () => {
    const { container } = render(<SiteFooter year={2031} legal={legal} />);
    expect(container.querySelector('.ef-site-footer__copyright')).toBeNull();
  });

  it('takes a LanguageSwitch in the language slot of the bottom row', () => {
    const languages = [{ code: 'id', label: 'ID', href: '/id/' }, { code: 'en', label: 'EN', href: '/en/' }];
    const { container } = render(<SiteFooter name="PT Efolusi" year={2031} languageSwitch={<LanguageSwitch languages={languages} current="en" size="sm" />} />);
    const slot = container.querySelector('.ef-site-footer__bottom .ef-language-switch');
    expect(slot.getAttribute('data-size')).toBe('sm');
    expect(slot.querySelector('a').getAttribute('hreflang')).toBe('id');
  });

  it('keeps the existing bottom row and props source-compatible: bottom alone renders the same markup', () => {
    const html = renderToString(<SiteFooter brand="Komando" bottom={<span>Built by Efolusi.</span>} />);
    expect(html).toContain('<div class="ef-site-footer__bottom"><span>Built by Efolusi.</span></div>');
    expect(html).not.toContain('copyright');
    expect(html).not.toContain('ef-site-footer__legal');
  });

  it('renders no bottom row when nothing is given for it', () => {
    const { container } = render(<SiteFooter brand="Komando" />);
    expect(container.querySelector('.ef-site-footer__bottom')).toBeNull();
  });

  it('server-renders the pinned year the same way', () => {
    // React separates adjacent text nodes with <!-- --> in a server render; the text a reader gets is the same.
    const html = renderToString(<SiteFooter name="PT Efolusi" year={2031} since={2029} legal={legal} />).replaceAll('<!-- -->', '');
    expect(html).toContain('© 2029 to 2031 PT Efolusi');
  });

  it('opens an external legal link in a new tab and says so', () => {
    const { container } = render(<SiteFooter name="PT Efolusi" year={2031} legal={[{ label: 'Status', href: 'https://status.example.org/' }]} />);
    const a = container.querySelector('.ef-site-footer__legal a');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.textContent).toContain('(opens in a new tab)');
  });
});
