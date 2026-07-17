export interface LabelProps {
  htmlFor?: string;
  /** Red asterisk */
  required?: boolean;
  /** Muted inline hint after the text */
  hint?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Label(props: LabelProps): JSX.Element;
