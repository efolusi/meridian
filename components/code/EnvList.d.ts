export interface EnvVar {
  name: string;
  value: string;
  /** Masked until revealed */
  secret?: boolean;
}
export interface EnvListProps {
  title?: string;
  vars: EnvVar[];
  defaultVisible?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function EnvList(props: EnvListProps): React.JSX.Element;
