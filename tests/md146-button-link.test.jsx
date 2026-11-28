import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button, buttonVariants } from '../components/forms/Button.jsx';

// MD146: Button renders a link. `href` draws an <a>; `asChild` gives the classes, the state and the inner markup to the
// consumer's own link (a router Link). One function draws the inner markup, so the <a>, the consumer's link and the <button>
// cannot drift in the bubble, its data-turn, the spinner or the icon size.
const inner = (el) => el.innerHTML;

// A stand-in for a router link: a component that renders an <a> from its own props and forwards its ref.
const RouterLink = React.forwardRef(function RouterLink({ locale, to, children, ...props }, ref) {
  return <a ref={ref} href={`/${locale}${to}`} data-router {...props}>{children}</a>;
});

const CASES = [
  { label: 'plain', props: {} },
  { label: 'left and right icons', props: { iconLeft: 'plus', iconRight: 'arrow-right' } },
  { label: 'bubble md', props: { iconBubble: 'arrow-right' } },
  { label: 'bubble lg turning', props: { size: 'lg', iconBubble: 'arrow-up-right' } },
  { label: 'bubble xl band', props: { size: 'xl', variant: 'band', shape: 'pill', iconBubble: 'arrow-up-right' } },
  { label: 'bubble where it does not fit', props: { variant: 'ghost', iconBubble: 'arrow-right' } },
  { label: 'loading', props: { iconLeft: 'plus', loading: true } },
  { label: 'loading with a bubble', props: { size: 'xl', iconLeft: 'plus', iconBubble: 'arrow-up-right', loading: true } },
  { label: 'small', props: { size: 'sm', iconLeft: 'download' } },
];

describe('Button as a link (MD146)', () => {
  it.each(CASES)('draws the same classes and inner markup on the <a>, the consumer link and the <button>: $label', ({ props }) => {
    const button = render(<Button {...props}>Start free</Button>).container.querySelector('button');
    const anchor = render(<Button href="/start" {...props}>Start free</Button>).container.querySelector('a');
    const child = render(<Button asChild {...props}><RouterLink locale="id" to="/start">Start free</RouterLink></Button>).container.querySelector('a');
    expect(anchor.tagName).toBe('A');
    expect(anchor.className).toBe(button.className);
    expect(inner(anchor)).toBe(inner(button));
    expect(child.className).toBe(button.className);
    expect(inner(child)).toBe(inner(button));
    expect(child.getAttribute('href')).toBe('/id/start');
  });

  it('keeps the arrow-up-right bubble turnable on a link: data-turn is on the bubble', () => {
    const { container } = render(<Button href="/x" size="xl" iconBubble="arrow-up-right">See</Button>);
    expect(container.querySelector('a .ef-btn__bubble[data-turn]')).not.toBeNull();
    expect(container.querySelector('a').lastElementChild.classList.contains('ef-btn__bubble')).toBe(true);
    const plain = render(<Button href="/x" size="xl" iconBubble="arrow-right">Go</Button>).container;
    expect(plain.querySelector('.ef-btn__bubble[data-turn]')).toBeNull();
  });

  it('has the classes buttonVariants builds, with no disabled attribute and no type', () => {
    const { container } = render(<Button href="/x" variant="secondary" size="lg" shape="pill" fullWidth>Docs</Button>);
    const a = container.querySelector('a');
    expect(a.className).toBe(buttonVariants({ variant: 'secondary', size: 'lg', shape: 'pill', fullWidth: true }));
    expect(a.getAttribute('href')).toBe('/x');
    expect(a.hasAttribute('disabled')).toBe(false);
    expect(a.hasAttribute('aria-disabled')).toBe(false);
    expect(a.hasAttribute('tabindex')).toBe(false);
    expect(a.hasAttribute('aria-busy')).toBe(false);
    expect(a.hasAttribute('type')).toBe(false);
  });

  it('passes target, rel, download, hrefLang, native attributes, a ref, a class and a style to the <a>', () => {
    const ref = React.createRef();
    const click = vi.fn();
    const { container } = render(<Button ref={ref} href="#file" target="_blank" rel="noopener" download hrefLang="id" data-test="x" aria-label="Get the file" className="mine" style={{ marginTop: 3 }} onClick={click}>File</Button>);
    const a = container.querySelector('a');
    expect(ref.current).toBe(a);
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toBe('noopener');
    expect(a.hasAttribute('download')).toBe(true);
    expect(a.getAttribute('hreflang')).toBe('id');
    expect(a.dataset.test).toBe('x');
    expect(a.getAttribute('aria-label')).toBe('Get the file');
    expect(a.classList.contains('mine')).toBe(true);
    expect(a.style.marginTop).toBe('3px');
    fireEvent.click(a);
    expect(click).toHaveBeenCalledOnce();
  });

  it.each([['disabled', { disabled: true }], ['loading', { loading: true }]])('a %s link says aria-disabled, leaves the tab order and swallows the click and the middle click', (_, props) => {
    const click = vi.fn();
    const aux = vi.fn();
    const { container } = render(<Button href="/x" onClick={click} onAuxClick={aux} {...props}>Go</Button>);
    const a = container.querySelector('a');
    expect(a.getAttribute('aria-disabled')).toBe('true');
    expect(a.getAttribute('tabindex')).toBe('-1');
    expect(a.hasAttribute('disabled')).toBe(false);
    expect(a.getAttribute('href')).toBe('/x');
    // fireEvent returns false when preventDefault was called, so the browser would not follow the link.
    expect(fireEvent.click(a)).toBe(false);
    expect(fireEvent(a, new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 }))).toBe(false);
    expect(click).not.toHaveBeenCalled();
    expect(aux).not.toHaveBeenCalled();
  });

  it('a loading link sets aria-busy and data-loading and draws the spinner; a disabled one is not busy', () => {
    const loading = render(<Button href="/x" loading>Saving</Button>).container.querySelector('a');
    expect(loading.getAttribute('aria-busy')).toBe('true');
    expect(loading.hasAttribute('data-loading')).toBe(true);
    expect(loading.querySelectorAll('.ef-btn__spin')).toHaveLength(1);
    const disabled = render(<Button href="/x" disabled>Go</Button>).container.querySelector('a');
    expect(disabled.hasAttribute('aria-busy')).toBe(false);
    expect(disabled.hasAttribute('data-loading')).toBe(false);
  });

  it('follows an enabled link: the click is not prevented', () => {
    const a = render(<Button href="#x">Go</Button>).container.querySelector('a');
    expect(fireEvent.click(a)).toBe(true);
  });

  it('asChild keeps the child: its props, ref, class, style and handlers, merged with Button\'s', () => {
    const ref = React.createRef();
    const childRef = React.createRef();
    const own = vi.fn();
    const outer = vi.fn();
    const { container } = render(
      <Button asChild ref={ref} variant="secondary" size="lg" className="from-button" style={{ color: 'red', marginTop: 2 }} onClick={outer} data-from-button="1" target="_blank">
        <RouterLink ref={childRef} locale="en" to="/docs" className="from-child" style={{ marginTop: 5 }} onClick={own} tabIndex={0}>Docs</RouterLink>
      </Button>,
    );
    const a = container.querySelector('a');
    expect(a.dataset.router).toBeDefined();
    expect(a.getAttribute('href')).toBe('/en/docs');
    expect(ref.current).toBe(a);
    expect(childRef.current).toBe(a);
    expect(a.classList.contains('ef-btn--secondary')).toBe(true);
    expect(a.classList.contains('from-button')).toBe(true);
    expect(a.classList.contains('from-child')).toBe(true);
    expect(a.style.color).toBe('red');
    expect(a.style.marginTop).toBe('5px');
    expect(a.dataset.fromButton).toBe('1');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('tabindex')).toBe('0');
    fireEvent.click(a);
    expect(own).toHaveBeenCalledOnce();
    expect(outer).toHaveBeenCalledOnce();
  });

  it('asChild blocked: aria-disabled, tabindex -1, the click swallowed before either handler, aria-busy on loading', () => {
    const own = vi.fn();
    const outer = vi.fn();
    const { container } = render(
      <Button asChild loading onClick={outer}><RouterLink locale="id" to="/x" onClick={own} tabIndex={0}>Saving</RouterLink></Button>,
    );
    const a = container.querySelector('a');
    expect(a.getAttribute('aria-disabled')).toBe('true');
    expect(a.getAttribute('tabindex')).toBe('-1');
    expect(a.getAttribute('aria-busy')).toBe('true');
    expect(a.hasAttribute('disabled')).toBe(false);
    expect(fireEvent.click(a)).toBe(false);
    expect(own).not.toHaveBeenCalled();
    expect(outer).not.toHaveBeenCalled();
  });

  it('asChild has no type attribute either: the link is not given type="button"', () => {
    const child = render(<Button asChild><RouterLink locale="id" to="/x">Go</RouterLink></Button>).container.querySelector('a');
    expect(child.hasAttribute('type')).toBe(false);
    expect(child.hasAttribute('disabled')).toBe(false);
  });

  it('asChild disabled: aria-disabled, tabindex -1, no disabled attribute, no aria-busy, the click swallowed before either handler', () => {
    const own = vi.fn();
    const outer = vi.fn();
    const a = render(
      <Button asChild disabled onClick={outer}><RouterLink locale="id" to="/x" onClick={own}>Go</RouterLink></Button>,
    ).container.querySelector('a');
    expect(a.getAttribute('aria-disabled')).toBe('true');
    expect(a.getAttribute('tabindex')).toBe('-1');
    expect(a.hasAttribute('disabled')).toBe(false);
    expect(a.hasAttribute('aria-busy')).toBe(false);
    expect(a.hasAttribute('data-loading')).toBe(false);
    expect(a.hasAttribute('type')).toBe(false);
    expect(fireEvent.click(a)).toBe(false);
    expect(own).not.toHaveBeenCalled();
    expect(outer).not.toHaveBeenCalled();
  });

  // R3: a native disabled <button> does not bubble a click to its parent. A blocked link stops the click the same way,
  // so a card with its own onClick does not fire when the link inside it is disabled or loading.
  it.each([['href disabled', { href: '/x', disabled: true }], ['href loading', { href: '/x', loading: true }], ['asChild disabled', { asChild: true, disabled: true }], ['asChild loading', { asChild: true, loading: true }]])('a blocked link does not bubble the click or the middle click to a parent handler: %s', (_, props) => {
    const parentClick = vi.fn();
    const parentAux = vi.fn();
    const { asChild } = props;
    const { container } = render(
      <div onClick={parentClick} onAuxClick={parentAux}>
        {asChild ? <Button {...props}><RouterLink locale="id" to="/x">Go</RouterLink></Button> : <Button {...props}>Go</Button>}
      </div>,
    );
    const a = container.querySelector('a');
    fireEvent.click(a);
    fireEvent(a, new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 }));
    expect(parentClick).not.toHaveBeenCalled();
    expect(parentAux).not.toHaveBeenCalled();
  });

  it('an enabled link still bubbles the click to a parent handler', () => {
    const parentClick = vi.fn();
    const { container } = render(<div onClick={parentClick}><Button href="#x">Go</Button></div>);
    fireEvent.click(container.querySelector('a'));
    expect(parentClick).toHaveBeenCalledOnce();
  });

  // R4: target="_blank" gets rel="noopener" unless the caller set a rel.
  it.each([['href', (props) => <Button href="/x" {...props}>Go</Button>], ['asChild', (props) => <Button asChild {...props}><RouterLink locale="id" to="/x">Go</RouterLink></Button>]])('%s: target="_blank" gets rel="noopener" unless the caller set a rel, and no target adds no rel', (_, make) => {
    const a = (props) => render(make(props)).container.querySelector('a');
    expect(a({ target: '_blank' }).getAttribute('rel')).toBe('noopener');
    expect(a({ target: '_blank', rel: 'noreferrer' }).getAttribute('rel')).toBe('noreferrer');
    expect(a({ target: '_blank', rel: '' }).getAttribute('rel')).toBe('');
    expect(a({ target: '_self' }).hasAttribute('rel')).toBe(false);
    expect(a({}).hasAttribute('rel')).toBe(false);
  });

  it('asChild: a child that sets target="_blank" itself gets rel="noopener" too, and a child rel wins', () => {
    const own = render(<Button asChild><RouterLink locale="id" to="/x" target="_blank">Go</RouterLink></Button>).container.querySelector('a');
    expect(own.getAttribute('rel')).toBe('noopener');
    const keep = render(<Button asChild><RouterLink locale="id" to="/x" target="_blank" rel="nofollow">Go</RouterLink></Button>).container.querySelector('a');
    expect(keep.getAttribute('rel')).toBe('nofollow');
  });

  it('asChild takes exactly one element', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Button asChild>text</Button>)).toThrow();
    quiet.mockRestore();
  });

  it('is still a <button> with no href: native disabled, no aria-disabled, no tabindex', () => {
    const { container } = render(<Button disabled>Go</Button>);
    const b = container.querySelector('button');
    expect(b.disabled).toBe(true);
    expect(b.hasAttribute('aria-disabled')).toBe(false);
    expect(b.hasAttribute('tabindex')).toBe(false);
    expect(container.querySelector('a')).toBeNull();
  });
});
