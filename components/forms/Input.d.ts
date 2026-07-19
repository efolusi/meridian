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
}
export declare function Input(props: InputProps): React.JSX.Element;
