# Input OTP

Use one semantic input with composable visual slots for verification codes and PINs.

```jsx
<InputOTP maxLength={6} pattern="[0-9]*" onComplete={verify}>
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
```

Use `value` with `onChange` for controlled state. Set `aria-invalid` on slots when the code is rejected.
