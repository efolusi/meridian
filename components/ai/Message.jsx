import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';

const CSS = `
.ef-message{display:flex;width:100%;align-items:flex-end;gap:10px}
.ef-message[data-align=end]{flex-direction:row-reverse}
.ef-message__avatar{display:flex;flex:0 0 auto;align-items:flex-end}
.ef-message:has(.ef-message__footer)>.ef-message__avatar{align-self:flex-end;margin-block-end:25px}
.ef-message__content{display:flex;min-width:0;max-width:min(82%,680px);flex-direction:column;align-items:flex-start;gap:5px}
.ef-message[data-align=end]>.ef-message__content{align-items:flex-end}
.ef-message__header{display:flex;min-width:0;align-items:center;gap:8px;padding-inline:2px;color:var(--text-secondary);font-size:var(--text-xs);line-height:1.4}
.ef-message__footer{display:flex;min-height:20px;align-items:center;gap:8px;padding-inline:2px;color:var(--text-muted);font-size:var(--text-xs);line-height:1.4}
.ef-message[data-align=end] .ef-message__footer{justify-content:flex-end}
.ef-message-group{display:flex;width:100%;flex-direction:column;gap:6px}
.ef-message-group[data-align=end]{align-items:flex-end}
.ef-message-group[data-align=start]{align-items:flex-start}
`;

const join = (...values) => values.filter(Boolean).join(' ');

export const Message = React.forwardRef(function Message({ align = 'start', className, ...props }, ref) {
  injectEfCss('ef-css-message', CSS);
  return <div {...props} ref={ref} data-slot="message" data-align={align} className={join('ef-message', className)} />;
});

export const MessageGroup = React.forwardRef(function MessageGroup({ align = 'start', className, ...props }, ref) {
  injectEfCss('ef-css-message', CSS);
  return <div {...props} ref={ref} data-slot="message-group" data-align={align} className={join('ef-message-group', className)} />;
});

export const MessageAvatar = React.forwardRef(function MessageAvatar({ className, ...props }, ref) {
  return <div {...props} ref={ref} data-slot="message-avatar" className={join('ef-message__avatar', className)} />;
});

export const MessageContent = React.forwardRef(function MessageContent({ className, ...props }, ref) {
  return <div {...props} ref={ref} data-slot="message-content" className={join('ef-message__content', className)} />;
});

export const MessageHeader = React.forwardRef(function MessageHeader({ className, ...props }, ref) {
  return <div {...props} ref={ref} data-slot="message-header" className={join('ef-message__header', className)} />;
});

export const MessageFooter = React.forwardRef(function MessageFooter({ className, ...props }, ref) {
  return <div {...props} ref={ref} data-slot="message-footer" className={join('ef-message__footer', className)} />;
});
