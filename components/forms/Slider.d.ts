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
  value?: number | number[];
  defaultValue?: number | number[];
  onChange?: (value: number, e: React.ChangeEvent) => void;
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare const Slider: React.ForwardRefExoticComponent<SliderProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, keyof SliderProps> & React.RefAttributes<HTMLInputElement>>;
