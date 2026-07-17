export interface ConversationProps {
  /** Viewport height @default 420 */
  height?: number | string;
  /** Keep pinned to bottom as content grows @default true */
  autoStick?: boolean;
  /** @default 'Jump to latest' */
  jumpLabel?: string;
  /** Viewport padding @default 4 */
  padding?: number | string;
  /** Messages, tool calls, etc. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Conversation(props: ConversationProps): JSX.Element;
