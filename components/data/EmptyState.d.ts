export type EmptyElementProps = React.HTMLAttributes<HTMLDivElement>;
export declare const Empty: React.ForwardRefExoticComponent<EmptyElementProps & React.RefAttributes<HTMLDivElement>>;
export declare const EmptyHeader: React.ForwardRefExoticComponent<EmptyElementProps & React.RefAttributes<HTMLDivElement>>;
export interface EmptyMediaProps extends EmptyElementProps { variant?: 'default' | 'icon'; }
export declare const EmptyMedia: React.ForwardRefExoticComponent<EmptyMediaProps & React.RefAttributes<HTMLDivElement>>;
export declare const EmptyTitle: React.ForwardRefExoticComponent<EmptyElementProps & React.RefAttributes<HTMLDivElement>>;
export declare const EmptyDescription: React.ForwardRefExoticComponent<EmptyElementProps & React.RefAttributes<HTMLDivElement>>;
export declare const EmptyContent: React.ForwardRefExoticComponent<EmptyElementProps & React.RefAttributes<HTMLDivElement>>;
export interface EmptyStateProps extends Omit<EmptyElementProps, 'title'> { icon?: string; title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; bordered?: boolean; }
export declare const EmptyState: React.ForwardRefExoticComponent<EmptyStateProps & React.RefAttributes<HTMLDivElement>>;
