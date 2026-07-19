export interface ConfirmationProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 'danger' for destructive approvals @default 'default' */
  tone?: 'default' | 'danger';
  /** Controlled state */
  state?: 'pending' | 'approved' | 'rejected';
  /** @default 'pending' */
  defaultState?: 'pending' | 'approved' | 'rejected';
  onStateChange?: (state: 'pending' | 'approved' | 'rejected') => void;
  /** Lucide icon; defaults by tone */
  icon?: string;
  /** @default 'Approve' */
  approveLabel?: string;
  /** @default 'Reject' */
  rejectLabel?: string;
  /** Status line after approving */
  approvedNote?: React.ReactNode;
  /** Status line after rejecting */
  rejectedNote?: React.ReactNode;
  /** Extra content (ToolCall, Diff…) */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Confirmation(props: ConfirmationProps): React.JSX.Element;
