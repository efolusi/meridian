export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Field label rendered above */
  label?: string;
  /** Muted helper text below */
  hint?: string;
  /** Error message below — also sets invalid styling */
  error?: string;
  /** Lucide icon name inside the field, left */
  iconLeft?: string;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  /** Adds a show/hide button to a `type="password"` field */
  revealable?: boolean;
  /** @default 'Show password' */
  revealLabel?: string;
  /** @default 'Hide password' */
  hideLabel?: string;
}
export declare function Input(props: InputProps): React.JSX.Element;
