export interface SandboxTab {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
}
export interface SandboxProps {
  /** Command or filename, mono */
  title: React.ReactNode;
  /** 'busy' | 'success' | 'danger' */
  /** @default 'success' */
  status?: 'busy' | 'success' | 'danger';
  /** Right-side meta, e.g. duration */
  meta?: React.ReactNode;
  tabs: SandboxTab[];
  defaultOpen?: boolean;
  defaultTab?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Sandbox(props: SandboxProps): React.JSX.Element;
