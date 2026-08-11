import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertDescription, AlertTitle } from '../components/feedback/Alert.jsx';

describe('Alert compatibility contract', () => {
  it('renders the composable default variant with alert semantics', () => {
    render(
      <Alert>
        <svg aria-hidden="true" />
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>You can add components to your app.</AlertDescription>
      </Alert>,
    );
    const root = screen.getByRole('alert');
    expect(root.getAttribute('data-slot')).toBe('alert');
    expect(screen.getByText('Heads up').getAttribute('data-slot')).toBe('alert-title');
    expect(screen.getByText('You can add components to your app.').getAttribute('data-slot')).toBe('alert-description');
  });

  it('supports the destructive variant', () => {
    render(<Alert variant="destructive" data-testid="alert"><AlertTitle>Unable to save</AlertTitle></Alert>);
    expect(screen.getByTestId('alert').className).toContain('ef-alert--destructive');
  });

  it('forwards refs, native attributes, classes, and styles on every part', () => {
    const rootRef = React.createRef();
    const titleRef = React.createRef();
    const descriptionRef = React.createRef();
    render(
      <Alert ref={rootRef} id="notice" className="custom-root" style={{ maxWidth: 480 }}>
        <AlertTitle ref={titleRef} className="custom-title">Title</AlertTitle>
        <AlertDescription ref={descriptionRef} className="custom-description">Description</AlertDescription>
      </Alert>,
    );
    expect(rootRef.current.id).toBe('notice');
    expect(rootRef.current.className).toContain('custom-root');
    expect(rootRef.current.style.maxWidth).toBe('480px');
    expect(titleRef.current.className).toContain('custom-title');
    expect(descriptionRef.current.className).toContain('custom-description');
  });

  it('keeps semantic children as direct root children', () => {
    render(<Alert><AlertTitle>Title</AlertTitle><AlertDescription>Description</AlertDescription></Alert>);
    const root = screen.getByRole('alert');
    expect(screen.getByText('Title').parentElement).toBe(root);
    expect(screen.getByText('Description').parentElement).toBe(root);
  });

  it('preserves Meridian tone and content shorthands', () => {
    render(<Alert tone="warning" title="Budget warning" description="Usage reached 85%." action={<button>Review</button>}>Extra context</Alert>);
    const root = screen.getByRole('alert');
    expect(root.className).toContain('ef-alert--warning');
    expect(screen.getByText('Budget warning')).not.toBeNull();
    expect(screen.getByText('Usage reached 85%.')).not.toBeNull();
    expect(screen.getByText('Extra context').className).toBe('ef-alert__body');
    expect(screen.getByRole('button', { name: 'Review' })).not.toBeNull();
  });
});
