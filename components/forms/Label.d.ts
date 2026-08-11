export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Red asterisk */
  required?: boolean;
  /** Muted inline hint after the text */
  hint?: React.ReactNode;
}
export declare const Label: React.ForwardRefExoticComponent<LabelProps & React.RefAttributes<HTMLLabelElement>>;
