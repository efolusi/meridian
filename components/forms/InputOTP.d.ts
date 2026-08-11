export interface InputOTPProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'maxLength' | 'onChange' | 'value' | 'defaultValue'> {
  maxLength: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  containerClassName?: string;
}
export declare const InputOTP: React.ForwardRefExoticComponent<InputOTPProps & React.RefAttributes<HTMLInputElement>>;
export declare const InputOTPGroup: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export interface InputOTPSlotProps extends React.HTMLAttributes<HTMLDivElement> { index: number; }
export declare const InputOTPSlot: React.ForwardRefExoticComponent<InputOTPSlotProps & React.RefAttributes<HTMLDivElement>>;
export declare const InputOTPSeparator: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
