import type * as React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
  /** Icon name. Default: info, circle-check, triangle-alert or circle-alert by variant. `false` shows none. An icon child replaces it. */
  icon?: string | false;
}

export type AlertTitleProps = React.HTMLAttributes<HTMLDivElement>;
export type AlertDescriptionProps = React.HTMLAttributes<HTMLDivElement>;
export type AlertActionProps = React.HTMLAttributes<HTMLDivElement>;

export declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>>;
export declare const AlertTitle: React.ForwardRefExoticComponent<AlertTitleProps & React.RefAttributes<HTMLDivElement>>;
export declare const AlertDescription: React.ForwardRefExoticComponent<AlertDescriptionProps & React.RefAttributes<HTMLDivElement>>;
export declare const AlertAction: React.ForwardRefExoticComponent<AlertActionProps & React.RefAttributes<HTMLDivElement>>;
