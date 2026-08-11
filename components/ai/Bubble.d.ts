import type * as React from 'react';

export interface BubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'muted' | 'tinted' | 'outline' | 'ghost' | 'destructive';
  align?: 'start' | 'end';
}
export interface BubbleContentProps extends React.HTMLAttributes<HTMLDivElement> { asChild?: boolean; }
export interface BubbleReactionsProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'bottom';
  align?: 'start' | 'end';
}

export declare const BubbleGroup: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const Bubble: React.ForwardRefExoticComponent<BubbleProps & React.RefAttributes<HTMLDivElement>>;
export declare const BubbleContent: React.ForwardRefExoticComponent<BubbleContentProps & React.RefAttributes<HTMLDivElement>>;
export declare const BubbleReactions: React.ForwardRefExoticComponent<BubbleReactionsProps & React.RefAttributes<HTMLDivElement>>;
