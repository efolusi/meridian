import * as React from 'react';
import type { ButtonProps } from '../forms/Button.js';

export type AttachmentState = 'idle' | 'uploading' | 'processing' | 'error' | 'done';
export type AttachmentSize = 'default' | 'sm' | 'xs';
export type AttachmentOrientation = 'horizontal' | 'vertical';

export interface AttachmentProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: AttachmentState;
  size?: AttachmentSize;
  orientation?: AttachmentOrientation;
}
export declare const Attachment: React.ForwardRefExoticComponent<AttachmentProps & React.RefAttributes<HTMLDivElement>>;

export interface AttachmentMediaProps extends React.HTMLAttributes<HTMLDivElement> { variant?: 'icon' | 'image'; }
export declare const AttachmentMedia: React.ForwardRefExoticComponent<AttachmentMediaProps & React.RefAttributes<HTMLDivElement>>;
export declare const AttachmentContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const AttachmentTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const AttachmentDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const AttachmentActions: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const AttachmentAction: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

export interface AttachmentTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  render?: React.ReactElement | ((props: React.ButtonHTMLAttributes<HTMLButtonElement> & { ref?: React.ForwardedRef<HTMLElement> }) => React.ReactElement);
}
export declare const AttachmentTrigger: React.ForwardRefExoticComponent<AttachmentTriggerProps & React.RefAttributes<HTMLElement>>;
export declare const AttachmentGroup: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
