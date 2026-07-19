export interface LoaderProps {
  /** 'pulse' | 'shimmer' */
  variant?: 'pulse' | 'shimmer';
  /** Trailing animated ellipsis */
  dots?: boolean;
  /** Cycle duration in seconds */
  duration?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Loader(props: LoaderProps): React.JSX.Element;
