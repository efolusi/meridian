export interface DatePickerProps {
  label?: string;
  /** Controlled YYYY-MM-DD */
  value?: string;
  defaultValue?: string;
  onChange?: (date: string) => void;
  /** @default 'Pick a date' */
  placeholder?: string;
  /** BCP 47 locale for the trigger's date label and the calendar's names via Intl (e.g. 'id', 'en'); omit for en-US. */
  locale?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function DatePicker(props: DatePickerProps): React.JSX.Element;
