export interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label rendered above */
  label?: string;
  /** Muted helper text below */
  hint?: string;
  /** Error message below — also sets invalid styling */
  error?: string;
  /** Leading addon: string renders a tinted cell, a node renders bare */
  prefix?: React.ReactNode;
  /** Trailing addon: string renders a tinted cell, a node renders bare */
  suffix?: React.ReactNode;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
}
export declare function InputGroup(props: InputGroupProps): JSX.Element;
