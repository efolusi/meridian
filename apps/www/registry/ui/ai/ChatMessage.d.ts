export interface ChatMessageProps {
  /** @default 'assistant' */
  role?: 'user' | 'assistant' | 'system';
  /** Display name @default You / Agent / System */
  name?: string;
  time?: string;
  /** Blinking caret while generating */
  streaming?: boolean;
  /** false hides the hover copy/retry row */
  actions?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function ChatMessage(props: ChatMessageProps): JSX.Element;
