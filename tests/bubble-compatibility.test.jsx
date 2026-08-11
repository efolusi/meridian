import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from '../components/ai/Bubble.jsx';

describe('Bubble compatibility contract', () => {
  it('renders groups and aligned bubbles with stable slots', () => {
    render(<BubbleGroup data-testid="group"><Bubble align="end" data-testid="bubble"><BubbleContent>Ready</BubbleContent></Bubble></BubbleGroup>);
    expect(screen.getByTestId('group').getAttribute('data-slot')).toBe('bubble-group');
    expect(screen.getByTestId('bubble').getAttribute('data-align')).toBe('end');
    expect(screen.getByText('Ready').getAttribute('data-slot')).toBe('bubble-content');
  });

  it.each(['default', 'secondary', 'muted', 'tinted', 'outline', 'ghost', 'destructive'])('supports the %s variant', variant => {
    render(<Bubble variant={variant} data-testid="bubble"><BubbleContent>Message</BubbleContent></Bubble>);
    expect(screen.getByTestId('bubble').getAttribute('data-variant')).toBe(variant);
  });

  it('composes interactive content through asChild', () => {
    render(<Bubble><BubbleContent asChild className="consumer"><button type="button">Open message</button></BubbleContent></Bubble>);
    const button = screen.getByRole('button', { name: 'Open message' });
    expect(button.getAttribute('data-slot')).toBe('bubble-content');
    expect(button.className).toContain('consumer');
  });

  it('positions reactions by logical side and alignment', () => {
    render(<Bubble><BubbleContent>Message</BubbleContent><BubbleReactions side="top" align="start">+2</BubbleReactions></Bubble>);
    const reactions = screen.getByText('+2');
    expect(reactions.getAttribute('data-side')).toBe('top');
    expect(reactions.getAttribute('data-align')).toBe('start');
  });

  it('forwards native props, classes, styles, and refs on all parts', () => {
    const refs = Array.from({ length: 4 }, () => React.createRef());
    render(<BubbleGroup ref={refs[0]}><Bubble ref={refs[1]} className="bubble"><BubbleContent ref={refs[2]} style={{ opacity: 0.8 }}>Message</BubbleContent><BubbleReactions ref={refs[3]}>1</BubbleReactions></Bubble></BubbleGroup>);
    expect(refs.every(entry => entry.current instanceof HTMLDivElement)).toBe(true);
    expect(refs[1].current.className).toContain('bubble');
    expect(refs[2].current.style.opacity).toBe('0.8');
  });
});
