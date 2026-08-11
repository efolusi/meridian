import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button, buttonVariants } from '../components/forms/Button.jsx';

const VARIANTS = ['default', 'outline', 'ghost', 'destructive', 'secondary', 'link'];
const SIZES = ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'];

describe('Button compatibility contract', () => {
  it('maps every documented variant and size to stable classes', () => {
    const { container } = render(
      <div>
        {VARIANTS.flatMap((variant) => SIZES.map((size) => (
          <Button key={`${variant}-${size}`} variant={variant} size={size} data-contract={`${variant}-${size}`}>
            Action
          </Button>
        )))}
      </div>,
    );

    for (const variant of VARIANTS) {
      for (const size of SIZES) {
        const button = container.querySelector(`[data-contract="${variant}-${size}"]`);
        const expectedVariant = variant === 'default' ? 'primary' : variant;
        const expectedSize = size === 'default' ? 'md' : size;
        expect(button.classList.contains(`ef-btn--${expectedVariant}`)).toBe(true);
        expect(button.classList.contains(`ef-btn--${expectedSize}`)).toBe(true);
      }
    }
  });

  it('forwards refs, native attributes, events, styles, and custom classes', () => {
    const ref = React.createRef();
    const click = vi.fn();
    render(
      <Button
        ref={ref}
        type="submit"
        name="intent"
        value="save"
        aria-label="Save record"
        data-test="native"
        className="consumer-class"
        style={{ marginTop: 3 }}
        onClick={click}
      />,
    );
    const button = screen.getByRole('button', { name: 'Save record' });
    fireEvent.click(button);
    expect(ref.current).toBe(button);
    expect(button.type).toBe('submit');
    expect(button.name).toBe('intent');
    expect(button.value).toBe('save');
    expect(button.dataset.test).toBe('native');
    expect(button.classList.contains('consumer-class')).toBe(true);
    expect(button.style.marginTop).toBe('3px');
    expect(click).toHaveBeenCalledOnce();
  });

  it('keeps disabled and legacy loading buttons inoperable', () => {
    const disabledClick = vi.fn();
    const loadingClick = vi.fn();
    render(
      <>
        <Button disabled onClick={disabledClick}>Disabled</Button>
        <Button loading onClick={loadingClick}>Loading</Button>
      </>,
    );
    const disabled = screen.getByRole('button', { name: 'Disabled' });
    const loading = screen.getByRole('button', { name: 'Loading' });
    fireEvent.click(disabled);
    fireEvent.click(loading);
    expect(disabled.disabled).toBe(true);
    expect(loading.disabled).toBe(true);
    expect(disabledClick).not.toHaveBeenCalled();
    expect(loadingClick).not.toHaveBeenCalled();
  });

  it('exports a helper suitable for semantic links and preserves legacy aliases', () => {
    expect(buttonVariants()).toBe('ef-btn ef-btn--primary ef-btn--md');
    expect(buttonVariants({ variant: 'outline', size: 'sm', className: 'rounded' }))
      .toBe('ef-btn ef-btn--outline ef-btn--sm rounded');
    expect(buttonVariants({ variant: 'primary', size: 'md' }))
      .toBe('ef-btn ef-btn--primary ef-btn--md');
    render(<a href="/account" className={buttonVariants({ variant: 'link' })}>Account</a>);
    expect(screen.getByRole('link', { name: 'Account' }).getAttribute('href')).toBe('/account');
  });
});
