export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Controlled pressed state */
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** @default 'default' */
  variant?: 'default' | 'outline';
  /** @default 'default' */
  size?: 'default' | 'sm' | 'lg';
}
export interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default 'single' */
  type?: 'single' | 'multiple';
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  onValueChange?: (value: string | string[] | null) => void;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  /** Gap in 4px units. @default 2 */
  spacing?: number;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  dir?: 'ltr' | 'rtl';
}
export interface ToggleGroupItemProps extends ToggleProps { value: string; }
export declare function toggleVariants(options?: Pick<ToggleProps, 'variant' | 'size'> & { className?: string }): string;
export declare const Toggle: React.ForwardRefExoticComponent<ToggleProps & React.RefAttributes<HTMLButtonElement>>;
export declare const ToggleGroup: React.ForwardRefExoticComponent<ToggleGroupProps & React.RefAttributes<HTMLDivElement>>;
export declare const ToggleGroupItem: React.ForwardRefExoticComponent<ToggleGroupItemProps & React.RefAttributes<HTMLButtonElement>>;
