export interface SegmentOption {
  id: string;
  label: React.ReactNode;
  /** Lucide icon name */
  icon?: string;
  disabled?: boolean;
}
export interface SegmentedControlProps {
  /** Options as strings or objects */
  options: Array<string | SegmentOption>;
  /** Active option id (controlled) */
  value: string;
  onChange?: (id: string) => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;
