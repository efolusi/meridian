export interface TabBarItem {
  id: string;
  label: React.ReactNode;
  href: string;
  /** Lucide icon name */
  icon?: string;
}
export interface TabBarProps extends React.HTMLAttributes<HTMLElement> {
  /** Three to five destinations */
  items: TabBarItem[];
  /** Id of the current destination; it gets aria-current="page" */
  value?: string;
  /** Required: names the navigation for screen readers */
  'aria-label': string;
}
export declare function TabBar(props: TabBarProps): React.JSX.Element;
