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
  /** Names the navigation for screen readers; defaults to the built-in label */
  'aria-label'?: string;
  /** Language of the built-in label */
  lang?: 'en' | 'id';
  /** Override the built-in label: { nav } */
  labels?: { nav?: string };
}
export declare function TabBar(props: TabBarProps): React.JSX.Element;
