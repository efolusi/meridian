export interface CalendarProps {
  /** Selected date as YYYY-MM-DD */
  value?: string;
  onChange?: (date: string) => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Calendar(props: CalendarProps): JSX.Element;
