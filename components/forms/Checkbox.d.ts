export type CheckedState = boolean | 'indeterminate';

export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'defaultChecked' | 'value' | 'onChange'> {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
  /** Native-form change callback from the hidden checkbox input. */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  name?: string;
  value?: string;
  required?: boolean;
  form?: string;
  label?: React.ReactNode;
  /** Muted second line under the integrated label. */
  description?: string;
}
export declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLButtonElement>>;
