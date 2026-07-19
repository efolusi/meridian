export interface TodoItem {
  label: React.ReactNode;
  /** 'pending' | 'progress' | 'done' */
  status?: 'pending' | 'progress' | 'done';
}
export interface TodoProps {
  title?: string;
  items: TodoItem[];
  defaultOpen?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Todo(props: TodoProps): React.JSX.Element;
