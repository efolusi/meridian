export interface TableColumn {
  /** Row field to read */
  key: string;
  label: React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  /** Mono tabular figures */
  numeric?: boolean;
  /** Show a sort control in the header for this column */
  sortable?: boolean;
  /** Value to sort on, when it is not simply row[key] */
  sortAccessor?: (row: any) => any;
  /** Custom cell: (value, row, rowIndex) => node */
  render?: (value: any, row: any, index: number) => React.ReactNode;
}
export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}
export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  columns: TableColumn[];
  rows: any[];
  /** Field name or fn for React keys @default index */
  rowKey?: string | ((row: any) => string);
  onRowClick?: (row: any) => void;
  dense?: boolean;
  /** Controlled sort. Omit and the table sorts itself. */
  sort?: TableSort | null;
  defaultSort?: TableSort;
  onSortChange?: (sort: TableSort) => void;
  /** Adds a leading checkbox column with a select-all header */
  selectable?: boolean;
  /** Controlled selection, as row keys */
  selected?: Array<string | number>;
  defaultSelected?: Array<string | number>;
  onSelectionChange?: (selected: Array<string | number>) => void;
  /** Pin the header while the body scrolls (implies a scroll box) */
  stickyHeader?: boolean;
  /** Height of the scroll box @default 320 when sticky */
  maxHeight?: number | string;
  /** Replace the body with shimmer rows */
  loading?: boolean;
  /** @default 3 */
  loadingRows?: number;
  /** Shown when there are no rows @default 'Nothing to show yet.' */
  empty?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
/** Ref lands on the scrolling wrapper element. */
export declare const Table: React.ForwardRefExoticComponent<
  TableProps & React.RefAttributes<HTMLDivElement>
>;
