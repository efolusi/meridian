export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default 'neutral' */
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'brand';
  /** @default 'sm' */
  size?: 'sm' | 'md';
  /** Leading status dot */
  dot?: boolean;
  children?: React.ReactNode;
}
export declare function Badge(props: BadgeProps): React.JSX.Element;
