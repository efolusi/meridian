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
  /** Fires with the clicked row's id and node */
  onChange?: (id: string, node: TreeNode) => void;
  /** @deprecated Use `onChange`. Alias kept for one major; `onChange` wins when both are passed. */
  onSelect?: (id: string, node: TreeNode) => void;
  /** Branch ids open initially (default: all top-level) */
  defaultOpen?: string[];
  style?: React.CSSProperties;
  className?: string;
}
export declare function TreeList(props: TreeListProps): React.JSX.Element;
