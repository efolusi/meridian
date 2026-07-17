export interface ToolCallProps {
  /** Tool name, mono */
  name: string;
  /** @default 'running' */
  status?: 'pending' | 'approval' | 'running' | 'success' | 'error';
  /** Input args — object renders a key/value grid, string renders raw */
  args?: object | string;
  /** Result body (also accepts children) */
  result?: React.ReactNode;
  /** Error message shown in the body */
  error?: React.ReactNode;
  /** Pulses the last arg row while args stream in */
  streaming?: boolean;
  /** Approve action — rendered when status is 'approval' */
  onApprove?: () => void;
  /** Reject action — rendered when status is 'approval' */
  onReject?: () => void;
  /** @default 'Approve' */
  approveLabel?: string;
  /** @default 'Reject' */
  rejectLabel?: string;
  /** Lucide icon @default 'wrench' */
  icon?: string;
  /** Body visibility; errors and approvals open by default */
  defaultOpen?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function ToolCall(props: ToolCallProps): JSX.Element;
