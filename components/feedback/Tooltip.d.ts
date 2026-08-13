export interface TooltipProviderProps { delayDuration?: number; skipDelayDuration?: number; disableHoverableContent?: boolean; children?: React.ReactNode; }
export interface TooltipProps {
  delayDuration?: number;
  disableHoverableContent?: boolean;
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}
export interface TooltipTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { asChild?: boolean; }
export interface TooltipContentProps extends React.HTMLAttributes<HTMLSpanElement> { side?: 'top' | 'bottom' | 'left' | 'right'; sideOffset?: number; }
export declare function Tooltip(props: TooltipProps): React.JSX.Element;
export declare function TooltipProvider(props: TooltipProviderProps): React.JSX.Element;
export declare const TooltipTrigger: React.ForwardRefExoticComponent<TooltipTriggerProps & React.RefAttributes<HTMLElement>>;
export declare const TooltipContent: React.ForwardRefExoticComponent<TooltipContentProps & React.RefAttributes<HTMLSpanElement>>;
