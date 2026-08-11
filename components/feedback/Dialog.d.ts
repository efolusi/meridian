export interface DialogRootProps { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode; }
export declare function Dialog(props: DialogRootProps): React.JSX.Element;
export interface DialogSlotProps extends React.HTMLAttributes<HTMLDivElement> { asChild?: boolean; slot?: string; }
export declare const DialogTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; slot?: string } & React.RefAttributes<HTMLButtonElement>>;
export declare function DialogPortal(props: { children?: React.ReactNode; container?: HTMLElement }): React.JSX.Element | null;
export declare const DialogOverlay: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & { slot?: string } & React.RefAttributes<HTMLDivElement>>;
export declare const DialogClose: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; slot?: string } & React.RefAttributes<HTMLButtonElement>>;
export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> { width?: number | string; showCloseButton?: boolean; closeLabel?: string; onEscapeKeyDown?: (event: KeyboardEvent) => void; slot?: string; }
export declare const DialogContent: React.ForwardRefExoticComponent<DialogContentProps & React.RefAttributes<HTMLDivElement>>;
export declare const DialogHeader: React.ForwardRefExoticComponent<DialogSlotProps & React.RefAttributes<HTMLDivElement>>;
export declare const DialogFooter: React.ForwardRefExoticComponent<DialogSlotProps & React.RefAttributes<HTMLDivElement>>;
export declare const DialogTitle: React.ForwardRefExoticComponent<DialogSlotProps & React.RefAttributes<HTMLDivElement>>;
export declare const DialogDescription: React.ForwardRefExoticComponent<DialogSlotProps & React.RefAttributes<HTMLDivElement>>;
