import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '../components/feedback/Alert.jsx';
import { Icon } from '../components/icons/Icon.jsx';

describe('Alert compatibility contract', () => {
  it('recognizes the Icon wrapper as the icon column', () => {
    render(<Alert data-testid="alert"><Icon name="info" /><AlertTitle>Heads up</AlertTitle><AlertDescription>Read this.</AlertDescription></Alert>);
    expect(screen.getByTestId('alert').querySelector('[data-slot="icon"]')).not.toBeNull();
  });
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

  it('supports the canonical action part and explicit custom status styling', () => {
    const actionRef = React.createRef();
    render(<Alert className="ef-alert--warning"><AlertTitle>Budget warning</AlertTitle><AlertDescription>Usage reached 85%.</AlertDescription><AlertAction ref={actionRef}><button>Review</button></AlertAction></Alert>);
    const root = screen.getByRole('alert');
    expect(root.className).toContain('ef-alert--warning');
    expect(screen.getByText('Budget warning')).not.toBeNull();
    expect(screen.getByText('Usage reached 85%.')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Review' })).not.toBeNull();
    expect(actionRef.current.getAttribute('data-slot')).toBe('alert-action');
  });
});

describe('Alert action layout contract', () => {
  it('lays the action out in the grid instead of floating it over the text', async () => {
    const source = await import('node:fs').then((fs) => fs.readFileSync('components/feedback/Alert.jsx', 'utf8'));
    // The action was absolutely positioned with a fixed right padding, which any
    // action wider than 96px overflowed onto the description.
    expect(source).not.toMatch(/ef-alert__action\{position:absolute/);
    expect(source).not.toMatch(/padding-inline-end:96px/);
    expect(source).toMatch(/\.ef-alert>\.ef-alert__action\{grid-column:3;grid-row:1\/3/);
    // Below 560px the action drops under the text as a full-width row.
    expect(source).toMatch(/@media \(max-width:559px\)\{[^}]*\.ef-alert:has\(>\.ef-alert__action\)\{grid-template-columns:0 1fr\}/);
  });
});
