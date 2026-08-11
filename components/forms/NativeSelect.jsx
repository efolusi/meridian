import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss, mergeRefs } from './Button.jsx';

const CSS = `
.ef-native-select{position:relative;display:flex;align-items:center;width:100%}
.ef-native-select select{width:100%;height:var(--control-h-md);appearance:none;padding:0 32px 0 11px;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-sunken);color:var(--text-primary);font:inherit;font-size:var(--text-sm);cursor:pointer}
[dir="rtl"] .ef-native-select select{padding:0 11px 0 32px}
.ef-native-select select:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-native-select select:disabled{cursor:not-allowed;opacity:.5}
.ef-native-select[data-size="sm"] select{height:var(--control-h-sm)}
.ef-native-select[data-size="lg"] select{height:var(--control-h-lg)}
.ef-native-select__icon{position:absolute;inset-inline-end:10px;display:inline-flex;color:var(--text-muted);pointer-events:none}
`;
export const NativeSelect = React.forwardRef(function NativeSelect({ size = 'md', className, style, ...props }, ref) {
  injectEfCss('ef-css-native-select', CSS);
  return <span data-slot="native-select" data-size={size} className={`ef-native-select${className ? ` ${className}` : ''}`} style={style}><select {...props} ref={ref} /><span className="ef-native-select__icon"><Icon name="chevron-down" size={16} /></span></span>;
});
export const NativeSelectOption = React.forwardRef(function NativeSelectOption(props, ref) { return <option {...props} ref={ref} />; });
export const NativeSelectOptGroup = React.forwardRef(function NativeSelectOptGroup(props, ref) { return <optgroup {...props} ref={ref} />; });
