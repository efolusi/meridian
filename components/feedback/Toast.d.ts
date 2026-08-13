import * as React from 'react';

export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type ToastType = 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading';
export interface ToastOptions {
  id?: string | number;
  title: React.ReactNode;
  description?: React.ReactNode;
  type?: ToastType;
  duration?: number;
  actionProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  closeButton?: boolean;
}
export interface ToastPromiseOptions<T> {
  loading: React.ReactNode | Partial<ToastOptions>;
  success: React.ReactNode | Partial<ToastOptions> | ((value: T) => React.ReactNode | Partial<ToastOptions>);
  error: React.ReactNode | Partial<ToastOptions> | ((error: unknown) => React.ReactNode | Partial<ToastOptions>);
  duration?: number;
}
export interface ToastManager {
  add(options: ToastOptions): string | number;
  close(id?: string | number): void;
  promise<T>(promise: Promise<T> | (() => Promise<T>), options: ToastPromiseOptions<T>): string | number;
}
export const toast: ToastManager;
export interface ToasterProps extends React.HTMLAttributes<HTMLDivElement> { position?: ToastPosition; visibleToasts?: number; closeButton?: boolean; richColors?: boolean; duration?: number; toastOptions?: Partial<ToastOptions>; expand?: boolean; theme?: 'light' | 'dark' | 'system'; dir?: 'ltr' | 'rtl'; gap?: number; offset?: number | string; mobileOffset?: number | string; label?: string; children?: React.ReactNode }
export function Toaster(props: ToasterProps): React.JSX.Element;
