import type * as React from 'react';
import type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuPortalProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuSubContentProps,
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuTriggerProps,
} from '../overlay/DropdownMenu.jsx';

export interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> { loop?: boolean; }
export declare const Menubar: React.ForwardRefExoticComponent<MenubarProps & React.RefAttributes<HTMLDivElement>>;

export interface MenubarMenuProps { children?: React.ReactNode; onOpenChange?: (open: boolean) => void; }
export declare function MenubarMenu(props: MenubarMenuProps): React.JSX.Element;

export interface MenubarTriggerProps extends DropdownMenuTriggerProps {}
export declare const MenubarTrigger: React.ForwardRefExoticComponent<MenubarTriggerProps & React.RefAttributes<HTMLElement>>;

export interface MenubarContentProps extends DropdownMenuContentProps {}
export declare const MenubarContent: React.ForwardRefExoticComponent<MenubarContentProps & React.RefAttributes<HTMLDivElement>>;

export interface MenubarPortalProps extends DropdownMenuPortalProps {}
export declare function MenubarPortal(props: MenubarPortalProps): React.JSX.Element;

export declare const MenubarGroup: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export interface MenubarRadioGroupProps extends DropdownMenuRadioGroupProps {}
export declare function MenubarRadioGroup(props: MenubarRadioGroupProps): React.JSX.Element;

export interface MenubarLabelProps extends DropdownMenuLabelProps {}
export declare const MenubarLabel: React.ForwardRefExoticComponent<MenubarLabelProps & React.RefAttributes<HTMLDivElement>>;
export declare const MenubarSeparator: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const MenubarShortcut: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;

export interface MenubarItemProps extends DropdownMenuItemProps {}
export declare const MenubarItem: React.ForwardRefExoticComponent<MenubarItemProps & React.RefAttributes<HTMLButtonElement>>;
export interface MenubarCheckboxItemProps extends DropdownMenuCheckboxItemProps {}
export declare const MenubarCheckboxItem: React.ForwardRefExoticComponent<MenubarCheckboxItemProps & React.RefAttributes<HTMLButtonElement>>;
export interface MenubarRadioItemProps extends DropdownMenuRadioItemProps {}
export declare const MenubarRadioItem: React.ForwardRefExoticComponent<MenubarRadioItemProps & React.RefAttributes<HTMLButtonElement>>;

export interface MenubarSubProps extends DropdownMenuSubProps {}
export declare function MenubarSub(props: MenubarSubProps): React.JSX.Element;
export interface MenubarSubTriggerProps extends DropdownMenuSubTriggerProps {}
export declare const MenubarSubTrigger: React.ForwardRefExoticComponent<MenubarSubTriggerProps & React.RefAttributes<HTMLButtonElement>>;
export interface MenubarSubContentProps extends DropdownMenuSubContentProps {}
export declare const MenubarSubContent: React.ForwardRefExoticComponent<MenubarSubContentProps & React.RefAttributes<HTMLDivElement>>;
