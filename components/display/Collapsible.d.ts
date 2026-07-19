export interface CollapsibleProps {
  /** Trigger row content */
  title: React.ReactNode;
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Collapsible(props: CollapsibleProps): React.JSX.Element;
