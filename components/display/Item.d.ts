export type ItemVariant = 'default' | 'outline' | 'muted';
export type ItemSize = 'default' | 'sm' | 'xs';
export interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ItemVariant;
  size?: ItemSize;
  render?: React.ReactElement | ((props: React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }) => React.ReactElement);
  asChild?: boolean;
}
export interface ItemMediaProps extends React.HTMLAttributes<HTMLDivElement> { variant?: 'default' | 'icon' | 'image' }
export declare const Item: React.ForwardRefExoticComponent<ItemProps & React.RefAttributes<HTMLElement>>;
export declare const ItemGroup: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const ItemSeparator: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const ItemMedia: React.ForwardRefExoticComponent<ItemMediaProps & React.RefAttributes<HTMLDivElement>>;
export declare const ItemContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const ItemTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const ItemDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
export declare const ItemActions: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const ItemHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const ItemFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
