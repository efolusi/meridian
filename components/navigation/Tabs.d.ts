export interface TabItem {
  id: string;
  label: React.ReactNode;
  /** Lucide icon name */
  icon?: string;
  /** Count pill */
  count?: number;
}
export interface TabsProps {
  items: TabItem[];
  /** Active item id (controlled) */
  value: string;
  onChange?: (id: string) => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Tabs(props: TabsProps): JSX.Element;
