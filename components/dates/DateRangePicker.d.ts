import type { DateRange } from './Calendar.js';

export interface DateRangePickerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onChange'> {
  /** Field label rendered above the trigger */
  label?: string;
  /** Muted helper line rendered below */
  hint?: string;
  /** Controlled {from,to} of YYYY-MM-DD strings; either may be null */
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  /** Earliest pickable day as YYYY-MM-DD; earlier picks are ignored */
  min?: string;
  /** Latest pickable day as YYYY-MM-DD; later picks are ignored */
  max?: string;
  /** @default 'Pick a date range' */
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function DateRangePicker(props: DateRangePickerProps): React.JSX.Element;
