import React from 'react';
import { injectEfCss, mergeRefs } from './Button.jsx';
import { Separator } from '../display/Separator.jsx';

const CSS = `
.ef-btn-group{display:flex;width:fit-content;align-items:stretch;isolation:isolate}
.ef-btn-group[data-orientation="horizontal"]>*:not(:first-child){border-start-start-radius:0!important;border-end-start-radius:0!important;border-inline-start-width:0!important}
.ef-btn-group[data-orientation="horizontal"]>*:not(:last-child){border-start-end-radius:0!important;border-end-end-radius:0!important}
.ef-btn-group[data-orientation="vertical"]{flex-direction:column}
.ef-btn-group[data-orientation="vertical"]>*:not(:first-child){border-start-start-radius:0!important;border-start-end-radius:0!important;border-top-width:0!important}
.ef-btn-group[data-orientation="vertical"]>*:not(:last-child){border-end-start-radius:0!important;border-end-end-radius:0!important}
.ef-btn-group>*:hover,.ef-btn-group>*:focus-visible{position:relative;z-index:1}
.ef-btn-group:has(>.ef-btn-group){gap:8px}
.ef-btn-group>input{flex:1}
.ef-btn-group__text{display:flex;align-items:center;gap:8px;padding-inline:16px;border:1px solid var(--border-default);border-radius:var(--radius-sm);background:var(--surface-subtle);color:var(--text-primary);font-size:var(--text-sm);font-weight:var(--weight-medium);box-shadow:var(--shadow-xs)}
.ef-btn-group__separator{position:relative!important;align-self:stretch!important;margin:0!important;background:var(--border-strong)!important}
.ef-btn-group__separator[data-orientation="vertical"]{height:auto!important}
`;

export function buttonGroupVariants({ orientation = 'horizontal', className = '' } = {}) {
  return `ef-btn-group ef-btn-group--${orientation}${className ? ` ${className}` : ''}`;
}

export const ButtonGroup = React.forwardRef(function ButtonGroup({ orientation = 'horizontal', children, style, className, ...rest }, ref) {
  injectEfCss('ef-css-btn-group', CSS);
  const axis = orientation === 'vertical' ? 'vertical' : 'horizontal';
  return <div {...rest} ref={ref} role="group" data-slot="button-group" data-orientation={axis} className={buttonGroupVariants({ orientation: axis, className })} style={style}>{children}</div>;
});

export const ButtonGroupText = React.forwardRef(function ButtonGroupText({ asChild = false, children, className, ...rest }, ref) {
  const classes = `ef-btn-group__text${className ? ` ${className}` : ''}`;
  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ...rest,
      'data-slot': 'button-group-text',
      className: `${classes}${child.props.className ? ` ${child.props.className}` : ''}`,
      ref: mergeRefs(ref, child.ref),
    });
  }
  return <div {...rest} ref={ref} data-slot="button-group-text" className={classes}>{children}</div>;
});

export const ButtonGroupSeparator = React.forwardRef(function ButtonGroupSeparator({ orientation = 'vertical', className, ...rest }, ref) {
  return <Separator {...rest} ref={ref} decorative orientation={orientation} data-slot="button-group-separator" className={`ef-btn-group__separator${className ? ` ${className}` : ''}`} />;
});
