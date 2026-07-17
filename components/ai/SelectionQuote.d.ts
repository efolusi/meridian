export interface SelectionAction {
  id: string;
  label: string;
  icon?: string;
}
export interface SelectionQuoteProps {
  /** The selectable content */
  children: React.ReactNode;
  /** Toolbar buttons. Default: one "Quote" action */
  actions?: SelectionAction[];
  onAction?: (id: string, text: string) => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function SelectionQuote(props: SelectionQuoteProps): JSX.Element;
