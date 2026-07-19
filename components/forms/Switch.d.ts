export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode;
  /** @default 'md' */
  size?: 'sm' | 'md';
}
export declare function Switch(props: SwitchProps): React.JSX.Element;
