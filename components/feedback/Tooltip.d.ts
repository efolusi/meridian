export interface TooltipProps {
  label: React.ReactNode;
  /** @default 'top' */
  position?: 'top' | 'bottom';
  /** The trigger element */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
