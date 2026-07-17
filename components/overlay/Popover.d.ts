export interface PopoverProps {
  /** The element that toggles the popover */
  trigger: React.ReactNode;
  /** Panel content */
  children?: React.ReactNode;
  /** @default 'left' */
  align?: 'left' | 'right';
  /** Panel width @default 280 */
  width?: number;
  /** Controlled open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Popover(props: PopoverProps): JSX.Element;
