export interface CounterProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The number to count up to. */
  value: number;
  /** BCP 47 locale for the digits and separators. @default the page locale */
  locale?: string;
  /** Intl.NumberFormat options, such as `{ style: 'currency', currency: 'IDR' }` or `{ notation: 'compact' }`. */
  format?: Intl.NumberFormatOptions;
  /** Count up when it scrolls into view. False shows the final value at once. @default true */
  animate?: boolean;
}
/** A stat number that counts up once it scrolls into view. The final value is always in the markup, so it reads correctly without JavaScript, with reduced motion and to screen readers. */
export declare const Counter: React.ForwardRefExoticComponent<CounterProps & React.RefAttributes<HTMLSpanElement>>;
