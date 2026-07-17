export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Controlled pressed state */
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** Identity when used inside a ToggleGroup */
  value?: string;
  /** Lucide icon name */
  icon?: string;
  /** @default 'md' */
  size?: 'sm' | 'md';
  children?: React.ReactNode;
}
export interface ToggleGroupProps {
  /** @default 'single' */
  type?: 'single' | 'multiple';
  /** Controlled: string (single) or string[] (multiple) */
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  onChange?: (value: string | string[] | null) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Toggle(props: ToggleProps): JSX.Element;
export declare function ToggleGroup(props: ToggleGroupProps): JSX.Element;
