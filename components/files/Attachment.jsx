import React from 'react';
import { Button, injectEfCss, mergeRefs } from '../forms/Button.jsx';

const CSS = `
.ef-attachment{position:relative;display:flex;align-items:center;gap:10px;min-width:0;padding:10px;border:1px solid var(--border-default);border-radius:var(--radius-md);background:var(--surface-card);color:var(--text-primary)}
.ef-attachment[data-orientation="vertical"]{flex-direction:column;align-items:stretch}
.ef-attachment[data-size="sm"]{gap:8px;padding:8px}
.ef-attachment[data-size="xs"]{gap:6px;padding:6px;border-radius:var(--radius-sm)}
.ef-attachment[data-state="error"]{border-color:var(--danger-600)}
.ef-attachment__media{display:flex;align-items:center;justify-content:center;flex:none;width:36px;height:36px;border-radius:var(--radius-sm);overflow:hidden;background:var(--surface-sunken);color:var(--text-secondary)}
.ef-attachment[data-size="sm"] .ef-attachment__media{width:32px;height:32px}
.ef-attachment[data-size="xs"] .ef-attachment__media{width:24px;height:24px}
.ef-attachment[data-orientation="vertical"] .ef-attachment__media{width:100%;height:auto;aspect-ratio:16/9}
.ef-attachment__media[data-variant="image"] img{width:100%;height:100%;object-fit:cover}
.ef-attachment__content{flex:1;min-width:0}
.ef-attachment__title{overflow:hidden;color:var(--text-primary);font-size:var(--text-sm);font-weight:var(--weight-semibold);line-height:1.35;text-overflow:ellipsis;white-space:nowrap}
.ef-attachment[data-size="xs"] .ef-attachment__title{font-size:var(--text-xs)}
.ef-attachment__description{overflow:hidden;margin-top:2px;color:var(--text-muted);font-size:var(--text-xs);line-height:1.35;text-overflow:ellipsis;white-space:nowrap}
.ef-attachment[data-state="error"] .ef-attachment__description{color:var(--danger-600)}
.ef-attachment__actions{position:relative;z-index:3;display:flex;align-items:center;gap:4px;flex:none}
.ef-attachment__trigger{position:absolute;z-index:1;inset:0;width:100%;height:100%;padding:0;border:0;border-radius:inherit;background:transparent;cursor:pointer}
.ef-attachment__trigger:focus-visible{outline:none;box-shadow:inset var(--focus-ring)}
.ef-attachment:has(.ef-attachment__trigger) .ef-attachment__media,.ef-attachment:has(.ef-attachment__trigger) .ef-attachment__content{pointer-events:none}
.ef-attachment[data-state="uploading"] .ef-attachment__title,.ef-attachment[data-state="processing"] .ef-attachment__title{background:linear-gradient(90deg,var(--text-muted),var(--text-primary),var(--text-muted));background-size:200% 100%;background-clip:text;color:transparent;animation:ef-attachment-shimmer 1.5s linear infinite}
.ef-attachment-group{display:flex;gap:8px;max-width:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:thin;mask-image:linear-gradient(to right,transparent,currentColor 14px,currentColor calc(100% - 14px),transparent);padding-inline:14px}
.ef-attachment-group>.ef-attachment{flex:0 0 auto;min-width:220px;scroll-snap-align:start}
@keyframes ef-attachment-shimmer{to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.ef-attachment[data-state="uploading"] .ef-attachment__title,.ef-attachment[data-state="processing"] .ef-attachment__title{animation:none;color:var(--text-primary);background:none}}
`;

const classes = (base, className) => base + (className ? ' ' + className : '');

export const Attachment = React.forwardRef(function Attachment({ state = 'done', size = 'default', orientation = 'horizontal', className, ...props }, ref) {
  injectEfCss('ef-css-attachment', CSS);
  return <div ref={ref} data-state={state} data-size={size} data-orientation={orientation} className={classes('ef-attachment', className)} {...props} />;
});

export const AttachmentMedia = React.forwardRef(function AttachmentMedia({ variant = 'icon', className, ...props }, ref) {
  return <div ref={ref} data-variant={variant} className={classes('ef-attachment__media', className)} {...props} />;
});

export const AttachmentContent = React.forwardRef(function AttachmentContent({ className, ...props }, ref) {
  return <div ref={ref} className={classes('ef-attachment__content', className)} {...props} />;
});

export const AttachmentTitle = React.forwardRef(function AttachmentTitle({ className, ...props }, ref) {
  return <div ref={ref} className={classes('ef-attachment__title', className)} {...props} />;
});

export const AttachmentDescription = React.forwardRef(function AttachmentDescription({ className, ...props }, ref) {
  return <div ref={ref} className={classes('ef-attachment__description', className)} {...props} />;
});

export const AttachmentActions = React.forwardRef(function AttachmentActions({ className, ...props }, ref) {
  return <div ref={ref} className={classes('ef-attachment__actions', className)} {...props} />;
});

export const AttachmentAction = React.forwardRef(function AttachmentAction({ size = 'icon-xs', ...props }, ref) {
  return <Button ref={ref} size={size} {...props} />;
});

export const AttachmentTrigger = React.forwardRef(function AttachmentTrigger({ render, className, ...props }, ref) {
  const triggerProps = { ...props, className: classes('ef-attachment__trigger', className) };
  if (typeof render === 'function') return render({ ...triggerProps, ref });
  if (React.isValidElement(render)) {
    return React.cloneElement(render, {
      ...triggerProps,
      ...render.props,
      className: classes(triggerProps.className, render.props.className),
      ref: mergeRefs(ref, render.ref),
    });
  }
  return <button ref={ref} type="button" {...triggerProps} />;
});

export const AttachmentGroup = React.forwardRef(function AttachmentGroup({ className, ...props }, ref) {
  injectEfCss('ef-css-attachment', CSS);
  return <div ref={ref} className={classes('ef-attachment-group', className)} {...props} />;
});
