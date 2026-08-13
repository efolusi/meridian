import React from 'react';
import { injectEfCss } from './Button.jsx';
import { useFieldProps } from './Field.jsx';
const CSS = `
.ef-input-group{display:flex;min-width:0;width:100%;align-items:center;border:1px solid var(--border-strong);border-radius:var(--radius-sm);background:var(--surface-card);transition:border-color var(--dur-fast) var(--ease-out),box-shadow var(--dur-fast) var(--ease-out)}
.ef-input-group:focus-within{border-color:var(--accent);box-shadow:var(--focus-ring)}.ef-input-group:has([aria-invalid="true"]){border-color:var(--danger-600)}
.ef-input-group:has(textarea){flex-wrap:wrap}.ef-input-group__control{min-width:0;flex:1;border:0;background:transparent;font:inherit;color:var(--text-primary)}
input.ef-input-group__control{height:34px;padding:0 11px}textarea.ef-input-group__control{min-height:80px;padding:10px 11px;resize:vertical}.ef-input-group__control:focus{outline:none}.ef-input-group__control::placeholder{color:var(--text-muted)}
.ef-input-group__addon{display:flex;flex:none;align-items:center;gap:6px;padding:0 10px;color:var(--text-muted);font-size:var(--text-sm);white-space:nowrap}
.ef-input-group__addon[data-align="inline-start"]{order:-1;border-inline-end:1px solid var(--border-default)}.ef-input-group__addon[data-align="inline-end"]{order:2;border-inline-start:1px solid var(--border-default)}
.ef-input-group__addon[data-align="block-start"],.ef-input-group__addon[data-align="block-end"]{width:100%;min-height:34px}.ef-input-group__addon[data-align="block-start"]{order:-1;border-block-end:1px solid var(--border-default)}.ef-input-group__addon[data-align="block-end"]{order:3;border-block-start:1px solid var(--border-default)}
.ef-input-group__button{display:inline-flex;height:26px;align-items:center;justify-content:center;gap:5px;padding:0 8px;border:0;border-radius:var(--radius-sm);background:transparent;color:var(--text-secondary);font:inherit;font-size:var(--text-xs);cursor:pointer}.ef-input-group__button:hover{background:var(--surface-sunken);color:var(--text-primary)}.ef-input-group__button:focus-visible{outline:none;box-shadow:var(--focus-ring)}
.ef-input-group__button[data-size^="icon"]{width:26px;padding:0}.ef-input-group__text{display:inline-flex;align-items:center;line-height:1;font-size:var(--text-sm);color:var(--text-muted)}.ef-input-group__text svg{width:16px;height:16px;stroke-width:2}
`;
function cx(base, className) { return base + (className ? ` ${className}` : ''); }
export const InputGroup = React.forwardRef(function InputGroup({ className, ...rest }, ref) {
  injectEfCss('ef-css-input-group', CSS);
  return <div {...rest} ref={ref} data-slot="input-group" role="group" className={cx('ef-input-group', className)} />;
});
export const InputGroupAddon = React.forwardRef(function InputGroupAddon({ align = 'inline-start', className, ...rest }, ref) {
  const valid = ['inline-start','inline-end','block-start','block-end'].includes(align) ? align : 'inline-start';
  return <div {...rest} ref={ref} data-slot="input-group-addon" data-align={valid} className={cx('ef-input-group__addon', className)} />;
});
export const InputGroupButton = React.forwardRef(function InputGroupButton({ size = 'xs', variant = 'ghost', className, type = 'button', ...rest }, ref) {
  return <button {...rest} ref={ref} type={type} data-slot="input-group-button" data-size={size} data-variant={variant} className={cx('ef-input-group__button', className)} />;
});
export const InputGroupInput = React.forwardRef(function InputGroupInput({ className, ...rest }, ref) {
  const field = useFieldProps(rest); return <input {...rest} {...field.controlProps} ref={ref} data-slot="input-group-control" className={cx('ef-input-group__control', className)} />;
});
export const InputGroupTextarea = React.forwardRef(function InputGroupTextarea({ className, ...rest }, ref) {
  const field = useFieldProps(rest); return <textarea {...rest} {...field.controlProps} ref={ref} data-slot="input-group-control" className={cx('ef-input-group__control', className)} />;
});
export const InputGroupText = React.forwardRef(function InputGroupText({ className, ...rest }, ref) {
  return <span {...rest} ref={ref} data-slot="input-group-text" className={cx('ef-input-group__text', className)} />;
});
