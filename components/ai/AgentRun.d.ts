export interface AgentRunStep {
  id?: string;
  title: React.ReactNode;
  /** Supporting line — text or nodes */
  detail?: React.ReactNode;
  /** Collapsible panel (ToolCall, Diff…) behind a "Show detail" toggle */
  children?: React.ReactNode;
  /** Open the panel initially */
  defaultOpen?: boolean;
  /** @default 'pending' */
  status?: 'done' | 'active' | 'pending' | 'error';
  /** Mono timestamp on the right */
  time?: string;
}
export interface AgentRunProps {
  steps: AgentRunStep[];
  style?: React.CSSProperties;
  className?: string;
}
export declare function AgentRun(props: AgentRunProps): JSX.Element;
