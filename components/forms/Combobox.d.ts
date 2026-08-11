export interface ComboboxProps<T = string> {
  items?: T[]; value?: T | T[] | null; defaultValue?: T | T[] | null;
  onValueChange?: (value: T | T[] | null) => void; multiple?: boolean;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  inputValue?: string; defaultInputValue?: string; onInputValueChange?: (value: string) => void;
  disabled?: boolean; autoHighlight?: boolean; children?: React.ReactNode;
}
export declare function Combobox<T = string>(props: ComboboxProps<T>): React.JSX.Element;
export declare const ComboboxValue: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & { children?: React.ReactNode | ((value: unknown) => React.ReactNode) } & React.RefAttributes<HTMLSpanElement>>;
export declare const ComboboxTrigger: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export declare const ComboboxClear: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>>;
export declare const ComboboxInput: React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement> & { showTrigger?: boolean; showClear?: boolean } & React.RefAttributes<HTMLInputElement>>;
export declare const ComboboxContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & { side?: 'top' | 'bottom' | 'left' | 'right'; sideOffset?: number; align?: 'start' | 'center' | 'end'; alignOffset?: number; anchor?: React.RefObject<HTMLElement | null> } & React.RefAttributes<HTMLDivElement>>;
export declare const ComboboxList: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode | ((item: unknown) => React.ReactNode) } & React.RefAttributes<HTMLDivElement>>;
export interface ComboboxItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> { value?: unknown; keywords?: string[]; }
export declare const ComboboxItem: React.ForwardRefExoticComponent<ComboboxItemProps & React.RefAttributes<HTMLButtonElement>>;
export declare const ComboboxGroup: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const ComboboxLabel: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare function ComboboxCollection(props: { children?: React.ReactNode }): React.JSX.Element;
export declare const ComboboxEmpty: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const ComboboxSeparator: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const ComboboxChips: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const ComboboxChip: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & { value?: unknown; showRemove?: boolean } & React.RefAttributes<HTMLSpanElement>>;
export declare const ComboboxChipsInput: React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>;
export declare function useComboboxAnchor(): React.RefObject<HTMLDivElement | null>;
