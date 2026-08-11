import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { injectEfCss } from '../forms/Button.jsx';
const CSS = `
.ef-empty{display:flex;min-width:0;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:48px 24px;text-align:center}
.ef-empty--bordered{border:1px dashed var(--border-default);border-radius:var(--radius-md)}
.ef-empty__header{display:flex;max-width:420px;flex-direction:column;align-items:center;gap:6px}
.ef-empty__media{display:flex;align-items:center;justify-content:center;color:var(--text-muted)}
.ef-empty__media[data-variant="icon"]{width:40px;height:40px;margin-block-end:6px;border-radius:var(--radius-md);background:var(--surface-sunken);color:var(--text-secondary)}
.ef-empty__title{margin:0;font-size:var(--text-lg);font-weight:var(--weight-semibold);line-height:var(--leading-tight);color:var(--text-primary)}
.ef-empty__description{max-width:380px;font-size:var(--text-sm);line-height:var(--leading-relaxed);color:var(--text-muted);text-wrap:balance}
.ef-empty__content{display:flex;max-width:420px;flex-direction:column;align-items:center;gap:8px}
`;
function cx(base, className) { return base + (className ? ` ${className}` : ''); }
export const Empty = React.forwardRef(function Empty({ className, ...rest }, ref) {
  injectEfCss('ef-css-empty', CSS);
  return <div {...rest} ref={ref} data-slot="empty" className={cx('ef-empty', className)} />;
});
export const EmptyHeader = React.forwardRef(function EmptyHeader({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="empty-header" className={cx('ef-empty__header', className)} />;
});
export const EmptyMedia = React.forwardRef(function EmptyMedia({ variant = 'default', className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="empty-media" data-variant={variant === 'icon' ? 'icon' : 'default'} className={cx('ef-empty__media', className)} />;
});
export const EmptyTitle = React.forwardRef(function EmptyTitle({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="empty-title" className={cx('ef-empty__title', className)} />;
});
export const EmptyDescription = React.forwardRef(function EmptyDescription({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="empty-description" className={cx('ef-empty__description', className)} />;
});
export const EmptyContent = React.forwardRef(function EmptyContent({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} data-slot="empty-content" className={cx('ef-empty__content', className)} />;
});
/** Legacy convenience adapter retained for existing Meridian applications. */
export const EmptyState = React.forwardRef(function EmptyState({ icon = 'inbox', title, description, action, bordered, className, ...rest }, ref) {
  return <Empty {...rest} ref={ref} className={`${bordered ? 'ef-empty--bordered' : ''}${className ? ` ${className}` : ''}`}>
    <EmptyHeader><EmptyMedia variant="icon"><Icon name={icon} size={24} /></EmptyMedia><EmptyTitle>{title}</EmptyTitle>{description ? <EmptyDescription>{description}</EmptyDescription> : null}</EmptyHeader>
    {action ? <EmptyContent>{action}</EmptyContent> : null}
  </Empty>;
});
