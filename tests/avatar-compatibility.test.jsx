import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '../components/display/Avatar.jsx';

describe('Avatar compatibility contract', () => {
  it.each(['default', 'sm', 'lg'])('supports the %s size', (size) => {
    render(<Avatar size={size} data-testid={`avatar-${size}`}><AvatarFallback>AO</AvatarFallback></Avatar>);
    expect(screen.getByTestId(`avatar-${size}`).dataset.size).toBe(size);
  });

  it('composes image, fallback, badge, native props, and refs', () => {
    const avatarRef = React.createRef();
    const imageRef = React.createRef();
    render(
      <Avatar ref={avatarRef} aria-label="Ada Obi" className="consumer-avatar" data-person="ada">
        <AvatarImage ref={imageRef} src="ada.png" alt="Ada Obi portrait" />
        <AvatarFallback>AO</AvatarFallback>
        <AvatarBadge aria-label="Online" />
      </Avatar>,
    );
    expect(avatarRef.current.dataset.slot).toBe('avatar');
    expect(avatarRef.current.dataset.person).toBe('ada');
    expect(avatarRef.current.classList.contains('consumer-avatar')).toBe(true);
    expect(imageRef.current).toBe(screen.getByAltText('Ada Obi portrait'));
    expect(screen.getByText('AO').dataset.slot).toBe('avatar-fallback');
    expect(screen.getByLabelText('Online').dataset.slot).toBe('avatar-badge');
  });

  it('reveals the fallback after an image error and composes the error handler', () => {
    const onError = vi.fn();
    render(<Avatar><AvatarFallback>KM</AvatarFallback><AvatarImage src="missing.png" alt="Kofi" onError={onError} /></Avatar>);
    fireEvent.error(screen.getByAltText('Kofi'));
    expect(onError).toHaveBeenCalledOnce();
    expect(screen.queryByAltText('Kofi')).toBeNull();
    expect(screen.getByText('KM')).toBeTruthy();
  });

  it('groups avatars with a count and forwards group refs', () => {
    const ref = React.createRef();
    render(
      <AvatarGroup ref={ref} dir="rtl" aria-label="Members">
        <Avatar><AvatarFallback>AO</AvatarFallback></Avatar>
        <AvatarGroupCount>+4</AvatarGroupCount>
      </AvatarGroup>,
    );
    expect(ref.current.dataset.slot).toBe('avatar-group');
    expect(ref.current.dir).toBe('rtl');
    expect(screen.getByText('+4').dataset.slot).toBe('avatar-group-count');
  });

});
