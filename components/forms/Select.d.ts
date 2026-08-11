export interface SelectProps { value?: string; defaultValue?: string; onValueChange?: (value: string) => void; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; disabled?: boolean; name?: string; required?: boolean; children?: React.ReactNode }
export declare function Select(props: SelectProps): React.JSX.Element;
export type SelectTriggerProps = React.ComponentPropsWithoutRef<'button'>;
export declare const SelectTrigger: React.ForwardRefExoticComponent<SelectTriggerProps & React.RefAttributes<HTMLButtonElement>>;
export interface SelectValueProps { placeholder?: React.ReactNode; children?: React.ReactNode; className?: string }
export declare function SelectValue(props: SelectValueProps): React.JSX.Element;
export type SelectContentProps = React.ComponentPropsWithoutRef<'div'> & { position?: 'item-aligned' | 'popper'; align?: 'start' | 'center' | 'end'; sideOffset?: number };
export declare const SelectContent: React.ForwardRefExoticComponent<SelectContentProps & React.RefAttributes<HTMLDivElement>>;
export declare const SelectGroup: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<'div'> & React.RefAttributes<HTMLDivElement>>;
export declare const SelectLabel: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<'div'> & React.RefAttributes<HTMLDivElement>>;
export type SelectItemProps = Omit<React.ComponentPropsWithoutRef<'button'>, 'value'> & { value: string };
export declare const SelectItem: React.ForwardRefExoticComponent<SelectItemProps & React.RefAttributes<HTMLButtonElement>>;
export declare const SelectSeparator: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<'div'> & React.RefAttributes<HTMLDivElement>>;
