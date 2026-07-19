export interface ToolbarItem {
  id: string;
  /** Lucide icon */
  icon?: string;
  label?: React.ReactNode;
  /** Tooltip text */
  tip?: string;
  disabled?: boolean;
  onClick?: () => void;
}
export interface ToolbarProps {
  /** Items; 'separator' inserts a divider */
  items: Array<ToolbarItem | 'separator'>;
  /** Active id or ids (toggle styling) */
  value?: string | string[];
  onChange?: (id: string) => void;
  /** aria-label */
  label?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Toolbar(props: ToolbarProps): React.JSX.Element;
