export interface DigitEntryProps {
  /** Number of cells @default 6 */
  length?: number;
  /** Controlled value (digits only) */
  value?: string;
  onChange?: (value: string) => void;
  /** Fires when all cells are filled */
  onComplete?: (value: string) => void;
  label?: string;
  invalid?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function DigitEntry(props: DigitEntryProps): JSX.Element;
