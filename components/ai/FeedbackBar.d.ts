export interface FeedbackBarProps {
  /** Fires 'up' | 'down' | null (toggled off) */
  onFeedback?: (dir: 'up' | 'down' | null) => void;
  /** Copies this text on the copy button */
  copyText?: string;
  onCopy?: () => void;
  /** Shows the regenerate button */
  onRetry?: () => void;
  /** Muted note after the buttons */
  note?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function FeedbackBar(props: FeedbackBarProps): React.JSX.Element;
