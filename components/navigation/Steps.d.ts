export interface StepItem {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
}
export interface StepsProps {
  items: StepItem[];
  /** Index of the active step; earlier = done @default 0 */
  current?: number;
  /** @default 'vertical' */
  orientation?: 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
}
export declare function Steps(props: StepsProps): JSX.Element;
