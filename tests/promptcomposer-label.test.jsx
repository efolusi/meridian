import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PromptComposer } from '../components/ai/PromptComposer.jsx';

// The textarea had no accessible name and no prop to give it one; `...rest`
// lands on the wrapper, so an aria-label there never reached the field.
describe('PromptComposer textarea name', () => {
  it('defaults to the placeholder', () => {
    render(<PromptComposer placeholder="Ask about this repo" />);
    expect(screen.getByRole('textbox').getAttribute('aria-label')).toBe('Ask about this repo');
  });
  it('takes aria-label', () => {
    render(<PromptComposer aria-label="Message the agent" />);
    expect(screen.getByRole('textbox', { name: 'Message the agent' })).toBeTruthy();
    expect(screen.getByRole('textbox').parentElement.hasAttribute('aria-label')).toBe(false);
  });
  it('takes aria-labelledby, which wins over the placeholder', () => {
    render(<><h2 id="h">Chat with Ops</h2><PromptComposer aria-labelledby="h" /></>);
    const box = screen.getByRole('textbox', { name: 'Chat with Ops' });
    expect(box.getAttribute('aria-labelledby')).toBe('h');
    expect(box.hasAttribute('aria-label')).toBe(false);
  });
});
