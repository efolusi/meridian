import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/display/Collapsible.jsx';

describe('Collapsible compatibility contract', () => {
  it('toggles uncontrolled content with pointer and keyboard activation', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible>
        <CollapsibleTrigger>Details</CollapsibleTrigger>
        <CollapsibleContent>Private content</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: 'Details' });
    expect(trigger.getAttribute('data-state')).toBe('closed');
    expect(screen.queryByText('Private content')).toBeNull();
    await user.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Private content').getAttribute('data-state')).toBe('open');
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.queryByText('Private content')).toBeNull();
  });

  it('supports controlled state and reports requested changes', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Collapsible open={false} onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Details</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText('Content')).toBeNull();
    rerender(
      <Collapsible open onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Details</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByText('Content').hidden).toBe(false);
  });

  it('forwards refs and wires trigger to content', () => {
    const rootRef = React.createRef();
    const triggerRef = React.createRef();
    const contentRef = React.createRef();
    render(
      <Collapsible ref={rootRef} defaultOpen data-testid="root">
        <CollapsibleTrigger ref={triggerRef}>Details</CollapsibleTrigger>
        <CollapsibleContent ref={contentRef}>Content</CollapsibleContent>
      </Collapsible>,
    );
    expect(rootRef.current).toBe(screen.getByTestId('root'));
    expect(triggerRef.current).toBe(screen.getByRole('button'));
    expect(contentRef.current).toBe(screen.getByText('Content'));
    expect(triggerRef.current.getAttribute('aria-controls')).toBe(contentRef.current.id);
  });

  it('supports asChild triggers and respects prevented events', () => {
    const childClick = vi.fn(event => event.preventDefault());
    render(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <a href="#details" onClick={childClick}>Open details</a>
        </CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole('link');
    fireEvent.click(trigger);
    expect(childClick).toHaveBeenCalledOnce();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('Content')).toBeNull();
  });

  it('supports semantic root and content elements with asChild', () => {
    render(
      <Collapsible asChild defaultOpen>
        <section aria-label="Disclosure region">
          <CollapsibleTrigger>Details</CollapsibleTrigger>
          <CollapsibleContent asChild><article>Article content</article></CollapsibleContent>
        </section>
      </Collapsible>,
    );
    expect(screen.getByRole('region').tagName).toBe('SECTION');
    expect(screen.getByText('Article content').tagName).toBe('ARTICLE');
    expect(screen.getByText('Article content').getAttribute('data-state')).toBe('open');
  });

  it('supports disabled roots and force-mounted content', () => {
    const onOpenChange = vi.fn();
    render(
      <Collapsible disabled onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Details</CollapsibleTrigger>
        <CollapsibleContent forceMount>Content</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button');
    const content = screen.getByText('Content');
    expect(trigger.disabled).toBe(true);
    expect(trigger.getAttribute('data-disabled')).toBe('');
    expect(content.hidden).toBe(true);
    fireEvent.click(trigger);
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
