import type * as React from 'react';

export interface DropdownMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children?: React.ReactNode;
}
export declare function DropdownMenu(props: DropdownMenuProps): React.JSX.Element;

export interface DropdownMenuTriggerProps extends React.HTMLAttributes<HTMLElement> { asChild?: boolean; disabled?: boolean; }
export declare const DropdownMenuTrigger: React.ForwardRefExoticComponent<DropdownMenuTriggerProps & React.RefAttributes<HTMLElement>>;

export interface DropdownMenuPortalProps { children?: React.ReactNode; container?: HTMLElement | null; }
export declare function DropdownMenuPortal(props: DropdownMenuPortalProps): React.JSX.Element;

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> { loop?: boolean; align?: 'start' | 'center' | 'end'; side?: 'top' | 'right' | 'bottom' | 'left'; sideOffset?: number; alignOffset?: number; onCloseAutoFocus?: (event: { defaultPrevented: boolean; preventDefault(): void }) => void; }
export declare const DropdownMenuContent: React.ForwardRefExoticComponent<DropdownMenuContentProps & React.RefAttributes<HTMLDivElement>>;

export declare const DropdownMenuGroup: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> { inset?: boolean; }
export declare const DropdownMenuLabel: React.ForwardRefExoticComponent<DropdownMenuLabelProps & React.RefAttributes<HTMLDivElement>>;
export declare const DropdownMenuSeparator: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const DropdownMenuShortcut: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { inset?: boolean; variant?: 'default' | 'destructive'; onSelect?: (event: React.SyntheticEvent) => void; }
export declare const DropdownMenuItem: React.ForwardRefExoticComponent<DropdownMenuItemProps & React.RefAttributes<HTMLButtonElement>>;

export interface DropdownMenuCheckboxItemProps extends Omit<DropdownMenuItemProps, 'onCheckedChange'> { checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void; }
export declare const DropdownMenuCheckboxItem: React.ForwardRefExoticComponent<DropdownMenuCheckboxItemProps & React.RefAttributes<HTMLButtonElement>>;

export interface DropdownMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; }
export declare function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps): React.JSX.Element;
export interface DropdownMenuRadioItemProps extends DropdownMenuItemProps { value: string; }
export declare const DropdownMenuRadioItem: React.ForwardRefExoticComponent<DropdownMenuRadioItemProps & React.RefAttributes<HTMLButtonElement>>;

export interface DropdownMenuSubProps { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode; }
export declare function DropdownMenuSub(props: DropdownMenuSubProps): React.JSX.Element;
export interface DropdownMenuSubTriggerProps extends DropdownMenuItemProps {}
export declare const DropdownMenuSubTrigger: React.ForwardRefExoticComponent<DropdownMenuSubTriggerProps & React.RefAttributes<HTMLButtonElement>>;
export interface DropdownMenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> { sideOffset?: number; alignOffset?: number; loop?: boolean; }
export declare const DropdownMenuSubContent: React.ForwardRefExoticComponent<DropdownMenuSubContentProps & React.RefAttributes<HTMLDivElement>>;
