import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/forms/Button.jsx';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants } from '../components/forms/ButtonGroup.jsx';

describe('Button Group compatibility contract', () => {
  it('groups controls horizontally by default', () => {
    render(<ButtonGroup aria-label="Period"><Button>Day</Button><Button>Week</Button></ButtonGroup>);
    const group = screen.getByRole('group', { name: 'Period' });
    expect(group.getAttribute('data-slot')).toBe('button-group');
    expect(group.getAttribute('data-orientation')).toBe('horizontal');
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('supports vertical orientation and the variant helper', () => {
    render(<ButtonGroup orientation="vertical" data-testid="vertical"><Button>Up</Button><Button>Down</Button></ButtonGroup>);
    expect(screen.getByTestId('vertical').getAttribute('data-orientation')).toBe('vertical');
    expect(buttonGroupVariants({ orientation: 'vertical', className: 'mine' })).toContain('ef-btn-group--vertical mine');
  });

  it('composes text through asChild', () => {
    render(<ButtonGroup><ButtonGroupText asChild className="consumer"><span data-testid="text">Prefix</span></ButtonGroupText></ButtonGroup>);
    const text = screen.getByTestId('text');
    expect(text.tagName).toBe('SPAN');
    expect(text.getAttribute('data-slot')).toBe('button-group-text');
    expect(text.className).toContain('consumer');
  });

  it('provides an orientation-aware decorative separator', () => {
    render(<ButtonGroup><Button>One</Button><ButtonGroupSeparator data-testid="separator" /><Button>Two</Button></ButtonGroup>);
    const separator = screen.getByTestId('separator');
    expect(separator.getAttribute('data-slot')).toBe('button-group-separator');
    expect(separator.getAttribute('data-orientation')).toBe('vertical');
    expect(separator.getAttribute('role')).toBe('none');
  });

  it('forwards native props, classes, styles, and refs', () => {
    const refs = [React.createRef(), React.createRef(), React.createRef()];
    render(<ButtonGroup ref={refs[0]} className="root" style={{ opacity: 0.8 }}><ButtonGroupText ref={refs[1]}>Text</ButtonGroupText><ButtonGroupSeparator ref={refs[2]} /></ButtonGroup>);
    expect(refs.every(entry => entry.current instanceof HTMLDivElement)).toBe(true);
    expect(refs[0].current.className).toContain('root');
    expect(refs[0].current.style.opacity).toBe('0.8');
  });
});
