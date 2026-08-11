import type * as React from 'react';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: 'default' | 'destructive';
  /** Meridian semantic-tone extension. */
  tone?: 'info' | 'success' | 'warning' | 'danger';
  /** Meridian shorthand icon name. */
  icon?: string;
  /** Meridian shorthand title. */
  title?: React.ReactNode;
  /** Meridian shorthand description. */
  description?: React.ReactNode;
  /** Meridian shorthand action slot. */
  action?: React.ReactNode;
}

export type AlertTitleProps = React.HTMLAttributes<HTMLDivElement>;
export type AlertDescriptionProps = React.HTMLAttributes<HTMLDivElement>;

export declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>>;
export declare const AlertTitle: React.ForwardRefExoticComponent<AlertTitleProps & React.RefAttributes<HTMLDivElement>>;
export declare const AlertDescription: React.ForwardRefExoticComponent<AlertDescriptionProps & React.RefAttributes<HTMLDivElement>>;
