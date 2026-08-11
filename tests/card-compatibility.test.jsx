import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '../components/display/Card.jsx';

describe('Card compatibility contract', () => {
  it('renders the complete composition with stable slots', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>Current billing period.</CardDescription>
          <CardAction>Review</CardAction>
        </CardHeader>
        <CardContent>42 GB</CardContent>
        <CardFooter>Updated now</CardFooter>
      </Card>,
    );
    expect(screen.getByText('Usage').getAttribute('data-slot')).toBe('card-title');
    expect(screen.getByText('Current billing period.').getAttribute('data-slot')).toBe('card-description');
    expect(screen.getByText('Review').getAttribute('data-slot')).toBe('card-action');
    expect(screen.getByText('42 GB').getAttribute('data-slot')).toBe('card-content');
    expect(screen.getByText('Updated now').getAttribute('data-slot')).toBe('card-footer');
  });

  it('supports default and small sizes with a shared spacing contract', () => {
    const { rerender } = render(<Card data-testid="card"><CardContent>Body</CardContent></Card>);
    expect(screen.getByTestId('card').getAttribute('data-size')).toBe('default');
    rerender(<Card data-testid="card" size="sm"><CardContent>Body</CardContent></Card>);
    expect(screen.getByTestId('card').getAttribute('data-size')).toBe('sm');
  });

  it('forwards native props, classes, styles, and refs on every part', () => {
    const refs = Array.from({ length: 7 }, () => React.createRef());
    render(
      <Card ref={refs[0]} className="root" style={{ '--card-spacing': '24px' }} aria-label="Summary">
        <CardHeader ref={refs[1]} className="header">
          <CardTitle ref={refs[2]}>Title</CardTitle>
          <CardDescription ref={refs[3]}>Description</CardDescription>
          <CardAction ref={refs[4]}>Action</CardAction>
        </CardHeader>
        <CardContent ref={refs[5]}>Content</CardContent>
        <CardFooter ref={refs[6]}>Footer</CardFooter>
      </Card>,
    );
    expect(refs.every(entry => entry.current instanceof HTMLDivElement)).toBe(true);
    expect(screen.getByLabelText('Summary').className).toContain('root');
    expect(screen.getByLabelText('Summary').style.getPropertyValue('--card-spacing')).toBe('24px');
    expect(refs[1].current.className).toContain('header');
  });

  it('allows direct edge-to-edge media around composed sections', () => {
    render(<Card data-testid="media-card"><img alt="Cover" src="cover.png" /><CardContent>Event</CardContent></Card>);
    const card = screen.getByTestId('media-card');
    expect(card.firstElementChild.tagName).toBe('IMG');
    expect(card.lastElementChild.getAttribute('data-slot')).toBe('card-content');
  });

  it('preserves the Meridian shorthand adapter', () => {
    render(<Card title="Legacy" subtitle="Helper" actions="Menu" footer="Foot" padding={7}>Body</Card>);
    expect(screen.getByText('Legacy')).toBeTruthy();
    expect(screen.getByText('Helper')).toBeTruthy();
    expect(screen.getByText('Menu')).toBeTruthy();
    expect(screen.getByText('Foot')).toBeTruthy();
    expect(screen.getByText('Body').style.padding).toBe('7px');
  });
});
