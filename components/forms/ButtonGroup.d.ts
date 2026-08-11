import type * as React from 'react';
import type { SeparatorProps } from '../display/Separator.jsx';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}
export interface ButtonGroupTextProps extends React.HTMLAttributes<HTMLDivElement> { asChild?: boolean; }
export interface ButtonGroupSeparatorProps extends SeparatorProps {}

export declare function buttonGroupVariants(options?: Pick<ButtonGroupProps, 'orientation'> & { className?: string }): string;
export declare const ButtonGroup: React.ForwardRefExoticComponent<ButtonGroupProps & React.RefAttributes<HTMLDivElement>>;
export declare const ButtonGroupText: React.ForwardRefExoticComponent<ButtonGroupTextProps & React.RefAttributes<HTMLDivElement>>;
export declare const ButtonGroupSeparator: React.ForwardRefExoticComponent<ButtonGroupSeparatorProps & React.RefAttributes<HTMLDivElement>>;
