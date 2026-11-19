export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short labels that scroll past. Listed once for screen readers. */
  items: React.ReactNode[];
  /** Accessible name of the list. */
  label?: string;
  /** Seconds for one full loop. @default 36 */
  duration?: number;
  /** Language of the pause button labels. @default 'en' */
  lang?: 'en' | 'id';
  /** Override the pause button labels. */
  labels?: Partial<Record<'pause' | 'play', string>>;
}
/** A slow strip of labels. Pauses on hover, on keyboard focus and with its pause button; still with reduced motion. */
export declare const Marquee: React.ForwardRefExoticComponent<MarqueeProps & React.RefAttributes<HTMLDivElement>>;
