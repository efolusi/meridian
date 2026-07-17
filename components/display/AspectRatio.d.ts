export interface AspectRatioProps {
  /** width / height @default 16/9 */
  ratio?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function AspectRatio(props: AspectRatioProps): JSX.Element;
