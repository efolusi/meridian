export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Scroll past this height */
  maxHeight?: number | string;
  /** Fixed height */
  height?: number | string;
  children?: React.ReactNode;
}
export interface ScrollBarProps extends React.HTMLAttributes<HTMLSpanElement> { orientation?: 'horizontal' | 'vertical'; }
export declare const ScrollArea: React.ForwardRefExoticComponent<ScrollAreaProps & React.RefAttributes<HTMLDivElement>>;
export declare const ScrollBar: React.ForwardRefExoticComponent<ScrollBarProps & React.RefAttributes<HTMLSpanElement>>;
