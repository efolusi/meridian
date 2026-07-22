export interface TimePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Field label rendered above the input */
  label?: string;
  /** Muted helper line rendered below */
  hint?: string;
  /** Controlled time as 24h 'HH:MM', or null when empty (always 24h, whatever `format24` shows) */
  value?: string | null;
  onChange?: (time: string | null) => void;
  /** Minutes between listed slots @default 30 */
  stepMinutes?: number;
  /** First listed slot as 'HH:MM' @default '00:00' */
  minTime?: string;
  /** Slots stop at this 'HH:MM' @default '23:59' */
  maxTime?: string;
  /** 24h labels; false renders 12h with AM/PM (value stays 24h) @default true */
  format24?: boolean;
  /** @default 'Pick a time' */
  placeholder?: string;
  disabled?: boolean;
  /** Danger border + aria-invalid */
  invalid?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function TimePicker(props: TimePickerProps): React.JSX.Element;
