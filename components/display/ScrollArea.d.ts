export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Scroll past this height */
  maxHeight?: number | string;
  /** Fixed height */
  height?: number | string;
  children?: React.ReactNode;
}
export declare function ScrollArea(props: ScrollAreaProps): React.JSX.Element;
