import React from 'react';
import { injectEfCss, mergeRefs } from '../forms/Button.jsx';

const CSS = `
.ef-marker{display:inline-flex;align-items:center;gap:6px;min-width:0;color:var(--text-muted);font-family:var(--font-sans);font-size:var(--text-sm);line-height:1.4}
.ef-marker--border{display:flex;width:100%;padding-block:10px;border-bottom:1px solid var(--border-default)}
.ef-marker--separator{display:flex;width:100%;gap:10px;text-align:center;white-space:nowrap}
.ef-marker--separator::before,.ef-marker--separator::after{content:"";height:1px;min-width:12px;flex:1;background:var(--border-default)}
.ef-marker__icon{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;color:var(--text-muted)}
.ef-marker__content{min-width:0;overflow-wrap:anywhere}
.ef-marker:is(a,button){border:0;background:transparent;color:var(--text-link);cursor:pointer;text-decoration:none}
.ef-marker:is(a,button):hover{text-decoration:none;color:var(--text-link-hover)}
.ef-marker:is(a,button):focus-visible{outline:none;box-shadow:var(--focus-ring)}
`;

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function markerVariants({ variant = 'default', className } = {}) {
  return joinClasses('ef-marker', `ef-marker--${variant}`, className);
}

function renderRoot(render, props, ref) {
  if (typeof render === 'function') return render({ ...props, ref });
  if (React.isValidElement(render)) {
    return React.cloneElement(render, {
      ...render.props,
      ...props,
      className: joinClasses(props.className, render.props.className),
      ref: mergeRefs(ref, render.ref),
    });
  }
  return <div {...props} ref={ref} />;
}

export const Marker = React.forwardRef(function Marker(
  { variant = 'default', render, className, children, ...props },
  ref,
) {
  injectEfCss('ef-css-marker', CSS);
  const rootProps = {
    ...props,
    'data-variant': variant,
    className: markerVariants({ variant, className }),
    children,
  };
  return renderRoot(render, rootProps, ref);
});

export const MarkerIcon = React.forwardRef(function MarkerIcon(
  { className, ...props },
  ref,
) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={joinClasses('ef-marker__icon', className)}
      ref={ref}
    />
  );
});

export const MarkerContent = React.forwardRef(function MarkerContent(
  { className, ...props },
  ref,
) {
  return <span {...props} className={joinClasses('ef-marker__content', className)} ref={ref} />;
});
