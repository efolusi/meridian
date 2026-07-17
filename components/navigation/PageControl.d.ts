export interface PageControlProps {
  count: number;
  /** Active index, 0-based @default 0 */
  index?: number;
  onChange?: (index: number) => void;
  /** aria-label prefix @default 'Page' */
  label?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function PageControl(props: PageControlProps): JSX.Element;
