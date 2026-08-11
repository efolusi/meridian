import type * as React from 'react';

export interface HoverCardProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Delay before a pointer opens the card. @default 700 */
  openDelay?: number;
  /** Delay before a pointer closes the card. @default 300 */
  closeDelay?: number;
  children?: React.ReactNode;
}
export declare function HoverCard(props: HoverCardProps): React.JSX.Element;

export interface HoverCardTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}
export declare const HoverCardTrigger: React.ForwardRefExoticComponent<HoverCardTriggerProps & React.RefAttributes<HTMLElement>>;

export interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  alignOffset?: number;
}
export declare const HoverCardContent: React.ForwardRefExoticComponent<HoverCardContentProps & React.RefAttributes<HTMLDivElement>>;
