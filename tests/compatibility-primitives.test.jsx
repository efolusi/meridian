import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Separator } from '../components/display/Separator.jsx';
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from '../components/forms/NativeSelect.jsx';
import {
  Marker,
  MarkerContent,
  MarkerIcon,
  markerVariants,
} from '../components/ai/Marker.jsx';

describe('Separator', () => {
  it('is decorative by default and exposes semantic vertical orientation', () => {
    const { rerender } = render(<Separator data-testid="rule" />);
    expect(screen.getByTestId('rule').getAttribute('role')).toBe('none');
    expect(screen.getByTestId('rule').getAttribute('data-orientation')).toBe('horizontal');

    rerender(<Separator data-testid="rule" decorative={false} orientation="vertical" />);
    expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('vertical');
  });
});

describe('NativeSelect', () => {
  it('composes native groups and options and forwards the select ref', () => {
    const ref = React.createRef();
    render(
      <NativeSelect ref={ref} aria-label="Fruit" defaultValue="banana">
        <NativeSelectOptGroup label="Fruit">
          <NativeSelectOption value="apple">Apple</NativeSelectOption>
          <NativeSelectOption value="banana">Banana</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>,
    );
    expect(ref.current).toBe(screen.getByRole('combobox'));
    expect(ref.current.value).toBe('banana');
    expect(screen.getByRole('group', { name: 'Fruit' })).toBeTruthy();
  });
});

describe('Marker', () => {
  it('is presentational by default and hides its icon from assistive technology', () => {
    render(
      <Marker data-testid="marker">
        <MarkerIcon data-testid="icon">*</MarkerIcon>
        <MarkerContent>Indexed 4 files</MarkerContent>
      </Marker>,
    );
    expect(screen.getByTestId('marker').getAttribute('role')).toBeNull();
    expect(screen.getByTestId('icon').getAttribute('aria-hidden')).toBe('true');
    expect(markerVariants({ variant: 'separator' })).toContain('ef-marker--separator');
  });

  it('renders a semantic custom root and forwards its ref', () => {
    const ref = React.createRef();
    render(
      <Marker ref={ref} render={<a href="/files" />}>
        <MarkerContent>Open files</MarkerContent>
      </Marker>,
    );
    expect(ref.current).toBe(screen.getByRole('link', { name: 'Open files' }));
    expect(ref.current.getAttribute('href')).toBe('/files');
  });

  it('supports a render function root', () => {
    render(
      <Marker render={(props) => <button {...props} type="button" />}>
        Retry
      </Marker>,
    );
    expect(screen.getByRole('button', { name: 'Retry' }).dataset.variant).toBe('default');
  });
});
