export interface DrawerProps {
  open: boolean;
  /** Called on ✕, ESC, or overlay click */
  onClose?: () => void;
  title: React.ReactNode;
  /** Right-aligned action row on sunken strip */
  footer?: React.ReactNode;
  /** Px @default 400 */
  width?: number;
  /** @default 'right' */
  side?: 'left' | 'right';
  children?: React.ReactNode;
}
export declare function Drawer(props: DrawerProps): JSX.Element;
