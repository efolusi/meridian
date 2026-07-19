export interface CopyFieldProps extends React.HTMLAttributes<HTMLSpanElement> {
  label?: string;
  /** The copyable value (mono) */
  value: string;
  /** Mask with dots + reveal toggle */
  secret?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function CopyField(props: CopyFieldProps): React.JSX.Element;
