export interface DialogRootProps { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode; }
export interface DialogLegacyProps extends DialogRootProps { onClose?: () => void; closeLabel?: string; title?: React.ReactNode; description?: React.ReactNode; footer?: React.ReactNode; width?: number; }
export declare const Dialog: React.ForwardRefExoticComponent<DialogLegacyProps & React.RefAttributes<HTMLDivElement>>;
export interface DialogSlotProps extends React.HTMLAttributes<HTMLDivElement> { asChild?: boolean; }
export declare const DialogTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export declare function DialogPortal(props: { children?: React.ReactNode; container?: HTMLElement }): React.JSX.Element | null;
export declare const DialogOverlay: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const DialogClose: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean } & React.RefAttributes<HTMLButtonElement>>;
export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> { width?: number; showCloseButton?: boolean; closeLabel?: string; onEscapeKeyDown?: (event: KeyboardEvent) => void; }
export declare const DialogContent: React.ForwardRefExoticComponent<DialogContentProps & React.RefAttributes<HTMLDivElement>>;
export declare const DialogHeader: React.ForwardRefExoticComponent<DialogSlotProps & React.RefAttributes<HTMLDivElement>>;
export declare const DialogFooter: React.ForwardRefExoticComponent<DialogSlotProps & React.RefAttributes<HTMLDivElement>>;
export declare const DialogTitle: React.ForwardRefExoticComponent<DialogSlotProps & React.RefAttributes<HTMLDivElement>>;
export declare const DialogDescription: React.ForwardRefExoticComponent<DialogSlotProps & React.RefAttributes<HTMLDivElement>>;
