export interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  shouldFilter?: boolean;
  filter?: (value: string, search: string, keywords?: string[]) => number;
  loop?: boolean;
}
export interface CommandDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  className?: string;
  children?: React.ReactNode;
}
export interface CommandItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  value?: string;
  keywords?: string[];
  onSelect?: (value: string) => void;
}
export declare const Command: React.ForwardRefExoticComponent<CommandProps & React.RefAttributes<HTMLDivElement>>;
export declare function CommandDialog(props: CommandDialogProps): React.JSX.Element;
export declare const CommandInput: React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>;
export declare const CommandList: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const CommandEmpty: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const CommandGroup: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & { heading?: React.ReactNode } & React.RefAttributes<HTMLDivElement>>;
export declare const CommandItem: React.ForwardRefExoticComponent<CommandItemProps & React.RefAttributes<HTMLButtonElement>>;
export declare const CommandShortcut: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;
export declare const CommandSeparator: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
