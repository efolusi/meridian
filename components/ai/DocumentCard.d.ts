export interface DocumentCardProps {
  title: React.ReactNode;
  /** Muted meta, e.g. "1,240 words" */
  meta?: React.ReactNode;
  /** Icon name. Default 'file-text' */
  icon?: string;
  /** Clipped height in px before expand. Default 200 */
  collapsedHeight?: number;
  defaultOpen?: boolean;
  onCopy?: (text: string) => void;
  /** Extra header action buttons */
  actions?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function DocumentCard(props: DocumentCardProps): React.JSX.Element;
