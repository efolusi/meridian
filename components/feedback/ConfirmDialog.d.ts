export interface ConfirmDialogProps {
  open: boolean;
  onClose?: () => void;
  /** Called on confirm (dialog closes itself after) */
  onConfirm?: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** @default 'Delete' */
  confirmLabel?: string;
  /** @default 'Cancel' */
  cancelLabel?: string;
  /** 'danger' (red confirm) or 'primary' @default 'danger' */
  tone?: 'danger' | 'primary';
  /** Require typing this string to enable confirm */
  typeToConfirm?: string;
  children?: React.ReactNode;
}
export declare function ConfirmDialog(props: ConfirmDialogProps): React.JSX.Element;
