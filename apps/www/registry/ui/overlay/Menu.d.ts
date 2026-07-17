export interface MenuItem {
  id: string;
  label: React.ReactNode;
  /** Lucide icon name */
  icon?: string;
  /** Red destructive styling */
  danger?: boolean;
  disabled?: boolean;
  /** Shortcut hint, e.g. "⌘D" */
  kbd?: string;
  onClick?: () => void;
}
export interface MenuProps {
  /** The element that toggles the menu (Button, IconButton, …) */
  trigger: React.ReactNode;
  /** Items; the string 'separator' inserts a rule */
  items: Array<MenuItem | 'separator'>;
  onSelect?: (id: string) => void;
  /** Panel edge alignment @default 'left' */
  align?: 'left' | 'right';
  style?: React.CSSProperties;
  className?: string;
}
export declare function Menu(props: MenuProps): JSX.Element;
