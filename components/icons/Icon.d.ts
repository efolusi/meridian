export interface IconProps {
  /** Lucide icon name matching a file in assets/icons/, e.g. "arrow-right" */
  name: string;
  /** Square size in px @default 16 */
  size?: number;
  /** Stroke width @default 1.5 */
  strokeWidth?: number;
  /** Accessible label; omit for decorative icons */
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Icon(props: IconProps): React.JSX.Element;
