import type * as React from 'react';

export interface AccordionLegacyItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccordionBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  dir?: 'ltr' | 'rtl';
  loop?: boolean;
  asChild?: boolean;
  /** Meridian data-array shorthand. */
  items?: AccordionLegacyItem[];
  /** Meridian shorthand for type="multiple". */
  multiple?: boolean;
  /** Meridian shorthand for defaultValue. */
  defaultOpen?: string[];
}

export interface AccordionSingleProps extends AccordionBaseProps {
  type?: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  collapsible?: boolean;
}

export interface AccordionMultipleProps extends AccordionBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  collapsible?: never;
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  asChild?: boolean;
}

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  forceMount?: boolean;
}

export declare const Accordion: React.ForwardRefExoticComponent<AccordionProps & React.RefAttributes<HTMLDivElement>>;
export declare const AccordionItem: React.ForwardRefExoticComponent<AccordionItemProps & React.RefAttributes<HTMLDivElement>>;
export declare const AccordionTrigger: React.ForwardRefExoticComponent<AccordionTriggerProps & React.RefAttributes<HTMLButtonElement>>;
export declare const AccordionContent: React.ForwardRefExoticComponent<AccordionContentProps & React.RefAttributes<HTMLDivElement>>;
