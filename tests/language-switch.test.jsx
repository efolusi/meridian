import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { render } from '@testing-library/react';
import { LanguageSwitch } from '../components/marketing/LanguageSwitch.jsx';

// MD112: the shared language switch. Each language is a link with hreflang and lang; the current one is not a link.
const languages = [
  { code: 'id', label: 'ID', href: '/id/docs', name: 'Bahasa Indonesia' },
  { code: 'en', label: 'EN', href: '/en/docs', name: 'English' },
];

describe('LanguageSwitch', () => {
  it('renders a named nav with one list item per language', () => {
    const { container } = render(<LanguageSwitch languages={languages} current="id" />);
    const nav = container.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Language');
    expect(nav.getAttribute('data-slot')).toBe('language-switch');
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('links the other language with href, hreflang and lang set to its code', () => {
    const { container } = render(<LanguageSwitch languages={languages} current="id" />);
    const link = container.querySelector('a');
    expect(link.getAttribute('href')).toBe('/en/docs');
    expect(link.getAttribute('hreflang')).toBe('en');
    expect(link.getAttribute('lang')).toBe('en');
    expect(link.textContent).toBe('EN');
    expect(link.hasAttribute('aria-current')).toBe(false);
    expect(container.querySelectorAll('a')).toHaveLength(1);
  });

  it('marks the current language with aria-current="true", gives it lang, and leaves it without an href', () => {
    const { container } = render(<LanguageSwitch languages={languages} current="id" />);
    const current = container.querySelector('[aria-current="true"]');
    expect(current.textContent).toBe('ID');
    expect(current.getAttribute('lang')).toBe('id');
    expect(current.tagName).not.toBe('A');
    expect(current.hasAttribute('href')).toBe(false);
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(1);
  });

  it('names each language in its own language, with the visible code inside the name', () => {
    const { container } = render(<LanguageSwitch languages={languages} current="en" />);
    expect(container.querySelector('a').getAttribute('aria-label')).toBe('Bahasa Indonesia (ID)');
    expect(container.querySelector('[aria-current="true"]').getAttribute('aria-label')).toBe('English (EN)');
  });

  it('falls back to the built-in own-language name for en and id when name is missing', () => {
    const { container } = render(<LanguageSwitch languages={languages.map(({ name, ...l }) => l)} current="en" />);
    expect(container.querySelector('a').getAttribute('aria-label')).toBe('Bahasa Indonesia (ID)');
  });

  it('renders every language as a link when current matches none', () => {
    const { container } = render(<LanguageSwitch languages={languages} current="fr" />);
    expect(container.querySelectorAll('a')).toHaveLength(2);
    expect(container.querySelector('[aria-current]')).toBeNull();
  });

  it('names the nav in the page language and lets labels override it', () => {
    const id = render(<LanguageSwitch languages={languages} current="id" lang="id" />);
    expect(id.container.querySelector('nav').getAttribute('aria-label')).toBe('Bahasa');
    const custom = render(<LanguageSwitch languages={languages} current="id" labels={{ nav: 'Pick a language' }} />);
    expect(custom.container.querySelector('nav').getAttribute('aria-label')).toBe('Pick a language');
  });

  it('takes a size and defaults to md', () => {
    const md = render(<LanguageSwitch languages={languages} current="id" />);
    expect(md.container.querySelector('nav').getAttribute('data-size')).toBe('md');
    const sm = render(<LanguageSwitch languages={languages} current="id" size="sm" />);
    expect(sm.container.querySelector('nav').getAttribute('data-size')).toBe('sm');
  });

  it('forwards the ref and extra props to the nav, and merges the class', () => {
    const ref = { current: null };
    const { container } = render(<LanguageSwitch ref={ref} languages={languages} current="id" className="mine" data-x="1" />);
    expect(ref.current).toBe(container.querySelector('nav'));
    expect(ref.current.className).toBe('ef-language-switch mine');
    expect(ref.current.getAttribute('data-x')).toBe('1');
  });

  it('server-renders the same markup and uses no id', () => {
    const html = renderToString(<LanguageSwitch languages={languages} current="id" />);
    // React writes the attribute as hrefLang; an HTML parser reads it case-insensitively.
    expect(html).toMatch(/hreflang="en"/i);
    expect(html).not.toMatch(/\sid="/);
  });
});
