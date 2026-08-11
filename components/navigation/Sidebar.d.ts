import * as React from 'react';
export type SidebarContextValue = { state: 'expanded' | 'collapsed'; open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>>; openMobile: boolean; setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>; isMobile: boolean; toggleSidebar: () => void };
export function useSidebar(): SidebarContextValue;
export interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> { defaultOpen?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void }
export const SidebarProvider: React.ForwardRefExoticComponent<SidebarProviderProps & React.RefAttributes<HTMLDivElement>>;
export interface SidebarProps extends React.HTMLAttributes<HTMLElement> { side?: 'left' | 'right'; variant?: 'sidebar' | 'floating' | 'inset'; collapsible?: 'offcanvas' | 'icon' | 'none'; dir?: 'ltr' | 'rtl' }
export const Sidebar: React.ForwardRefExoticComponent<SidebarProps & React.RefAttributes<HTMLElement>>;
type DivPart = React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
type ListPart = React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLUListElement> & React.RefAttributes<HTMLUListElement>>;
type ItemPart = React.ForwardRefExoticComponent<React.LiHTMLAttributes<HTMLLIElement> & React.RefAttributes<HTMLLIElement>>;
export const SidebarHeader: DivPart; export const SidebarFooter: DivPart; export const SidebarContent: DivPart; export const SidebarGroup: DivPart; export const SidebarGroupContent: DivPart;
export const SidebarInset: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>>;
export const SidebarMenu: ListPart; export const SidebarMenuItem: ItemPart; export const SidebarMenuSub: ListPart; export const SidebarMenuSubItem: ItemPart;
export const SidebarInput: React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>;
export const SidebarSeparator: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHRElement> & React.RefAttributes<HTMLHRElement>>;
export interface SidebarComposableProps extends React.HTMLAttributes<HTMLElement> { render?: React.ReactElement }
export const SidebarGroupLabel: React.ForwardRefExoticComponent<SidebarComposableProps & React.RefAttributes<HTMLElement>>;
export const SidebarGroupAction: React.ForwardRefExoticComponent<SidebarComposableProps & React.RefAttributes<HTMLElement>>;
export interface SidebarMenuButtonProps extends React.HTMLAttributes<HTMLElement> { render?: React.ReactElement; href?: string; isActive?: boolean; size?: 'default' | 'sm' | 'lg'; tooltip?: React.ReactNode }
export const SidebarMenuButton: React.ForwardRefExoticComponent<SidebarMenuButtonProps & React.RefAttributes<HTMLElement>>;
export interface SidebarMenuActionProps extends SidebarComposableProps { showOnHover?: boolean }
export const SidebarMenuAction: React.ForwardRefExoticComponent<SidebarMenuActionProps & React.RefAttributes<HTMLElement>>;
export const SidebarMenuBadge: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;
export interface SidebarMenuSubButtonProps extends SidebarComposableProps { href?: string; isActive?: boolean; size?: 'sm' | 'md' }
export const SidebarMenuSubButton: React.ForwardRefExoticComponent<SidebarMenuSubButtonProps & React.RefAttributes<HTMLElement>>;
export interface SidebarMenuSkeletonProps extends React.HTMLAttributes<HTMLDivElement> { showIcon?: boolean }
export const SidebarMenuSkeleton: React.ForwardRefExoticComponent<SidebarMenuSkeletonProps & React.RefAttributes<HTMLDivElement>>;
export const SidebarTrigger: React.ForwardRefExoticComponent<SidebarComposableProps & React.RefAttributes<HTMLElement>>;
export const SidebarRail: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
