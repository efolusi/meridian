import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptComposer } from '../components/ai/PromptComposer.jsx';

// Display-area review, 2026-11-12. Each block failed before its fix.

describe('PromptComposer and IME composition', () => {
  it('does not send when Enter confirms an IME candidate', () => {
    const onSend = vi.fn();
    render(<PromptComposer defaultValue="にほん" onSend={onSend} />);
    const box = screen.getByRole('textbox');
    fireEvent.keyDown(box, { key: 'Enter', isComposing: true, keyCode: 229 });
    expect(onSend).not.toHaveBeenCalled();
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('にほん');
  });
});
