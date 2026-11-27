export interface ConversationProps {
  /** Viewport height @default 420 */
  height?: number | string;
  /** Keep pinned to bottom as content grows @default true */
  autoStick?: boolean;
  /** @default 'Jump to latest' */
  jumpLabel?: string;
  /** Viewport padding @default 4 */
  padding?: number | string;
  /** Name of the scrolling viewport, which is a focusable region @default 'Conversation' */
  'aria-label'?: string;
  /** Messages, tool calls, etc. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare const Conversation: React.ForwardRefExoticComponent<ConversationProps & React.RefAttributes<HTMLDivElement>>;
