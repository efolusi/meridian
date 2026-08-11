import type * as React from 'react';

export interface ContextMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children?: React.ReactNode;
}
export declare function ContextMenu(props: ContextMenuProps): React.JSX.Element;

export interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLElement> { asChild?: boolean; disabled?: boolean; }
export declare const ContextMenuTrigger: React.ForwardRefExoticComponent<ContextMenuTriggerProps & React.RefAttributes<HTMLElement>>;

export interface ContextMenuPortalProps { children?: React.ReactNode; container?: HTMLElement | null; }
export declare function ContextMenuPortal(props: ContextMenuPortalProps): React.JSX.Element;

export interface ContextMenuContentProps extends React.HTMLAttributes<HTMLDivElement> { loop?: boolean; onCloseAutoFocus?: (event: { defaultPrevented: boolean; preventDefault(): void }) => void; }
export declare const ContextMenuContent: React.ForwardRefExoticComponent<ContextMenuContentProps & React.RefAttributes<HTMLDivElement>>;

export declare const ContextMenuGroup: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export interface ContextMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> { inset?: boolean; }
export declare const ContextMenuLabel: React.ForwardRefExoticComponent<ContextMenuLabelProps & React.RefAttributes<HTMLDivElement>>;
export declare const ContextMenuSeparator: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const ContextMenuShortcut: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;

export interface ContextMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { inset?: boolean; variant?: 'default' | 'destructive'; onSelect?: (event: React.SyntheticEvent) => void; }
export declare const ContextMenuItem: React.ForwardRefExoticComponent<ContextMenuItemProps & React.RefAttributes<HTMLButtonElement>>;

export interface ContextMenuCheckboxItemProps extends Omit<ContextMenuItemProps, 'onCheckedChange'> { checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void; }
export declare const ContextMenuCheckboxItem: React.ForwardRefExoticComponent<ContextMenuCheckboxItemProps & React.RefAttributes<HTMLButtonElement>>;

export interface ContextMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; }
export declare function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps): React.JSX.Element;
export interface ContextMenuRadioItemProps extends ContextMenuItemProps { value: string; }
export declare const ContextMenuRadioItem: React.ForwardRefExoticComponent<ContextMenuRadioItemProps & React.RefAttributes<HTMLButtonElement>>;

export interface ContextMenuSubProps { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode; }
export declare function ContextMenuSub(props: ContextMenuSubProps): React.JSX.Element;
export interface ContextMenuSubTriggerProps extends ContextMenuItemProps {}
export declare const ContextMenuSubTrigger: React.ForwardRefExoticComponent<ContextMenuSubTriggerProps & React.RefAttributes<HTMLButtonElement>>;
export interface ContextMenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> { sideOffset?: number; alignOffset?: number; loop?: boolean; }
export declare const ContextMenuSubContent: React.ForwardRefExoticComponent<ContextMenuSubContentProps & React.RefAttributes<HTMLDivElement>>;
