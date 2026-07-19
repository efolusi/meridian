export interface KeyValueItem {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Mono value (IPs, hashes, records) */
  mono?: boolean;
}
export interface KeyValueListProps {
  items: KeyValueItem[];
  /** @default 160 */
  labelWidth?: number;
  style?: React.CSSProperties;
  className?: string;
}
export declare function KeyValueList(props: KeyValueListProps): React.JSX.Element;
