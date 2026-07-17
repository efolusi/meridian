export interface ReasoningProps {
  /** Pulsing glyph + "Thinking…" header */
  streaming?: boolean;
  /** Header reads "Thought for <duration>" */
  duration?: string;
  /** Custom header text */
  label?: React.ReactNode;
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The reasoning text */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Reasoning(props: ReasoningProps): JSX.Element;
