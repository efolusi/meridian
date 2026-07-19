export interface DialogProps {
  open: boolean;
  /** Called on ✕, ESC, or overlay click; omit to hide ✕ */
  onClose?: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned action row on sunken strip */
  footer?: React.ReactNode;
  /** Max width px @default 440 */
  width?: number;
  children?: React.ReactNode;
}
export declare const Dialog: React.ForwardRefExoticComponent<DialogProps & React.RefAttributes<HTMLDivElement>>;
