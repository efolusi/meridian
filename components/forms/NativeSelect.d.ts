export type NativeSelectProps = Omit<React.ComponentPropsWithoutRef<'select'>, 'size'> & {
  /** Meridian control height. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
};
export type NativeSelectOptionProps = React.ComponentPropsWithoutRef<'option'>;
export type NativeSelectOptGroupProps = React.ComponentPropsWithoutRef<'optgroup'>;

export declare const NativeSelect: React.ForwardRefExoticComponent<
  NativeSelectProps & React.RefAttributes<HTMLSelectElement>
>;
export declare const NativeSelectOption: React.ForwardRefExoticComponent<
  NativeSelectOptionProps & React.RefAttributes<HTMLOptionElement>
>;
export declare const NativeSelectOptGroup: React.ForwardRefExoticComponent<
  NativeSelectOptGroupProps & React.RefAttributes<HTMLOptGroupElement>
>;
