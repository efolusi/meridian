export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  hint?: string;
  /** Options as strings or {value, label}; alternatively pass <option> children */
  options?: Array<string | { value: string; label: string }>;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
}
export declare function Select(props: SelectProps): React.JSX.Element;
