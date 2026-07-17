export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  /** @default 'md' */
  size?: 'sm' | 'md';
}
export declare function Switch(props: SwitchProps): JSX.Element;
