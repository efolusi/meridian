export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step' | 'size'> {
  label?: string; showValue?: boolean; format?: (value: number) => string;
  min?: number; max?: number; step?: number;
  value?: number | number[]; defaultValue?: number | number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  /** Legacy callback: scalar for scalar input, array for array input. */ onChange?: (value: number | number[], event: React.ChangeEvent<HTMLInputElement>) => void;
  orientation?: 'horizontal' | 'vertical';
  minStepsBetweenThumbs?: number;
  inverted?: boolean;
  dir?: 'ltr' | 'rtl';
}
export declare const Slider: React.ForwardRefExoticComponent<SliderProps & React.RefAttributes<HTMLInputElement>>;
