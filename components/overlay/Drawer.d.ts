export interface DrawerProps {
  open: boolean;
  /** Called on ✕, ESC, or overlay click */
  onClose?: () => void;
  /** Accessible name of the ✕ button. Pass a translated string in a
   *  non-English UI. @default 'Close' */
  closeLabel?: string;
  title: React.ReactNode;
  /** Right-aligned action row on sunken strip */
  footer?: React.ReactNode;
  /** Px @default 400 */
  width?: number;
  /** @default 'right' */
  side?: 'left' | 'right';
  children?: React.ReactNode;
}
export declare const Drawer: React.ForwardRefExoticComponent<DrawerProps & React.RefAttributes<HTMLDivElement>>;
