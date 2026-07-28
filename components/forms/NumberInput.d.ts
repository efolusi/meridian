export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'> {
  /** Field label rendered above */
  label?: string;
  /** Muted helper text below */
  hint?: string;
  /** Error message below — also sets invalid styling */
  error?: string;
  /** Invalid styling with no message. @default false */
  invalid?: boolean;
  /** Controlled value; null is "empty" */
  value?: number | null;
  defaultValue?: number | null;
  /** Fires on commit (blur, arrow keys, steppers). null when cleared. */
  onChange?: (value: number | null, e: React.SyntheticEvent) => void;
  /** Lower rail; commits clamp to it, Home jumps to it when finite */
  min?: number;
  /** Upper rail; commits clamp to it, End jumps to it when finite */
  max?: number;
  /** Arrow/stepper increment; commits snap to its grid. @default 1 */
  step?: number;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  placeholder?: string;
  /**
   * BCP 47 locale (e.g. 'id', 'en-US') for locale-aware display and parsing via
   * Intl.NumberFormat — 'id' groups with '.' and decimals with ',', 'en' the
   * reverse. Ignored when both `format` and `parse` are given. Omit for plain,
   * ungrouped formatting (the default).
   */
  locale?: string;
  /** Display formatting for the committed value, e.g. n => n + ' GB'. Wins over `locale`. */
  format?: (value: number) => string;
  /** Turn typed text back into a number; pair it with `format`. Return null for unparseable. Wins over `locale`. */
  parse?: (text: string) => number | null;
  style?: React.CSSProperties;
  className?: string;
}
/**
 * Numeric field with stepper buttons. A text input with inputmode="decimal" —
 * not type=number — so typing stays free-form; the value commits on blur:
 * parse, clamp to min/max, snap to the step grid. Empty commits null.
 * ArrowUp/Down step, Shift+Arrow steps by 10× step, Home/End jump to finite
 * rails. Steppers disable at the rails.
 */
export declare function NumberInput(props: NumberInputProps): React.JSX.Element;
