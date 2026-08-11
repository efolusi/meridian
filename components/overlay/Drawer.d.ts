import type * as React from 'react';

export type DrawerDirection = 'top' | 'right' | 'bottom' | 'left';
export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  direction?: DrawerDirection;
  dismissible?: boolean;
  modal?: boolean;
  handleOnly?: boolean;
  children?: React.ReactNode;
}
export declare function Drawer(props: DrawerProps): React.JSX.Element;

export interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { asChild?: boolean; }
export declare const DrawerTrigger: React.ForwardRefExoticComponent<DrawerTriggerProps & React.RefAttributes<HTMLButtonElement>>;
export interface DrawerCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { asChild?: boolean; }
export declare const DrawerClose: React.ForwardRefExoticComponent<DrawerCloseProps & React.RefAttributes<HTMLButtonElement>>;
export interface DrawerPortalProps { children?: React.ReactNode; container?: HTMLElement; }
export declare function DrawerPortal(props: DrawerPortalProps): React.JSX.Element | null;
export declare const DrawerOverlay: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;

export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  overlayProps?: React.HTMLAttributes<HTMLDivElement>;
}
export declare const DrawerContent: React.ForwardRefExoticComponent<DrawerContentProps & React.RefAttributes<HTMLDivElement>>;
export declare const DrawerHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const DrawerFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const DrawerTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const DrawerDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
