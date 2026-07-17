export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}
export interface AccordionProps {
  items: AccordionItem[];
  /** Allow several items open at once @default false */
  multiple?: boolean;
  /** Ids open initially */
  defaultOpen?: string[];
  style?: React.CSSProperties;
  className?: string;
}
export declare function Accordion(props: AccordionProps): JSX.Element;
