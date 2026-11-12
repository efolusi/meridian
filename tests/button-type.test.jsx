import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CodeBlock } from '../components/code/CodeBlock.jsx';
import { PromptComposer } from '../components/ai/PromptComposer.jsx';
import { Toolbar } from '../components/display/Toolbar.jsx';
import { TreeList } from '../components/display/TreeList.jsx';

// Display-area review, 2026-11-12. Each block failed before its fix.

describe('buttons inside a <form> do not submit it', () => {
  const inForm = node => {
    const onSubmit = vi.fn(e => e.preventDefault());
    const utils = render(<form onSubmit={onSubmit}>{node}</form>);
    return { onSubmit, ...utils };
  };
  it('CodeBlock copy', () => {
    const { container, onSubmit } = inForm(<CodeBlock lang="sh">npm i</CodeBlock>);
    container.querySelectorAll('button').forEach(b => expect(b.getAttribute('type')).toBe('button'));
    fireEvent.click(screen.getByText('Copy'));
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it('PromptComposer send and stop', () => {
    const onSend = vi.fn();
    const { container, onSubmit, rerender } = inForm(<PromptComposer defaultValue="hi" onSend={onSend} />);
    fireEvent.click(screen.getByLabelText('Send'));
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
    rerender(<form onSubmit={onSubmit}><PromptComposer busy onStop={() => {}} /></form>);
    expect(container.querySelector('[aria-label="Stop generating"]').getAttribute('type')).toBe('button');
  });
  it('Toolbar items', () => {
    const { container } = inForm(<Toolbar label="Format" items={[{ id: 'b', label: 'Bold' }]} />);
    expect(container.querySelector('button').getAttribute('type')).toBe('button');
  });
  it('TreeList rows', () => {
    const { container } = inForm(<TreeList nodes={[{ id: 'a', label: 'A' }]} />);
    expect(container.querySelector('button').getAttribute('type')).toBe('button');
  });
});

