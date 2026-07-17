export interface ButtonTileProps {
  /** Lucide icon */
  icon?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function ButtonTile(props: ButtonTileProps): JSX.Element;

export interface ButtonTileGroupProps {
  /** @default 3 */
  columns?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function ButtonTileGroup(props: ButtonTileGroupProps): JSX.Element;
