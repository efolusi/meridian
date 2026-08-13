import type * as React from 'react';

export type BreadcrumbProps = React.ComponentPropsWithoutRef<'nav'>;
export type BreadcrumbListProps = React.ComponentPropsWithoutRef<'ol'>;
export type BreadcrumbItemProps = React.ComponentPropsWithoutRef<'li'>;
export interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<'a'> {
  asChild?: boolean;
}
export type BreadcrumbPageProps = React.ComponentPropsWithoutRef<'span'>;
export type BreadcrumbSeparatorProps = React.ComponentPropsWithoutRef<'li'>;
export type BreadcrumbEllipsisProps = React.ComponentPropsWithoutRef<'span'>;

export declare const Breadcrumb: React.ForwardRefExoticComponent<BreadcrumbProps & React.RefAttributes<HTMLElement>>;
export declare const BreadcrumbList: React.ForwardRefExoticComponent<BreadcrumbListProps & React.RefAttributes<HTMLOListElement>>;
export declare const BreadcrumbItem: React.ForwardRefExoticComponent<BreadcrumbItemProps & React.RefAttributes<HTMLLIElement>>;
export declare const BreadcrumbLink: React.ForwardRefExoticComponent<BreadcrumbLinkProps & React.RefAttributes<HTMLAnchorElement>>;
export declare const BreadcrumbPage: React.ForwardRefExoticComponent<BreadcrumbPageProps & React.RefAttributes<HTMLSpanElement>>;
export declare const BreadcrumbSeparator: React.ForwardRefExoticComponent<BreadcrumbSeparatorProps & React.RefAttributes<HTMLLIElement>>;
export declare const BreadcrumbEllipsis: React.ForwardRefExoticComponent<BreadcrumbEllipsisProps & React.RefAttributes<HTMLSpanElement>>;
