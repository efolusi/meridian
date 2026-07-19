export interface PromptComposerProps {
  /** Controlled text */
  value?: string;
  defaultValue?: string;
  onChange?: (text: string, e: React.ChangeEvent) => void;
  /** Enter sends (Shift+Enter = newline) */
  onSend?: (text: string) => void;
  /** Attach button; omit and the button is not rendered */
  onAttach?: (e: React.MouseEvent) => void;
  /** Voice-input button; omit and the button is not rendered */
  onVoice?: (e: React.MouseEvent) => void;
  /** Swaps send for a stop button while a response streams */
  busy?: boolean;
  /** Called by the stop button when `busy` */
  onStop?: (e: React.MouseEvent) => void;
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
export declare const PromptComposer: React.ForwardRefExoticComponent<PromptComposerProps & React.RefAttributes<HTMLDivElement>>;
