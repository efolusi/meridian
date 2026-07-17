export interface SpinnerProps {
  /** Px @default 16 */
  size?: number;
  /** Optional text right of the spinner (also the aria-label) */
  label?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Spinner(props: SpinnerProps): JSX.Element;
