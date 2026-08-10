export type TimelineTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface TimelineItem {
  id?: React.Key;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Human-readable time shown in the UI. */
  time?: React.ReactNode;
  /** Machine-readable ISO date/time passed to the native time element. */
  dateTime?: string;
  actor?: React.ReactNode;
  meta?: React.ReactNode;
  tone?: TimelineTone;
  /** Lucide icon name. Defaults from tone. */
  icon?: string;
}

export interface TimelineProps extends Omit<React.OlHTMLAttributes<HTMLOListElement>, 'children'> {
  items: TimelineItem[];
  compact?: boolean;
}

export declare function Timeline(props: TimelineProps): React.JSX.Element;

