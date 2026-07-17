export interface TaskItem {
  /** Lucide icon name; omit for a dot */
  icon?: string;
  label: React.ReactNode;
  /** Muted inline detail after the label */
  detail?: React.ReactNode;
}
export interface TaskProps {
  items: TaskItem[];
  /** Pulses the last row while the agent works */
  streaming?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Task(props: TaskProps): JSX.Element;
