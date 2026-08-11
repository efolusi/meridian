import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../components/forms/InputOTP.jsx';

function CodeInput(props) {
  return (
    <InputOTP aria-label="Verification code" maxLength={6} {...props}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}

describe('Input OTP compatibility contract', () => {
  it('renders one semantic input and the complete slot composition', () => {
    const inputRef = React.createRef();
    const groupRef = React.createRef();
    const slotRef = React.createRef();
    const separatorRef = React.createRef();
    const { getByRole, container } = render(
      <InputOTP ref={inputRef} aria-label="Verification code" maxLength={2}>
        <InputOTPGroup ref={groupRef}><InputOTPSlot ref={slotRef} index={0} /><InputOTPSlot index={1} /></InputOTPGroup>
        <InputOTPSeparator ref={separatorRef} />
      </InputOTP>,
    );

    expect(inputRef.current).toBe(getByRole('textbox', { name: 'Verification code' }));
    expect(container.querySelectorAll('input')).toHaveLength(1);
    expect(groupRef.current.getAttribute('data-slot')).toBe('input-otp-group');
    expect(slotRef.current.getAttribute('data-slot')).toBe('input-otp-slot');
    expect(separatorRef.current).toBe(getByRole('separator'));
  });

  it('supports uncontrolled input, paste-sized changes, patterns, and completion', () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    const { getByRole, container } = render(<CodeInput pattern="[0-9]*" onChange={onChange} onComplete={onComplete} />);
    const input = getByRole('textbox', { name: 'Verification code' });

    fireEvent.change(input, { target: { value: '12ab' } });
    expect(input.value).toBe('');
    fireEvent.change(input, { target: { value: '1234567' } });
    expect(input.value).toBe('123456');
    expect(onChange).toHaveBeenLastCalledWith('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
    expect([...container.querySelectorAll('[data-slot="input-otp-slot"]')].map(slot => slot.textContent)).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('supports controlled value, invalid slots, focus state, and disabled state', () => {
    const onChange = vi.fn();
    const { getByRole, container, rerender } = render(
      <InputOTP aria-label="Code" maxLength={2} value="7" onChange={onChange} disabled>
        <InputOTPGroup><InputOTPSlot index={0} aria-invalid /><InputOTPSlot index={1} /></InputOTPGroup>
      </InputOTP>,
    );
    const input = getByRole('textbox', { name: 'Code' });
    expect(input.disabled).toBe(true);
    expect(container.querySelector('[data-slot="input-otp-slot"]').getAttribute('aria-invalid')).toBe('true');

    rerender(
      <InputOTP aria-label="Code" maxLength={2} value="7" onChange={onChange}>
        <InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /></InputOTPGroup>
      </InputOTP>,
    );
    fireEvent.focus(input);
    expect(container.querySelectorAll('[data-active]')).toHaveLength(1);
    fireEvent.change(input, { target: { value: '78' } });
    expect(onChange).toHaveBeenLastCalledWith('78');
    expect(input.value).toBe('7');
  });
});
