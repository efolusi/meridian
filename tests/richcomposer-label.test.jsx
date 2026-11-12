import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RichComposer } from '../components/ai/RichComposer.jsx';

// Display-area review, 2026-11-12. Failed before its fix.

describe('RichComposer', () => {
  it('names its textbox from the placeholder', () => {
    render(<RichComposer placeholder="Write to the agent" />);
    expect(screen.getByRole('textbox', { name: 'Write to the agent' })).toBeTruthy();
  });
});
