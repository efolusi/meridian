export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default 'default' */
  variant?: BadgeVariant;
  /** Render the single child as the badge root. */
  asChild?: boolean;
}

export declare function badgeVariants(options?: Pick<BadgeProps, 'variant'> & { className?: string }): string;
export declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLElement>>;
