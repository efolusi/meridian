export interface ContextMenuItem { id: string; label: React.ReactNode; /** Lucide icon name */ icon?: string; kbd?: string; danger?: boolean; disabled?: boolean; onClick?: () => void; }
export interface ContextMenuProps {
  /** Right-click target */
  children: React.ReactNode;
  items: Array<ContextMenuItem | 'separator'>;
  /** Fires with the picked item id */
  onSelect?: (id: string) => void;
  style?: React.CSSProperties;
  className?: string;
}
export declare function ContextMenu(props: ContextMenuProps): React.JSX.Element;
