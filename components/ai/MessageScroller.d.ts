import type * as React from 'react';

export interface MessageScrollerProviderProps {
  autoScroll?: boolean;
  defaultScrollPosition?: 'start' | 'end' | 'last-anchor';
  preserveScrollOnPrepend?: boolean;
  scrollPreviousItemPeek?: number;
  children?: React.ReactNode;
}
export declare function MessageScrollerProvider(props: MessageScrollerProviderProps): React.JSX.Element;
export declare const MessageScroller: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const MessageScrollerViewport: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const MessageScrollerContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export interface MessageScrollerItemProps extends React.HTMLAttributes<HTMLDivElement> { messageId?: string | number; scrollAnchor?: boolean; }
export declare const MessageScrollerItem: React.ForwardRefExoticComponent<MessageScrollerItemProps & React.RefAttributes<HTMLDivElement>>;
export interface MessageScrollerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { direction?: 'start' | 'end'; }
export declare const MessageScrollerButton: React.ForwardRefExoticComponent<MessageScrollerButtonProps & React.RefAttributes<HTMLButtonElement>>;
export interface MessageScrollerCommands { scrollToStart: (options?: ScrollToOptions) => void; scrollToEnd: (options?: ScrollToOptions) => void; scrollToMessage: (messageId: string | number, options?: ScrollToOptions & { offset?: number }) => boolean; }
export declare function useMessageScroller(): MessageScrollerCommands;
export declare function useMessageScrollerVisibility(): { currentAnchorId: string | null; visibleMessageIds: string[] };
export declare function useMessageScrollerScrollable(): { start: boolean; end: boolean };
