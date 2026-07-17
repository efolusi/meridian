export interface DatePickerProps {
  label?: string;
  /** Controlled YYYY-MM-DD */
  value?: string;
  defaultValue?: string;
  onChange?: (date: string) => void;
  /** @default 'Pick a date' */
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function DatePicker(props: DatePickerProps): JSX.Element;
