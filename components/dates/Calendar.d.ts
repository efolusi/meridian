export interface DateRange {
  /** Range start as YYYY-MM-DD, or null while unset */
  from: string | null;
  /** Range end as YYYY-MM-DD, or null while unset */
  to: string | null;
}
export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Single-date mode (the default) */
  range?: false;
  /** Selected date as YYYY-MM-DD */
  value?: string;
  onChange?: (date: string) => void;
  /** BCP 47 locale for month and weekday names via Intl (e.g. 'id', 'en'); omit for English. The grid stays Monday-first for every locale. */
  locale?: string;
  style?: React.CSSProperties;
  className?: string;
}
export interface CalendarRangeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Range mode: value/onChange carry a {from,to} pair; first pick sets from, second sets to (swapped when earlier), third starts over */
  range: true;
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  /** BCP 47 locale for month and weekday names via Intl (e.g. 'id', 'en'); omit for English. The grid stays Monday-first for every locale. */
  locale?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Calendar(props: CalendarProps | CalendarRangeProps): React.JSX.Element;
