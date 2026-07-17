export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Lucide icon name, leading */
  icon?: string;
  /** Shows a remove ✕ button */
  onRemove?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}
export declare function Tag(props: TagProps): JSX.Element;
