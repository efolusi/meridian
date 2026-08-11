import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/display/Accordion.jsx';

function Composition(props = {}) {
  return (
    <Accordion type="single" collapsible {...props}>
      <AccordionItem value="one"><AccordionTrigger>One</AccordionTrigger><AccordionContent>First</AccordionContent></AccordionItem>
      <AccordionItem value="two"><AccordionTrigger>Two</AccordionTrigger><AccordionContent>Second</AccordionContent></AccordionItem>
      <AccordionItem value="three"><AccordionTrigger>Three</AccordionTrigger><AccordionContent>Third</AccordionContent></AccordionItem>
    </Accordion>
  );
}

describe('Accordion compatibility contract', () => {
  it('supports single collapsible uncontrolled state', async () => {
    const user = userEvent.setup();
    render(<Composition defaultValue="one" />);
    const one = screen.getByRole('button', { name: 'One' });
    const two = screen.getByRole('button', { name: 'Two' });
    expect(one.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('First')).not.toBeNull();
    await user.click(two);
    expect(screen.queryByText('First')).toBeNull();
    expect(screen.getByText('Second')).not.toBeNull();
    await user.click(two);
    expect(screen.queryByText('Second')).toBeNull();
  });

  it('supports controlled single state and reports value changes', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Composition value="one" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Two' }));
    expect(onValueChange).toHaveBeenCalledWith('two');
    expect(screen.getByText('First')).not.toBeNull();
    rerender(<Composition value="two" onValueChange={onValueChange} />);
    expect(screen.getByText('Second')).not.toBeNull();
  });

  it('supports multiple state without closing other items', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="multiple" defaultValue={['one']}>
        <AccordionItem value="one"><AccordionTrigger>One</AccordionTrigger><AccordionContent>First</AccordionContent></AccordionItem>
        <AccordionItem value="two"><AccordionTrigger>Two</AccordionTrigger><AccordionContent>Second</AccordionContent></AccordionItem>
      </Accordion>,
    );
    await user.click(screen.getByRole('button', { name: 'Two' }));
    expect(screen.getByText('First')).not.toBeNull();
    expect(screen.getByText('Second')).not.toBeNull();
  });

  it('moves focus with vertical navigation keys and skips disabled triggers', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="one"><AccordionTrigger>One</AccordionTrigger><AccordionContent>First</AccordionContent></AccordionItem>
        <AccordionItem value="two" disabled><AccordionTrigger>Two</AccordionTrigger><AccordionContent>Second</AccordionContent></AccordionItem>
        <AccordionItem value="three"><AccordionTrigger>Three</AccordionTrigger><AccordionContent>Third</AccordionContent></AccordionItem>
      </Accordion>,
    );
    const one = screen.getByRole('button', { name: 'One' });
    const three = screen.getByRole('button', { name: 'Three' });
    one.focus();
    fireEvent.keyDown(one, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(three);
    fireEvent.keyDown(three, { key: 'Home' });
    expect(document.activeElement).toBe(one);
    fireEvent.keyDown(one, { key: 'End' });
    expect(document.activeElement).toBe(three);
  });

  it('uses direction-aware horizontal keyboard navigation', () => {
    render(<Composition orientation="horizontal" dir="rtl" />);
    const one = screen.getByRole('button', { name: 'One' });
    const three = screen.getByRole('button', { name: 'Three' });
    one.focus();
    fireEvent.keyDown(one, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(three);
    fireEvent.keyDown(three, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(one);
  });

  it('can disable keyboard focus looping at the boundaries', () => {
    render(<Composition loop={false} />);
    const one = screen.getByRole('button', { name: 'One' });
    const three = screen.getByRole('button', { name: 'Three' });
    three.focus();
    fireEvent.keyDown(three, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(three);
    one.focus();
    fireEvent.keyDown(one, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(one);
  });

  it('wires trigger and content semantics, state attributes, and refs', () => {
    const rootRef = React.createRef();
    const itemRef = React.createRef();
    const triggerRef = React.createRef();
    const contentRef = React.createRef();
    render(
      <Accordion ref={rootRef} type="single" defaultValue="one">
        <AccordionItem ref={itemRef} value="one">
          <AccordionTrigger ref={triggerRef}>One</AccordionTrigger>
          <AccordionContent ref={contentRef}>First</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(rootRef.current.getAttribute('data-slot')).toBe('accordion');
    expect(itemRef.current.getAttribute('data-state')).toBe('open');
    expect(triggerRef.current.getAttribute('aria-controls')).toBe(contentRef.current.id);
    expect(contentRef.current.getAttribute('aria-labelledby')).toBe(triggerRef.current.id);
    expect(contentRef.current.getAttribute('role')).toBe('region');
  });

  it('supports asChild roots, items, triggers, and content', () => {
    render(
      <Accordion type="single" defaultValue="one" asChild>
        <section aria-label="Questions">
          <AccordionItem value="one" asChild>
            <article>
              <AccordionTrigger asChild><button type="button">One</button></AccordionTrigger>
              <AccordionContent asChild><div>First</div></AccordionContent>
            </article>
          </AccordionItem>
        </section>
      </Accordion>,
    );
    expect(screen.getByRole('region', { name: 'Questions' }).tagName).toBe('SECTION');
    expect(screen.getByText('First').getAttribute('data-slot')).toBe('accordion-content');
    expect(screen.getByText('First').parentElement.tagName).toBe('ARTICLE');
  });

  it('supports disabled roots and force-mounted content', () => {
    const onValueChange = vi.fn();
    render(
      <Accordion type="single" disabled onValueChange={onValueChange}>
        <AccordionItem value="one"><AccordionTrigger>One</AccordionTrigger><AccordionContent forceMount>First</AccordionContent></AccordionItem>
      </Accordion>,
    );
    const trigger = screen.getByRole('button', { name: 'One' });
    expect(trigger.disabled).toBe(true);
    expect(screen.getByText('First').closest('[data-slot="accordion-content"]').hidden).toBe(true);
    fireEvent.click(trigger);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
