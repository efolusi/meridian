export interface TabItem {
  id: string;
  label: React.ReactNode;
  /** Lucide icon name */
  icon?: string;
  /** Count pill */
  count?: number;
}
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items?: TabItem[];
  /** Active item id (controlled) */
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  onChange?: (id: string) => void;
  orientation?: 'horizontal' | 'vertical';
}
export declare const Tabs: React.ForwardRefExoticComponent<TabsProps & React.RefAttributes<HTMLDivElement>>;
export declare const TabsList: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'line' } & React.RefAttributes<HTMLDivElement>>;
export declare const TabsTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string } & React.RefAttributes<HTMLButtonElement>>;
export declare const TabsContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & { value: string; forceMount?: boolean } & React.RefAttributes<HTMLDivElement>>;
