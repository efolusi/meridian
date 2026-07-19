export interface EmptyStateProps {
  /** Lucide icon name @default 'inbox' */
  icon?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Action slot, usually a primary Button */
  action?: React.ReactNode;
  /** Dashed hairline container */
  bordered?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function EmptyState(props: EmptyStateProps): React.JSX.Element;
