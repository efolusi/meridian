export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'brand';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default 'default' */
  variant?: BadgeVariant;
  /** Meridian legacy color alias. */
  tone?: BadgeTone;
  /** Meridian legacy size helper. @default 'sm' */
  size?: 'sm' | 'md';
  /** Meridian legacy leading status dot. */
  dot?: boolean;
  /** Render the single child as the badge root. */
  asChild?: boolean;
}

export declare function badgeVariants(options?: Pick<BadgeProps, 'variant' | 'tone' | 'size'> & { className?: string }): string;
export declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLElement>>;
