export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size' | 'value' | 'defaultValue' | 'onChange'> {
  label?: React.ReactNode;
  /** @default 'md' */
  size?: 'sm' | 'md';
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
  defaultChecked?: boolean;
  name?: string;
  value?: string;
  required?: boolean;
}
export declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLButtonElement>>;
