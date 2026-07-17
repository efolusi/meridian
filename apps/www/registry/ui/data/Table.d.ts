export interface TableColumn {
  /** Row field to read */
  key: string;
  label: React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  /** Mono tabular figures */
  numeric?: boolean;
  /** Custom cell: (value, row, rowIndex) => node */
  render?: (value: any, row: any, index: number) => React.ReactNode;
}
export interface TableProps {
  columns: TableColumn[];
  rows: any[];
  /** Field name or fn for React keys @default index */
  rowKey?: string | ((row: any) => string);
  onRowClick?: (row: any) => void;
  dense?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Table(props: TableProps): JSX.Element;
