export interface ListItemProps {
  /** Lucide icon in a 32px sunken square */
  icon?: string;
  /** Custom leading node (Avatar, FileTypeIcon…) — overrides icon */
  media?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned slot (Badge, time, Switch…) */
  trailing?: React.ReactNode;
  /** Trailing chevron */
  chevron?: boolean;
  /** Renders as button */
  onClick?: (e: React.MouseEvent) => void;
  /** Renders as anchor */
  href?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function ListItem(props: ListItemProps): JSX.Element;
