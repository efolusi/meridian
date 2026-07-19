export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Header title (header renders only if title or actions set) */
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-aligned header slot (buttons etc.) */
  actions?: React.ReactNode;
  /** Footer slot on a sunken strip */
  footer?: React.ReactNode;
  /** Body padding in px @default 20 */
  padding?: number;
  /** Slightly stronger shadow */
  elevated?: boolean;
  /** Hover lift + pointer */
  interactive?: boolean;
  children?: React.ReactNode;
}
export declare function Card(props: CardProps): React.JSX.Element;
