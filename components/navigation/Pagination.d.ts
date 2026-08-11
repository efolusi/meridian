export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Legacy controlled page adapter. */ page?: number;
  /** Legacy total-pages adapter. */ pageCount?: number;
  /** Legacy page callback. */ onChange?: (page: number) => void;
}
export interface PaginationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> { isActive?: boolean; size?: 'default' | 'icon'; }
export declare const Pagination: React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<HTMLElement>>;
export declare const PaginationContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLUListElement> & React.RefAttributes<HTMLUListElement>>;
export declare const PaginationItem: React.ForwardRefExoticComponent<React.LiHTMLAttributes<HTMLLIElement> & React.RefAttributes<HTMLLIElement>>;
export declare const PaginationLink: React.ForwardRefExoticComponent<PaginationLinkProps & React.RefAttributes<HTMLAnchorElement>>;
export declare const PaginationPrevious: React.ForwardRefExoticComponent<PaginationLinkProps & React.RefAttributes<HTMLAnchorElement>>;
export declare const PaginationNext: React.ForwardRefExoticComponent<PaginationLinkProps & React.RefAttributes<HTMLAnchorElement>>;
export declare const PaginationEllipsis: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;
