export interface CarouselProps {
  /** One slide per child */
  children: React.ReactNode;
  /** CSS width of each item @default '280px' */
  itemWidth?: string;
  /** Px between items @default 14 */
  gap?: number;
  /** Prev / next arrows @default true */
  showControls?: boolean;
  /** Position dots below @default true */
  showDots?: boolean;
  ariaLabel?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Carousel(props: CarouselProps): JSX.Element;
