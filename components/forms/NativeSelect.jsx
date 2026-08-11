import React from 'react';
import { Select } from './Select.jsx';

export const NativeSelect = React.forwardRef(function NativeSelect(
  { children, ...props },
  ref,
) {
  return <Select {...props} ref={ref}>{children}</Select>;
});

export const NativeSelectOption = React.forwardRef(function NativeSelectOption(
  props,
  ref,
) {
  return <option {...props} ref={ref} />;
});

export const NativeSelectOptGroup = React.forwardRef(function NativeSelectOptGroup(
  props,
  ref,
) {
  return <optgroup {...props} ref={ref} />;
});
