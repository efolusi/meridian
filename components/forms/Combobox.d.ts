export interface ComboOption { value: string; label: string; icon?: string; }
export interface ComboboxProps {
  label?: string;
  hint?: string;
  /** Options as strings or {value,label,icon} */
  options: Array<string | ComboOption>;
  /** Selected value (single) or values (multiple) */
  value?: string | string[] | null;
  onChange?: (value: any) => void;
  /** Multi-select with removable chips */
  multiple?: boolean;
  /** @default 'Search…' */
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Combobox(props: ComboboxProps): JSX.Element;
