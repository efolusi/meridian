export interface PopoverProps {
  /** Legacy trigger shorthand. Prefer PopoverTrigger composition. */ trigger?: React.ReactNode;
  children?: React.ReactNode;
  /** Legacy alignment aliases. */ align?: 'left' | 'center' | 'right'; width?: number;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  style?: React.CSSProperties; className?: string;
}
export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { asChild?: boolean; }
export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'; side?: 'top' | 'bottom'; sideOffset?: number; width?: number | string;
}
export declare const Popover: React.ForwardRefExoticComponent<PopoverProps & React.RefAttributes<HTMLSpanElement>>;
export declare const PopoverTrigger: React.ForwardRefExoticComponent<PopoverTriggerProps & React.RefAttributes<HTMLElement>>;
export declare const PopoverContent: React.ForwardRefExoticComponent<PopoverContentProps & React.RefAttributes<HTMLDivElement>>;
export declare const PopoverHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const PopoverTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>>;
export declare const PopoverDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
