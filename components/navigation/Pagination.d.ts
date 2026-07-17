export interface PaginationProps {
  /** Current page, 1-based */
  page: number;
  pageCount: number;
  onChange?: (page: number) => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Pagination(props: PaginationProps): JSX.Element;
