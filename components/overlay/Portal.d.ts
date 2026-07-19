export interface PortalProps {
  children?: React.ReactNode;
  /** Where to mount. @default document.body */
  container?: HTMLElement;
}
/**
 * Render children outside the current DOM subtree so they cannot be clipped by
 * an ancestor's overflow. Used by every floating surface in the system.
 */
export declare function Portal(props: PortalProps): JSX.Element | null;
