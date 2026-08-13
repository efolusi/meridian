import type * as React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

export type AlertTitleProps = React.HTMLAttributes<HTMLDivElement>;
export type AlertDescriptionProps = React.HTMLAttributes<HTMLDivElement>;
export type AlertActionProps = React.HTMLAttributes<HTMLDivElement>;

export declare const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>>;
export declare const AlertTitle: React.ForwardRefExoticComponent<AlertTitleProps & React.RefAttributes<HTMLDivElement>>;
export declare const AlertDescription: React.ForwardRefExoticComponent<AlertDescriptionProps & React.RefAttributes<HTMLDivElement>>;
export declare const AlertAction: React.ForwardRefExoticComponent<AlertActionProps & React.RefAttributes<HTMLDivElement>>;
