export interface SandboxTab {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
}
export interface SandboxProps {
  /** Command or filename, mono */
  title: React.ReactNode;
  /** 'running' | 'success' | 'error' */
  /** @default 'success' */
  status?: 'running' | 'success' | 'error';
  /** @deprecated use `status` */
  state?: 'running' | 'success' | 'error';
  /** Right-side meta, e.g. duration */
  meta?: React.ReactNode;
  tabs: SandboxTab[];
  defaultOpen?: boolean;
  defaultTab?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Sandbox(props: SandboxProps): React.JSX.Element;
