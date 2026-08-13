export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step' | 'size'> {
  min?: number; max?: number; step?: number;
  value?: number[]; defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  orientation?: 'horizontal' | 'vertical';
  minStepsBetweenThumbs?: number;
  inverted?: boolean;
  dir?: 'ltr' | 'rtl';
}
export declare const Slider: React.ForwardRefExoticComponent<SliderProps & React.RefAttributes<HTMLSpanElement>>;
