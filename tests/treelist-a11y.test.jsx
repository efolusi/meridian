import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TreeList } from '../components/display/TreeList.jsx';

// Display-area review, 2026-11-12. Each block failed before its fix.

describe('TreeList semantics', () => {
  const nodes = [{ id: 'src', label: 'src', children: [{ id: 'app', label: 'app.js' }] }, { id: 'readme', label: 'README' }];
  it('does not claim role=tree without treeitems and arrow-key support', () => {
    const { container } = render(<TreeList nodes={nodes} />);
    expect(container.querySelector('[role="tree"]')).toBeNull();
  });
  it('exposes expanded state on parents and the current row', () => {
    render(<TreeList nodes={nodes} value="app" />);
    const parent = screen.getByText('src').closest('button');
    expect(parent.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(parent);
    expect(parent.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByText('README').closest('button').hasAttribute('aria-expanded')).toBe(false);
  });
  it('marks the selected row with aria-current', () => {
    render(<TreeList nodes={nodes} value="readme" />);
    expect(screen.getByText('README').closest('button').getAttribute('aria-current')).toBe('true');
    expect(screen.getByText('src').closest('button').hasAttribute('aria-current')).toBe(false);
  });
});

