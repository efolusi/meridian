export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Controlled pressed state */
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** @default 'default' */
  variant?: 'default' | 'outline';
  /** @default 'default' */
  size?: 'default' | 'sm' | 'lg' | 'md';
  /** Identity when used inside Meridian's legacy ToggleGroup. */
  value?: string;
  /** Additive Meridian icon-name helper. */
  icon?: string;
}
export interface ToggleGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** @default 'single' */
  type?: 'single' | 'multiple';
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  onChange?: (value: string | string[] | null) => void;
}
export declare function toggleVariants(options?: Pick<ToggleProps, 'variant' | 'size'> & { className?: string }): string;
export declare const Toggle: React.ForwardRefExoticComponent<ToggleProps & React.RefAttributes<HTMLButtonElement>>;
export declare function ToggleGroup(props: ToggleGroupProps): React.JSX.Element;
