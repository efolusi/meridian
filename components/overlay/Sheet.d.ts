import type * as React from 'react';
import type { DialogContentProps, DialogRootProps, DialogSlotProps } from '../feedback/Dialog.jsx';
export declare const Sheet: React.ForwardRefExoticComponent<DialogRootProps & React.RefAttributes<HTMLDivElement>>;
export declare const SheetTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export declare const SheetClose: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export interface SheetContentProps extends DialogContentProps { side?: 'top' | 'right' | 'bottom' | 'left'; }
export declare const SheetContent: React.ForwardRefExoticComponent<SheetContentProps & React.RefAttributes<HTMLDivElement>>;
export declare const SheetHeader: React.ForwardRefExoticComponent<DialogSlotProps & React.RefAttributes<HTMLDivElement>>;
export declare const SheetFooter: React.ForwardRefExoticComponent<DialogSlotProps & React.RefAttributes<HTMLDivElement>>;
export declare const SheetTitle: React.ForwardRefExoticComponent<DialogSlotProps & React.RefAttributes<HTMLDivElement>>;
export declare const SheetDescription: React.ForwardRefExoticComponent<DialogSlotProps & React.RefAttributes<HTMLDivElement>>;
