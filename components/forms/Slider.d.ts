export interface SliderProps {
  label?: string;
  /** Show current value right of the label */
  showValue?: boolean;
  /** Format the shown value, e.g. v => v + '%' */
  format?: (v: number) => string;
  /** @default 0 */ min?: number;
  /** @default 100 */ max?: number;
  /** @default 1 */ step?: number;
  /** Controlled value */
  value?: number;
  defaultValue?: number;
  onChange?: (value: number, e: React.ChangeEvent) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Slider(props: SliderProps): JSX.Element;
