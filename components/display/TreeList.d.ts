export interface TreeNode {
  id: string;
  label: React.ReactNode;
  /** Lucide icon */
  icon?: string;
  /** Right-aligned mono count */
  count?: number;
  children?: TreeNode[];
}
export interface TreeListProps {
  nodes: TreeNode[];
  /** Controlled selected id */
  value?: string;
  onSelect?: (id: string, node: TreeNode) => void;
  /** Branch ids open initially (default: all top-level) */
  defaultOpen?: string[];
  style?: React.CSSProperties;
  className?: string;
}
export declare function TreeList(props: TreeListProps): React.JSX.Element;
