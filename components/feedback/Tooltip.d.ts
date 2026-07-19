export interface TooltipProps {
  label: React.ReactNode;
  /** Preferred side; flips automatically when there is no room. @default 'top' */
  position?: 'top' | 'bottom';
  /** Hover delay in ms before showing. Focus always shows immediately. @default 200 */
  delay?: number;
  /** The trigger element */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Tooltip(props: TooltipProps): React.JSX.Element;
