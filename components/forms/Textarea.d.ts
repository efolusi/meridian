export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  /** Error message below — also sets invalid styling */
  error?: string;
  invalid?: boolean;
}
export declare function Textarea(props: TextareaProps): JSX.Element;
