export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  /** Muted second line under the label */
  description?: string;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
