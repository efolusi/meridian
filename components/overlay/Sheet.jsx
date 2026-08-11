import React from 'react';
import { injectEfCss } from '../forms/Button.jsx';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../feedback/Dialog.jsx';

const CSS = `
.ef-sheet{position:fixed;margin:0;max-width:none;max-height:none;border-radius:0;display:flex;flex-direction:column}
.ef-sheet[data-side=right]{top:0;right:0;bottom:0;width:min(75vw,384px);border-width:0 0 0 1px;animation:ef-sheet-right var(--dur-slow) var(--ease-out)}
.ef-sheet[data-side=left]{top:0;left:0;bottom:0;width:min(75vw,384px);border-width:0 1px 0 0;animation:ef-sheet-left var(--dur-slow) var(--ease-out)}
.ef-sheet[data-side=top]{top:0;left:0;right:0;width:100%;max-height:80vh;border-width:0 0 1px;animation:ef-sheet-top var(--dur-slow) var(--ease-out)}
.ef-sheet[data-side=bottom]{bottom:0;left:0;right:0;width:100%;max-height:80vh;border-width:1px 0 0;animation:ef-sheet-bottom var(--dur-slow) var(--ease-out)}
.ef-sheet__header{padding:24px 24px 12px}.ef-sheet__footer{margin-top:auto}.ef-sheet__description{margin-top:4px}
@keyframes ef-sheet-right{from{transform:translateX(24px);opacity:0}}@keyframes ef-sheet-left{from{transform:translateX(-24px);opacity:0}}@keyframes ef-sheet-top{from{transform:translateY(-24px);opacity:0}}@keyframes ef-sheet-bottom{from{transform:translateY(24px);opacity:0}}
`;

export const Sheet = Dialog;
export const SheetTrigger = DialogTrigger;
export const SheetClose = DialogClose;

export const SheetContent = React.forwardRef(function SheetContent({ side = 'right', className, children, style, ...props }, ref) {
  injectEfCss('ef-css-sheet', CSS);
  return <DialogContent {...props} ref={ref} slot="sheet-content" data-side={side} className={`ef-sheet${className ? ' ' + className : ''}`} width="none" style={{ ...style, position: 'fixed' }}>{children}</DialogContent>;
});
export const SheetHeader = React.forwardRef(function SheetHeader({ className, ...props }, ref) { return <DialogHeader {...props} ref={ref} slot="sheet-header" className={`ef-sheet__header${className ? ' ' + className : ''}`} />; });
export const SheetFooter = React.forwardRef(function SheetFooter({ className, ...props }, ref) { return <DialogFooter {...props} ref={ref} slot="sheet-footer" className={`ef-sheet__footer${className ? ' ' + className : ''}`} />; });
export const SheetTitle = React.forwardRef(function SheetTitle(props, ref) { return <DialogTitle {...props} ref={ref} slot="sheet-title" />; });
export const SheetDescription = React.forwardRef(function SheetDescription({ className, ...props }, ref) { return <DialogDescription {...props} ref={ref} slot="sheet-description" className={`ef-sheet__description${className ? ' ' + className : ''}`} />; });
