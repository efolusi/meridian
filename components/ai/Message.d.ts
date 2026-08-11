import type * as React from 'react';

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Alignment within the conversation. @default 'start' */
  align?: 'start' | 'end';
}

export declare const Message: React.ForwardRefExoticComponent<MessageProps & React.RefAttributes<HTMLDivElement>>;
export declare const MessageGroup: React.ForwardRefExoticComponent<MessageProps & React.RefAttributes<HTMLDivElement>>;
export declare const MessageAvatar: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const MessageContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const MessageHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const MessageFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
