/**
 * `default` is a quiet neutral badge (sunken surface, strong border, ink text).
 * `solid` is the filled accent badge, the same fill as the primary button.
 */
export type BadgeVariant = 'default' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'link' | 'solid';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default 'default' */
  variant?: BadgeVariant;
  /** Render the single child as the badge root. */
  asChild?: boolean;
}

export declare function badgeVariants(options?: Pick<BadgeProps, 'variant'> & { className?: string }): string;
export declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLElement>>;
