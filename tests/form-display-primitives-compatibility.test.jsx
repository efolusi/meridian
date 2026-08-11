import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Kbd, KbdGroup } from '../components/display/Kbd.jsx';
import { Textarea } from '../components/forms/Textarea.jsx';
import { Toggle, toggleVariants } from '../components/forms/Toggle.jsx';

describe('Kbd compatibility contract', () => {
  it('composes keys in a group and forwards native attributes and refs', () => {
    const keyRef = React.createRef();
    const groupRef = React.createRef();
    render(
      <KbdGroup ref={groupRef} aria-label="Shortcut" className="shortcut">
        <Kbd ref={keyRef} data-key="modifier">Ctrl</Kbd>
        <span>+</span>
        <Kbd>B</Kbd>
      </KbdGroup>,
    );
    expect(groupRef.current.dataset.slot).toBe('kbd-group');
    expect(groupRef.current.classList.contains('shortcut')).toBe(true);
    expect(keyRef.current.tagName).toBe('KBD');
    expect(keyRef.current.dataset.key).toBe('modifier');
    expect(screen.getAllByText(/Ctrl|B/)).toHaveLength(2);
  });
});

describe('Textarea compatibility contract', () => {
  it('forwards native props, events, styles, classes, and its ref', () => {
    const ref = React.createRef();
    const change = vi.fn();
    render(
      <Textarea
        ref={ref}
        aria-label="Message"
        name="message"
        placeholder="Write a message"
        rows={5}
        className="consumer-textarea"
        style={{ minHeight: 120 }}
        onChange={change}
      />,
    );
    const textarea = screen.getByRole('textbox', { name: 'Message' });
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(ref.current).toBe(textarea);
    expect(textarea.name).toBe('message');
    expect(textarea.rows).toBe(5);
    expect(textarea.classList.contains('consumer-textarea')).toBe(true);
    expect(textarea.style.minHeight).toBe('120px');
    expect(change).toHaveBeenCalledOnce();
  });

  it('keeps field helpers additive while the ref targets the textarea', () => {
    const ref = React.createRef();
    render(<Textarea ref={ref} label="Message" error="Required" />);
    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Message' }));
    expect(ref.current.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Required')).toBeTruthy();
  });
});

describe('Toggle compatibility contract', () => {
  it.each(['default', 'outline'])('supports the %s variant', (variant) => {
    render(<Toggle variant={variant} data-testid={`toggle-${variant}`}>{variant}</Toggle>);
    expect(screen.getByTestId(`toggle-${variant}`).classList.contains(`ef-toggle--${variant}`)).toBe(true);
  });

  it.each(['default', 'sm', 'lg'])('supports the %s size', (size) => {
    render(<Toggle size={size} data-testid={`toggle-${size}`}>{size}</Toggle>);
    expect(screen.getByTestId(`toggle-${size}`).classList.contains(`ef-toggle--${size}`)).toBe(true);
  });

  it('supports controlled state, composed click handling, native props, and refs', () => {
    const ref = React.createRef();
    const click = vi.fn();
    const pressedChange = vi.fn();
    render(
      <Toggle ref={ref} pressed aria-label="Bookmark" name="bookmark" onClick={click} onPressedChange={pressedChange} />,
    );
    const toggle = screen.getByRole('button', { name: 'Bookmark', pressed: true });
    fireEvent.click(toggle);
    expect(ref.current).toBe(toggle);
    expect(toggle.name).toBe('bookmark');
    expect(toggle.dataset.state).toBe('on');
    expect(click).toHaveBeenCalledOnce();
    expect(pressedChange).toHaveBeenCalledWith(false);
  });

  it('exports the style helper and preserves the legacy md size', () => {
    expect(toggleVariants()).toBe('ef-toggle ef-toggle--default ef-toggle--default');
    expect(toggleVariants({ variant: 'outline', size: 'lg', className: 'custom' }))
      .toBe('ef-toggle ef-toggle--outline ef-toggle--lg custom');
    expect(toggleVariants({ size: 'md' })).toContain('ef-toggle--md');
  });
});
