import type * as React from 'react';

export interface NavigationMenuProps extends React.HTMLAttributes<HTMLElement> { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; viewport?: boolean; delayDuration?: number; skipDelayDuration?: number; orientation?: 'horizontal' | 'vertical'; }
export declare const NavigationMenu: React.ForwardRefExoticComponent<NavigationMenuProps & React.RefAttributes<HTMLElement>>;
export declare const NavigationMenuList: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLUListElement> & React.RefAttributes<HTMLUListElement>>;
export interface NavigationMenuItemProps extends React.LiHTMLAttributes<HTMLLIElement> { value?: string; }
export declare const NavigationMenuItem: React.ForwardRefExoticComponent<NavigationMenuItemProps & React.RefAttributes<HTMLLIElement>>;
export declare const NavigationMenuTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export interface NavigationMenuContentProps extends React.HTMLAttributes<HTMLDivElement> { forceMount?: boolean; }
export declare const NavigationMenuContent: React.ForwardRefExoticComponent<NavigationMenuContentProps & React.RefAttributes<HTMLDivElement>>;
export interface NavigationMenuLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> { asChild?: boolean; active?: boolean; }
export declare const NavigationMenuLink: React.ForwardRefExoticComponent<NavigationMenuLinkProps & React.RefAttributes<HTMLAnchorElement>>;
export declare const NavigationMenuIndicator: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const NavigationMenuViewport: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare function navigationMenuTriggerStyle(): string;
