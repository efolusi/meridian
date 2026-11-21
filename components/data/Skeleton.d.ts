export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A light band sweeps across the block instead of the block pulsing. Reduced motion shows a still block. @default false */
  shimmer?: boolean;
}
export declare const Skeleton: React.ForwardRefExoticComponent<SkeletonProps & React.RefAttributes<HTMLDivElement>>;
