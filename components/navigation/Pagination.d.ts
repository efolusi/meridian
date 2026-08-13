export type PaginationProps = React.HTMLAttributes<HTMLElement>;
export interface PaginationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> { isActive?: boolean; size?: 'default' | 'icon'; }
export interface PaginationDirectionProps extends PaginationLinkProps { text?: string; }
export declare const Pagination: React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<HTMLElement>>;
export declare const PaginationContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLUListElement> & React.RefAttributes<HTMLUListElement>>;
export declare const PaginationItem: React.ForwardRefExoticComponent<React.LiHTMLAttributes<HTMLLIElement> & React.RefAttributes<HTMLLIElement>>;
export declare const PaginationLink: React.ForwardRefExoticComponent<PaginationLinkProps & React.RefAttributes<HTMLAnchorElement>>;
export declare const PaginationPrevious: React.ForwardRefExoticComponent<PaginationDirectionProps & React.RefAttributes<HTMLAnchorElement>>;
export declare const PaginationNext: React.ForwardRefExoticComponent<PaginationDirectionProps & React.RefAttributes<HTMLAnchorElement>>;
export declare const PaginationEllipsis: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;
