export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** @default 'primary' */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'brand';
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Lucide icon name rendered before the label */
  iconLeft?: string;
  /** Lucide icon name rendered after the label */
  iconRight?: string;
  fullWidth?: boolean;
  /** Shows a spinner and disables the button */
  loading?: boolean;
  children?: React.ReactNode;
}
export declare function Button(props: ButtonProps): React.JSX.Element;
