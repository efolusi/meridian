export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Field label rendered above. */
  label?: string;
  /** Muted helper text below. */
  hint?: string;
  /** Error message below; also sets invalid styling. */
  error?: string;
  /** Meridian icon name inside the field at inline start. */
  iconLeft?: string;
  /** Native numeric width or Meridian's additive visual sizes. */
  size?: number | 'sm' | 'md' | 'lg';
  invalid?: boolean;
  /** Adds a show/hide button to a password field. */
  revealable?: boolean;
  /** @default 'Show password' */
  revealLabel?: string;
  /** @default 'Hide password' */
  hideLabel?: string;
}
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
