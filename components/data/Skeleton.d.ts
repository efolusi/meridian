export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Meridian legacy shape helper. @default 'text' */
  variant?: 'text' | 'rect' | 'circle';
  /** Meridian legacy width helper. */
  width?: number | string;
  /** Meridian legacy height helper. */
  height?: number | string;
  /** Meridian legacy stacked text lines helper. @default 1 */
  lines?: number;
}
export declare const Skeleton: React.ForwardRefExoticComponent<SkeletonProps & React.RefAttributes<HTMLDivElement>>;
