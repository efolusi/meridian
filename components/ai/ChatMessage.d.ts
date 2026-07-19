export interface ChatMessageProps {
  /** @default 'assistant' */
  role?: 'user' | 'assistant' | 'system';
  /** Display name @default You / Agent / System */
  name?: string;
  time?: string;
  /** Blinking caret while generating */
  streaming?: boolean;
  /** false hides the hover action row; a node replaces it wholesale */
  actions?: boolean | React.ReactNode;
  /** Copy button; omit and the button is not rendered */
  onCopy?: (e: React.MouseEvent) => void;
  /** Retry button; omit and the button is not rendered */
  onRetry?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function ChatMessage(props: ChatMessageProps): React.JSX.Element;
