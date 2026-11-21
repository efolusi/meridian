export interface CounterProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The number to count up to. A value that is not a number renders as plain text. */
  value: number;
  /** BCP 47 locale for the digits and separators. A fixed default keeps the server and the browser the same, so pass the page's locale (`locale={lang}`). @default 'en' */
  locale?: string;
  /** Intl.NumberFormat options, such as `{ style: 'currency', currency: 'IDR' }` or `{ notation: 'compact' }`. */
  format?: Intl.NumberFormatOptions;
  /** Count up when it scrolls into view. False shows the final value at once. A counter already in view at load shows its final value and does not restart. @default true */
  animate?: boolean;
}
/** A stat number that counts up once it scrolls into view. The final value is always in the markup, so it reads correctly without JavaScript, with reduced motion and to screen readers. */
export declare const Counter: React.ForwardRefExoticComponent<CounterProps & React.RefAttributes<HTMLSpanElement>>;
