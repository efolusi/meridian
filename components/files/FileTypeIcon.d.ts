export interface FileTypeIconProps {
  /** Extension: pdf, csv, png, mp4, zip, json… @default 'txt' */
  ext?: string;
  /** Px @default 40 */
  size?: number;
  /** Colored extension chip @default true */
  showExt?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
export declare function FileTypeIcon(props: FileTypeIconProps): React.JSX.Element;
