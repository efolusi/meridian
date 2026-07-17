export interface PromptComposerProps {
  /** Controlled text */
  value?: string;
  defaultValue?: string;
  onChange?: (text: string, e: React.ChangeEvent) => void;
  /** Enter sends (Shift+Enter = newline) */
  onSend?: (text: string) => void;
  /** @default 'Ask the agent anything…' */
  placeholder?: string;
  /** @default 2 */
  rows?: number;
  disabled?: boolean;
  /** FileTile chips shown above the input */
  attachments?: React.ReactNode;
  /** Muted hint left of the send button */
  hint?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function PromptComposer(props: PromptComposerProps): JSX.Element;
