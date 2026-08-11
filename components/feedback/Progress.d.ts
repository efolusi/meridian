export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value. Omit or pass null for an indeterminate progress bar. */
  value?: number | null;
  /** Positive maximum value. @default 100 */
  max?: number;
  /** Optional integrated label retained for Meridian consumers. */
  label?: string;
  /** Show a formatted value beside the integrated label. */
  showValue?: boolean;
  format?: (value: number, max: number) => string;
  /** Optional semantic tone retained for Meridian consumers. @default 'default' */
  tone?: 'default' | 'warning' | 'danger';
}
export declare const Progress: React.ForwardRefExoticComponent<ProgressProps & React.RefAttributes<HTMLDivElement>>;
