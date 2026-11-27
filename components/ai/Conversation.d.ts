export interface ConversationProps {
  /** Viewport height @default 420 */
  height?: number | string;
  /** Keep pinned to bottom as content grows @default true */
  autoStick?: boolean;
  /** @default 'Jump to latest' */
  jumpLabel?: string;
  /** Viewport padding @default 4 */
  padding?: number | string;
  /** Default name of the viewport while you give none; the viewport is then a group. Translate it here @default 'Conversation' */
  label?: string;
  /** Replaces the whole name of the viewport and makes it a region */
  'aria-label'?: string;
  /** Names the viewport by another element and makes it a region; wins over `aria-label` */
  'aria-labelledby'?: string;
  /** Messages, tool calls, etc. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare const Conversation: React.ForwardRefExoticComponent<ConversationProps & React.RefAttributes<HTMLDivElement>>;
