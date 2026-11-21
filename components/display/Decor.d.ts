export interface DecorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The pattern to draw. @default 'mesh' */
  pattern?: 'mesh' | 'noise' | 'grid' | 'dots';
  /** Fade the pattern out toward the bottom edge. @default false */
  fade?: boolean;
}
/** A decorative backdrop drawn in CSS only. Always `aria-hidden`, never animated, hidden in forced-colors mode. Put it inside a parent with `position: relative; isolation: isolate`. */
export declare const Decor: React.ForwardRefExoticComponent<DecorProps & React.RefAttributes<HTMLDivElement>>;
