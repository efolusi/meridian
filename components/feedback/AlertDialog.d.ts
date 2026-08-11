import type * as React from 'react';
import type { ButtonProps } from '../forms/Button.jsx';

export interface AlertDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export interface AlertDialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { asChild?: boolean; }
export interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'sm';
  forceMount?: boolean;
}
export interface AlertDialogPortalProps { forceMount?: boolean; container?: HTMLElement | null; children?: React.ReactNode; }
export interface AlertDialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> { forceMount?: boolean; }
export interface AlertDialogActionProps extends ButtonProps { asChild?: boolean; }
export interface AlertDialogCancelProps extends ButtonProps { asChild?: boolean; }

export declare function AlertDialog(props: AlertDialogProps): React.JSX.Element;
export declare const AlertDialogTrigger: React.ForwardRefExoticComponent<AlertDialogTriggerProps & React.RefAttributes<HTMLButtonElement>>;
export declare function AlertDialogPortal(props: AlertDialogPortalProps): React.JSX.Element | null;
export declare const AlertDialogOverlay: React.ForwardRefExoticComponent<AlertDialogOverlayProps & React.RefAttributes<HTMLDivElement>>;
export declare const AlertDialogContent: React.ForwardRefExoticComponent<AlertDialogContentProps & React.RefAttributes<HTMLDivElement>>;
export declare const AlertDialogHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const AlertDialogFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const AlertDialogMedia: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const AlertDialogTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>>;
export declare const AlertDialogDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
export declare const AlertDialogAction: React.ForwardRefExoticComponent<AlertDialogActionProps & React.RefAttributes<HTMLButtonElement>>;
export declare const AlertDialogCancel: React.ForwardRefExoticComponent<AlertDialogCancelProps & React.RefAttributes<HTMLButtonElement>>;
