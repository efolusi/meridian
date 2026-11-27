export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Scroll past this height */
  maxHeight?: number | string;
  /** Fixed height */
  height?: number | string;
  /** Default name of the viewport while you give none; the viewport is then a group. Translate it here @default 'Scroll area' */
  label?: string;
  /** Replaces the whole name of the viewport and makes it a region (it names the viewport, not the wrapper) */
  'aria-label'?: string;
  /** Names the viewport by another element and makes it a region; wins over `aria-label` */
  'aria-labelledby'?: string;
  children?: React.ReactNode;
}
export interface ScrollBarProps extends React.HTMLAttributes<HTMLSpanElement> { orientation?: 'horizontal' | 'vertical'; }
export declare const ScrollArea: React.ForwardRefExoticComponent<ScrollAreaProps & React.RefAttributes<HTMLDivElement>>;
export declare const ScrollBar: React.ForwardRefExoticComponent<ScrollBarProps & React.RefAttributes<HTMLSpanElement>>;
