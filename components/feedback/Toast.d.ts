export interface ToastProps {
  /** @default 'info' */
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title: React.ReactNode;
  description?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  /** Shows a dismiss ✕ */
  onClose?: () => void;
  /**
   * Live-region role. Inside a `Toaster` the stack owns the live region and each
   * toast renders with `null`, so a queue announces once rather than as N
   * competing regions. @default 'status'
   */
  role?: 'status' | 'alert' | null;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Toast(props: ToastProps): JSX.Element;

export interface ToastStackProps {
  /** Toasts, stacked fixed bottom-right */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function ToastStack(props: ToastStackProps): JSX.Element;

export interface ToastOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** @default 'info' */
  tone?: 'info' | 'success' | 'warning' | 'danger';
  actionLabel?: string;
  onAction?: () => void;
  /**
   * ms before auto-dismiss; 0 never dismisses.
   * @default the Toaster's `duration`, or 0 when `actionLabel` is set — a
   * control must not vanish on a timer the user cannot adjust (WCAG 2.2.1).
   */
  duration?: number;
}
export interface ToastApi {
  /** Queue a toast; returns its id. */
  notify: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}
export interface ToasterProps {
  /** ms before a toast auto-dismisses; 0 never. @default 5000 */
  duration?: number;
  /** aria-label of the live region. @default 'Notifications' */
  label?: string;
  /** Your app. Toaster renders a Fragment, never a wrapper element. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
/**
 * Owns the toast queue: ids, timers, the live region and the portal. Timers
 * pause while the stack is hovered or focused.
 *
 * The hook is published as a static — `Toaster.useToast()` — because only
 * capitalised exports reach the global namespace.
 */
export declare function Toaster(props: ToasterProps): JSX.Element;
export declare namespace Toaster {
  /** Must be called inside a `<Toaster>`; throws otherwise. */
  function useToast(): ToastApi;
}
