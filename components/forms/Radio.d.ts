export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  /** Muted second line under the label */
  description?: string;
}
export declare function Radio(props: RadioProps): React.JSX.Element;
