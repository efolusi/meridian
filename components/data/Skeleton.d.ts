export interface SkeletonProps {
  /** @default 'text' */
  variant?: 'text' | 'rect' | 'circle';
  width?: number | string;
  height?: number | string;
  /** Stacked text lines (last one 60% wide) @default 1 */
  lines?: number;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Skeleton(props: SkeletonProps): JSX.Element;
