export interface ResizableProps {
  /** @default 'horizontal' */
  direction?: 'horizontal' | 'vertical';
  /** First pane share, 0-1 @default 0.5 */
  defaultRatio?: number;
  /** @default 0.15 */
  min?: number;
  /** @default 0.85 */
  max?: number;
  onRatioChange?: (ratio: number) => void;
  /** Exactly two panes */
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Resizable(props: ResizableProps): JSX.Element;
