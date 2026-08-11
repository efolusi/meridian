export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** @default 'default' */
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link' | 'primary' | 'danger' | 'brand';
  /** @default 'default' */
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg' | 'md';
  /** Lucide icon name rendered before the label */
  iconLeft?: string;
  /** Lucide icon name rendered after the label */
  iconRight?: string;
  fullWidth?: boolean;
  /** Shows a spinner and disables the button */
  loading?: boolean;
  children?: React.ReactNode;
}
export declare function buttonVariants(options?: Pick<ButtonProps, 'variant' | 'size'> & { className?: string }): string;
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
